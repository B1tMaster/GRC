import crypto from 'crypto'
import { Field, Payload, TaskHandler } from 'payload'
import { sendGeneralLlmRequest } from '@/server/llm/general-llm/request'
import { modelNames } from '@/server/llm/general-llm/mappings'
import { FRAMEWORK_RESEARCH_SYSTEM_PROMPT } from '@/server/llm/workflows/policy-agent/prompts'
import { FrameworkResearchResponseSchema, type FrameworkResearchResponse } from '@/server/llm/workflows/policy-agent/framework-research-schemas'
import { ALL_FRAMEWORK_CONTROLS } from '@/server/handlers/grc-extraction/framework-catalog'

export const researchPolicyFrameworksInputSchema: Field[] = [
  { name: 'runId', type: 'text', required: true },
]

export const researchPolicyFrameworksOutputSchema: Field[] = [
  { name: 'success', type: 'checkbox', required: true },
  { name: 'message', type: 'text' },
  { name: 'totalMappings', type: 'number' },
]

interface Input { runId: string }
interface Output { success: boolean; message?: string; totalMappings?: number }

function buildFrameworkCatalogContext(): string {
  const byFramework = new Map<string, typeof ALL_FRAMEWORK_CONTROLS>()
  for (const ctrl of ALL_FRAMEWORK_CONTROLS) {
    const list = byFramework.get(ctrl.framework) || []
    list.push(ctrl)
    byFramework.set(ctrl.framework, list)
  }

  const sections: string[] = []
  for (const [fw, controls] of byFramework) {
    const lines = controls.map(c =>
      `  - ${c.controlId}: ${c.controlName} [${c.domain || 'General'}] — ${c.description}`
    )
    sections.push(`=== ${fw} ===\n${lines.join('\n')}`)
  }
  return sections.join('\n\n')
}

export const researchPolicyFrameworksHandler: TaskHandler<'research-policy-frameworks'> = async ({
  input,
  req: { payload },
}: {
  input: Input
  req: { payload: Payload }
}): Promise<{ output: Output }> => {
  const { runId } = input
  const traceId = `policy-fw-research-${runId}-${crypto.randomUUID().slice(0, 8)}`

  try {
    const run = await payload.findByID({ collection: 'policy-agent-runs', id: runId })
    if (!run) throw new Error(`Policy agent run ${runId} not found`)

    const stepResults = (run.stepResults as Record<string, any>) || {}
    const extractedObjectives = stepResults.extract_objectives?.objectives
    if (!extractedObjectives || extractedObjectives.length === 0) {
      throw new Error('No extracted objectives found. Run objective extraction first.')
    }

    await payload.update({
      collection: 'policy-agent-runs',
      id: runId,
      data: { currentStep: 'research_frameworks' },
    })

    const objectivesContext = extractedObjectives.map((obj: any, idx: number) =>
      `${idx + 1}. [${obj.category}] "${obj.theme}" — ${obj.description} (confidence: ${obj.confidence}%)`
    ).join('\n')

    const catalogContext = buildFrameworkCatalogContext()

    const generationId = `policy-fw-research-${traceId}`

    const result: FrameworkResearchResponse = await sendGeneralLlmRequest({
      name: 'research-policy-frameworks',
      systemPrompt: FRAMEWORK_RESEARCH_SYSTEM_PROMPT,
      userPrompt: `Map the following ${extractedObjectives.length} governance objectives to relevant framework controls.\n\n## EXTRACTED OBJECTIVES\n${objectivesContext}\n\n## AVAILABLE FRAMEWORK CONTROLS\n${catalogContext}\n\nProduce mappings for each objective and a cross-framework mapping table by domain.`,
      schema: FrameworkResearchResponseSchema,
      temperature: 0.3,
      generationId,
      modelName: modelNames.fast,
    })

    const totalMappings = result.objectiveMappings.reduce(
      (sum, om) => sum + om.mappings.length, 0
    )

    const avgRelevance = totalMappings > 0
      ? result.objectiveMappings.reduce(
          (sum, om) => sum + om.mappings.reduce((s, m) => s + m.relevance, 0), 0
        ) / totalMappings
      : 0

    await payload.create({
      collection: 'decision-logs',
      data: {
        traceId,
        action: 'policy_frameworks_researched',
        entityType: 'policy-agent-runs',
        entityId: String(runId),
        agentType: 'policy_framework_researcher',
        input: {
          objectiveCount: extractedObjectives.length,
          frameworksResearched: result.frameworksResearched,
        },
        output: {
          totalMappings,
          crossFrameworkDomains: result.crossFrameworkTable.length,
          objectiveMappings: result.objectiveMappings,
        },
        reasoning: result.researchSummary,
        confidence: avgRelevance,
        modelUsed: modelNames.fast,
      },
    })

    await payload.create({
      collection: 'audit-trail-entries',
      data: {
        traceId,
        eventType: 'framework_mapped',
        entityType: 'policy-agent-runs',
        entityId: String(runId),
        actor: { type: 'ai_agent', agentName: 'policy-framework-researcher' },
        details: {
          totalMappings,
          frameworksResearched: result.frameworksResearched,
          crossFrameworkDomains: result.crossFrameworkTable.map(r => r.domain),
          avgRelevance: Math.round(avgRelevance * 100),
        },
      },
    })

    await payload.update({
      collection: 'policy-agent-runs',
      id: runId,
      data: {
        stepResults: {
          ...stepResults,
          research_frameworks: {
            completedAt: new Date().toISOString(),
            traceId,
            researchSummary: result.researchSummary,
            totalMappings,
            frameworksResearched: result.frameworksResearched,
            objectiveMappings: result.objectiveMappings,
            crossFrameworkTable: result.crossFrameworkTable,
          },
        },
      },
    })

    payload.logger.info(`Framework research complete for run ${runId}: ${totalMappings} mappings across ${result.frameworksResearched.length} frameworks`)

    return {
      output: {
        success: true,
        message: `Mapped ${extractedObjectives.length} objectives to ${totalMappings} framework controls across ${result.frameworksResearched.length} frameworks`,
        totalMappings,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    payload.logger.error(`Error researching policy frameworks for run ${runId}: ${message}`)

    try {
      await payload.update({
        collection: 'policy-agent-runs',
        id: runId,
        data: { status: 'error', errorMessage: message },
      })

      await payload.create({
        collection: 'audit-trail-entries',
        data: {
          traceId,
          eventType: 'extraction_workflow_failed',
          entityType: 'policy-agent-runs',
          entityId: String(runId),
          actor: { type: 'ai_agent', agentName: 'policy-framework-researcher' },
          details: { error: message, step: 'research_frameworks' },
        },
      })
    } catch { /* best effort */ }

    return { output: { success: false, message } }
  }
}
