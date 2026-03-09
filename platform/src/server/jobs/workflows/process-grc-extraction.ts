import { Field, WorkflowConfig } from 'payload'
import { langfuse } from '@/server/llm/observability/langfuse'

export const processGrcExtractionInputSchema: Field[] = [
  {
    name: 'traceId',
    type: 'text',
    required: true,
  },
  {
    name: 'docId',
    type: 'text',
    required: true,
  },
  {
    name: 'collectionSlug',
    type: 'text',
    required: true,
  },
]

export const processGrcExtractionWorkflow = {
  slug: 'process-grc-extraction',
  label: 'Process GRC Extraction',
  inputSchema: processGrcExtractionInputSchema,

  handler: async ({ job, tasks, req }) => {
    const { traceId, docId, collectionSlug } = job.input
    const payload = req.payload

    const trace = langfuse.trace({
      id: traceId,
      name: `grc-extraction-workflow-${collectionSlug}`,
      input: { docId, collectionSlug },
    })

    payload.logger.info(`Starting GRC extraction workflow for ${collectionSlug}/${docId}`)

    try {
      await payload.create({
        collection: 'audit-trail-entries',
        data: {
          traceId,
          eventType: 'extraction_workflow_started',
          entityType: collectionSlug,
          entityId: String(docId),
          actor: { type: 'system' },
          details: { workflow: 'process-grc-extraction' },
        },
      })

      // Step 1: Ingest (parse) the document
      const ingestTaskSlug = collectionSlug === 'board-circulars'
        ? 'ingest-board-circular'
        : 'ingest-annual-report'

      const ingestResult = await tasks[ingestTaskSlug](`ingest-${docId}`, {
        input: { docId },
      })

      if (!ingestResult?.output?.success) {
        throw new Error(`Document ingestion failed: ${ingestResult?.output?.message}`)
      }

      trace.update({ output: { step: 'ingest', status: 'complete' } })

      // Step 2: Extract governance objectives
      const govResult = await tasks['extract-governance-objectives'](`extract-gov-${docId}`, {
        input: { docId, collectionSlug, traceId },
      })

      const objectivesCreated = govResult?.output?.objectivesCreated ?? 0
      trace.update({ output: { step: 'extract-governance', objectivesCreated } })

      // Step 3: Extract risk appetite statements
      const riskResult = await tasks['extract-risk-appetite'](`extract-risk-${docId}`, {
        input: { docId, collectionSlug, traceId },
      })

      const statementsCreated = riskResult?.output?.statementsCreated ?? 0
      trace.update({ output: { step: 'extract-risk', statementsCreated } })

      // Step 4: For each governance objective — derive controls and map to frameworks
      const govObjectives = await payload.find({
        collection: 'governance-objectives',
        where: {
          'sourceDocument.value': { equals: docId },
        },
        limit: 100,
      })

      let totalControls = 0
      let totalMappings = 0

      for (const govObj of govObjectives.docs) {
        // 4a: Derive control objectives
        const ctrlResult = await tasks['extract-control-objectives'](
          `extract-ctrl-${govObj.id}`,
          { input: { governanceObjectiveId: govObj.id, traceId } }
        )
        totalControls += ctrlResult?.output?.controlsCreated ?? 0

        // 4b: Map to frameworks
        const mapResult = await tasks['map-to-framework'](
          `map-fw-${govObj.id}`,
          { input: { governanceObjectiveId: govObj.id, traceId } }
        )
        totalMappings += mapResult?.output?.mappingsCreated ?? 0
      }

      trace.update({ output: { step: 'derive-and-map', totalControls, totalMappings } })

      // Step 5: Mark document as complete
      await payload.update({
        collection: collectionSlug as any,
        id: docId,
        data: { extractionStatus: 'complete' },
      })

      await payload.create({
        collection: 'audit-trail-entries',
        data: {
          traceId,
          eventType: 'extraction_workflow_completed',
          entityType: collectionSlug,
          entityId: String(docId),
          actor: { type: 'system' },
          details: {
            objectivesCreated,
            statementsCreated,
            controlsCreated: totalControls,
            frameworkMappings: totalMappings,
          },
        },
      })

      trace.update({
        output: {
          status: 'COMPLETED',
          objectivesCreated,
          statementsCreated,
          totalControls,
          totalMappings,
        },
      })

      payload.logger.info(
        `GRC extraction complete for ${collectionSlug}/${docId}: ` +
        `${objectivesCreated} objectives, ${statementsCreated} risk statements, ` +
        `${totalControls} controls, ${totalMappings} mappings`
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      payload.logger.error(`GRC extraction workflow failed for ${collectionSlug}/${docId}: ${errorMessage}`)

      try {
        await payload.update({
          collection: collectionSlug as any,
          id: docId,
          data: { extractionStatus: 'error', errorMessage },
        })

        await payload.create({
          collection: 'audit-trail-entries',
          data: {
            traceId,
            eventType: 'extraction_workflow_failed',
            entityType: collectionSlug,
            entityId: String(docId),
            actor: { type: 'system' },
            details: { error: errorMessage },
          },
        })
      } catch { /* best effort */ }

      trace.update({ output: { status: 'FAILED', error: errorMessage } })
      throw error
    }
  },
} as WorkflowConfig<'process-grc-extraction'>

export default processGrcExtractionWorkflow
