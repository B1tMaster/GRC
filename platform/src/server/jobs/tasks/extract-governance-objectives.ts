import crypto from 'crypto'
import { Field, Payload, TaskHandler } from 'payload'
import { sendGeneralLlmRequest } from '@/server/llm/general-llm/request'
import { modelNames } from '@/server/llm/general-llm/mappings'
import { GOVERNANCE_OBJECTIVES_SYSTEM_PROMPT } from '@/server/llm/workflows/grc/prompts'
import { GovernanceObjectivesResponseSchema } from '@/server/llm/workflows/grc/schemas'
import type { GovernanceObjectivesResponse } from '@/server/llm/workflows/grc/schemas'
import { truncateDocumentText } from '@/server/lib/document-text'
import { findDocumentById, updateDocument, buildSourceDocumentRelation, asSourceDocumentType } from '@/server/lib/payload-helpers'

export const extractGovernanceObjectivesInputSchema: Field[] = [
  { name: 'docId', type: 'text', required: true },
  { name: 'collectionSlug', type: 'text', required: true },
  { name: 'traceId', type: 'text', required: true },
]

export const extractGovernanceObjectivesOutputSchema: Field[] = [
  { name: 'success', type: 'checkbox', required: true },
  { name: 'message', type: 'text' },
  { name: 'objectivesCreated', type: 'number' },
]

interface Input { docId: string | number; collectionSlug: string; traceId: string }
interface Output { success: boolean; message?: string; objectivesCreated?: number }

export const extractGovernanceObjectivesHandler: TaskHandler<'extract-governance-objectives'> = async ({
  input,
  req: { payload },
}: {
  input: Input
  req: { payload: Payload }
}): Promise<{ output: Output }> => {
  try {
    const { docId, collectionSlug, traceId } = input
    const doc = await findDocumentById(payload, collectionSlug, docId)

    if (!doc?.parsedText) {
      throw new Error(`Document ${docId} has no parsed text`)
    }

    await updateDocument(payload, collectionSlug, docId, { extractionStatus: 'extracting' })

    const generationId = `grc-extract-gov-${traceId}`

    const { text: truncatedText, wasTruncated } = truncateDocumentText(doc.parsedText, { preserveParagraphs: true })
    if (wasTruncated) {
      payload.logger.info(`Document ${docId} text truncated from ${doc.parsedText.length} chars for extraction`)
    }

    const result = await sendGeneralLlmRequest<GovernanceObjectivesResponse>({
      name: 'extract-governance-objectives',
      systemPrompt: GOVERNANCE_OBJECTIVES_SYSTEM_PROMPT,
      userPrompt: `Extract governance objectives from the following document:\n\nTitle: ${doc.title}\nOrganization: ${doc.organization || 'Unknown'}\n\n---\n\n${truncatedText}`,
      schema: GovernanceObjectivesResponseSchema,
      temperature: 0.3,
      generationId,
      modelName: modelNames.fast,
    })

    let objectivesCreated = 0
    for (const obj of result.objectives) {
      const objectiveId = `GOV-${String(++objectivesCreated).padStart(4, '0')}-${crypto.randomUUID().slice(0, 8)}`

      await payload.create({
        collection: 'governance-objectives',
        data: {
          objectiveId,
          text: obj.text,
          sourceDocumentType: asSourceDocumentType(collectionSlug),
          sourceDocument: buildSourceDocumentRelation(collectionSlug, docId),
          sourceSection: obj.sourceSection,
          sourceSectionType: obj.sourceSectionType,
          extractionConfidence: obj.extractionConfidence,
          keywords: obj.keywords,
          reviewStatus: 'pending',
        },
      })

      await payload.create({
        collection: 'audit-trail-entries',
        data: {
          traceId,
          eventType: 'objectives_extracted',
          entityType: 'governance-objectives',
          entityId: objectiveId,
          actor: { type: 'ai_agent', agentName: 'governance-objective-extractor' },
          details: { confidence: obj.extractionConfidence, keywords: obj.keywords },
          sourceTrace: {
            sourceDocumentCollection: collectionSlug,
            sourceDocumentId: String(docId),
            sourceSection: obj.sourceSection,
            sourceText: obj.text.slice(0, 500),
          },
        },
      })
    }

    payload.logger.info(`Extracted ${objectivesCreated} governance objectives from ${collectionSlug}/${docId}`)

    return {
      output: {
        success: true,
        message: `Extracted ${objectivesCreated} governance objectives`,
        objectivesCreated,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    payload.logger.error(`Error extracting governance objectives: ${message}`)
    return { output: { success: false, message } }
  }
}
