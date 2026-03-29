import crypto from 'crypto'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { handlePreflight, corsHeaders } from '@/lib/cors'

export const OPTIONS = handlePreflight

const PIPELINE_STEPS = [
  { name: 'ingest', label: 'Document Ingestion' },
  { name: 'extract-governance', label: 'Objective Extraction' },
  { name: 'extract-risk', label: 'Risk Appetite Extraction' },
  { name: 'derive-and-map', label: 'Control Derivation & Framework Mapping' },
  { name: 'gap-analysis', label: 'Gap Analysis' },
  { name: 'policy-drafting', label: 'Policy Drafting' },
]

export const POST = async (req: Request) => {
  const headers = corsHeaders(req)

  try {
    const payload = await getPayload({ config: configPromise })
    const body = await req.json()

    const { docId, collectionSlug } = body

    if (!docId || !collectionSlug) {
      return Response.json(
        { error: 'Missing required fields: docId, collectionSlug' },
        { status: 400, headers },
      )
    }

    const validSlugs = ['board-circulars', 'annual-reports']
    if (!validSlugs.includes(collectionSlug)) {
      return Response.json(
        { error: `Invalid collectionSlug. Must be one of: ${validSlugs.join(', ')}` },
        { status: 400, headers },
      )
    }

    try {
      await payload.findByID({ collection: collectionSlug as any, id: docId })
    } catch {
      return Response.json({ error: `Document ${docId} not found` }, { status: 404, headers })
    }

    const runId = `RUN-${crypto.randomUUID().slice(0, 8)}`
    const traceId = `trace-${crypto.randomUUID()}`
    const now = new Date().toISOString()

    const pipelineRun = await payload.create({
      collection: 'pipeline-runs',
      data: {
        runId,
        sourceDocument: { relationTo: collectionSlug, value: docId },
        collectionSlug,
        traceId,
        status: 'running',
        currentStep: 'ingest',
        steps: PIPELINE_STEPS.map((step, i) => ({
          name: step.name,
          label: step.label,
          status: i === 0 ? 'active' : 'pending',
          startedAt: i === 0 ? now : undefined,
        })),
        startedAt: now,
      },
    })

    executeRunInBackground(payload, pipelineRun.id, runId, docId, collectionSlug, traceId)

    return Response.json({
      runId,
      pipelineRunId: pipelineRun.id,
      traceId,
      status: 'running',
      message: 'Pipeline started successfully',
    }, { headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500, headers })
  }
}

async function executeRunInBackground(
  payload: any,
  pipelineRunDbId: string | number,
  runId: string,
  docId: string | number,
  collectionSlug: string,
  traceId: string,
) {
  const startTime = Date.now()

  const updateStep = async (stepName: string, status: string, output?: any, error?: string) => {
    try {
      const run = await payload.findByID({ collection: 'pipeline-runs', id: pipelineRunDbId })
      const steps = (run.steps || []).map((s: any) => {
        if (s.name === stepName) {
          return {
            ...s,
            status,
            ...(status === 'active' ? { startedAt: new Date().toISOString() } : {}),
            ...(status === 'complete' || status === 'error'
              ? { completedAt: new Date().toISOString() }
              : {}),
            ...(output ? { output } : {}),
            ...(error ? { error } : {}),
          }
        }
        return s
      })

      const nextIdx = steps.findIndex((s: any) => s.name === stepName) + 1
      if (status === 'complete' && nextIdx < steps.length) {
        steps[nextIdx] = { ...steps[nextIdx], status: 'active', startedAt: new Date().toISOString() }
      }

      const currentStep =
        status === 'complete' && nextIdx < steps.length
          ? steps[nextIdx].name
          : stepName

      await payload.update({
        collection: 'pipeline-runs',
        id: pipelineRunDbId,
        data: { steps, currentStep },
      })
    } catch (e) {
      payload.logger.error(`Failed to update step ${stepName}: ${e}`)
    }
  }

  try {
    await payload.jobs.queue({
      workflow: 'process-grc-extraction',
      input: { traceId, docId: String(docId), collectionSlug },
    })

    await payload.jobs.run()

    const auditEntries = await payload.find({
      collection: 'audit-trail-entries',
      where: { traceId: { equals: traceId } },
      sort: '-createdAt',
      limit: 1,
    })

    const completedEntry = auditEntries.docs.find(
      (e: any) => e.eventType === 'extraction_workflow_completed',
    )

    const allStepsComplete = (run: any) =>
      run.steps.map((s: any) => ({ ...s, status: 'complete', completedAt: new Date().toISOString() }))

    const run = await payload.findByID({ collection: 'pipeline-runs', id: pipelineRunDbId })
    const elapsedMs = Date.now() - startTime

    const results = completedEntry?.details || {}

    await payload.update({
      collection: 'pipeline-runs',
      id: pipelineRunDbId,
      data: {
        status: 'completed',
        currentStep: undefined,
        steps: allStepsComplete(run),
        completedAt: new Date().toISOString(),
        elapsedMs,
        results: {
          objectivesCreated: results.objectivesCreated ?? 0,
          statementsCreated: results.statementsCreated ?? 0,
          controlsCreated: results.controlsCreated ?? 0,
          frameworkMappings: results.frameworkMappings ?? 0,
          gapsIdentified: results.gapsIdentified ?? 0,
          draftsCreated: results.policyDrafts ?? 0,
        },
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const elapsedMs = Date.now() - startTime

    await payload.update({
      collection: 'pipeline-runs',
      id: pipelineRunDbId,
      data: {
        status: 'failed',
        completedAt: new Date().toISOString(),
        elapsedMs,
        error: message,
      },
    })
  }
}

export const GET = async (req: Request) => {
  const headers = corsHeaders(req)

  try {
    const payload = await getPayload({ config: configPromise })

    const runs = await payload.find({
      collection: 'pipeline-runs',
      sort: '-createdAt',
      limit: 20,
    })

    return Response.json({
      runs: runs.docs.map((r: any) => ({
        id: r.id,
        runId: r.runId,
        status: r.status,
        currentStep: r.currentStep,
        startedAt: r.startedAt,
        completedAt: r.completedAt,
        elapsedMs: r.elapsedMs,
      })),
    }, { headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500, headers })
  }
}
