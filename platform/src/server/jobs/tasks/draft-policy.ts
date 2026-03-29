import crypto from 'crypto'
import { Field, Payload, TaskHandler } from 'payload'
import { sendGeneralLlmRequest } from '@/server/llm/general-llm/request'
import { modelNames } from '@/server/llm/general-llm/mappings'
import {
  POLICY_DRAFTING_SYSTEM_PROMPT,
  buildPolicyDraftUserPrompt,
} from '@/server/llm/workflows/grc/policy-draft-prompts'
import { PolicyDraftResponseSchema } from '@/server/llm/workflows/grc/policy-draft-schemas'
import type { PolicyDraftResponse } from '@/server/llm/workflows/grc/policy-draft-schemas'
import { truncateDocumentText } from '@/server/lib/document-text'
import { findDocumentById } from '@/server/lib/payload-helpers'
import type { PolicyGapAnalysis } from '@/payload-types'

export const draftPolicyInputSchema: Field[] = [
  { name: 'docId', type: 'text', required: true },
  { name: 'collectionSlug', type: 'text', required: true },
  { name: 'traceId', type: 'text', required: true },
]

export const draftPolicyOutputSchema: Field[] = [
  { name: 'success', type: 'checkbox', required: true },
  { name: 'message', type: 'text' },
  { name: 'draftsCreated', type: 'number' },
]

interface Input { docId: string | number; collectionSlug: string; traceId: string }
interface Output { success: boolean; message?: string; draftsCreated?: number }

export const draftPolicyHandler: TaskHandler<'draft-policy'> = async ({
  input,
  req: { payload },
}: {
  input: Input
  req: { payload: Payload }
}): Promise<{ output: Output }> => {
  try {
    const { docId, collectionSlug, traceId } = input

    const doc = await findDocumentById(payload, collectionSlug, docId)

    const gaps = await payload.find({
      collection: 'policy-gap-analyses',
      where: { sourceRun: { equals: traceId } },
      limit: 50,
    })

    if (gaps.docs.length === 0) {
      return {
        output: { success: true, message: 'No gaps found to draft policies for', draftsCreated: 0 },
      }
    }

    const policyText = doc?.parsedText
      ? truncateDocumentText(doc.parsedText as string, { maxChars: 80_000, preserveParagraphs: true }).text
      : ''

    let draftsCreated = 0

    for (const gap of gaps.docs) {
      const gapData = gap as PolicyGapAnalysis
      const frameworksStr = Array.isArray(gapData.frameworksAffected)
        ? gapData.frameworksAffected
            .map((f) => `${f.frameworkName} ${f.sectionRef}`)
            .join(', ')
        : 'Unknown frameworks'

      const generationId = `draft-policy-${traceId}-${gap.id}`

      const result = await sendGeneralLlmRequest<PolicyDraftResponse>({
        name: 'draft-policy',
        systemPrompt: POLICY_DRAFTING_SYSTEM_PROMPT,
        userPrompt: buildPolicyDraftUserPrompt({
          gapPolicyName: gapData.policyName || 'Unknown Policy',
          gapDescription: gapData.gapDescription || '',
          frameworksAffected: frameworksStr,
          existingPolicyText: policyText,
          priority: gapData.priority || 'Medium',
        }),
        schema: PolicyDraftResponseSchema,
        temperature: 0.3,
        generationId,
        modelName: modelNames.fast,
      })

      const draftId = `DRF-${String(++draftsCreated).padStart(4, '0')}-${crypto.randomUUID().slice(0, 8)}`
      const isLowConfidence = result.overallConfidence < 0.7

      await payload.create({
        collection: 'policy-drafts',
        data: {
          draftId,
          policyName: result.policyName,
          version: result.version,
          sections: result.sections.map((s) => ({
            type: s.type,
            sectionNumber: s.sectionNumber,
            title: s.title,
            content: s.content,
            previousContent: s.previousContent,
            citations: s.citations?.map((c) => ({
              frameworkName: c.frameworkName,
              sectionRef: c.sectionRef,
              description: c.description,
            })),
            confidence: s.confidence,
          })),
          overallConfidence: result.overallConfidence,
          humanDraftRequired: isLowConfidence,
          humanDraftReason: result.humanDraftReason || (isLowConfidence ? 'Confidence below 70% threshold' : undefined),
          rationale: {
            whyNeeded: result.rationale.whyNeeded,
            frameworksMandating: result.rationale.frameworksMandating,
            relatedArtifactImpact: result.rationale.relatedArtifactImpact,
          },
          sourceGap: gap.id,
          sourceRun: traceId,
          status: isLowConfidence ? 'human-draft-required' : 'draft',
        },
      })

      await payload.create({
        collection: 'decision-logs',
        data: {
          traceId,
          action: `Drafted policy: ${result.policyName} ${result.version} (${result.sections.length} sections, confidence: ${Math.round(result.overallConfidence * 100)}%)`,
          entityType: 'policy-draft',
          entityId: draftId,
          agentType: 'policy_drafter',
          input: {
            gapId: gapData.gapId,
            policyName: gapData.policyName,
            priority: gapData.priority,
          },
          output: {
            sectionsCount: result.sections.length,
            overallConfidence: result.overallConfidence,
            humanDraftRequired: isLowConfidence,
          },
          reasoning: result.rationale.whyNeeded?.join('; ') || '',
          confidence: result.overallConfidence,
        },
      })

      await payload.create({
        collection: 'audit-trail-entries',
        data: {
          traceId,
          eventType: 'policy_draft_created',
          entityType: 'policy-drafts',
          entityId: draftId,
          actor: { type: 'ai_agent', agentName: 'policy-drafter' },
          details: {
            policyName: result.policyName,
            version: result.version,
            sectionsCount: result.sections.length,
            overallConfidence: result.overallConfidence,
            humanDraftRequired: isLowConfidence,
            citationsCount: result.sections.reduce(
              (sum: number, s) => sum + (s.citations?.length || 0), 0,
            ),
          },
          sourceTrace: {
            sourceDocumentCollection: collectionSlug,
            sourceDocumentId: String(docId),
          },
        },
      })
    }

    payload.logger.info(
      `Policy drafting complete for ${collectionSlug}/${docId}: ${draftsCreated} drafts created`,
    )

    return {
      output: {
        success: true,
        message: `Created ${draftsCreated} policy drafts`,
        draftsCreated,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    payload.logger.error(`Error in policy drafting: ${message}`)
    return { output: { success: false, message } }
  }
}
