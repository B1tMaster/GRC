import { ZeroxOutput } from '@/server/services/pdf-parser/zerox'
import { Control, NormalizedPageAfterOCRCommon } from '../common/types'
import { ParsedPage } from './types'
import { ParseSchema, type ParsedPageContent } from './ocr-prompt'
import { z } from 'zod'
import { mergePageRanges } from '../common/utils'
import { estimateTokens } from '../common/tokenUtils'
import { generateNormalizedControls } from './ai-normalize'

export const normalizePCIDSSPagesAfterOCR = (parsedFile: ZeroxOutput): NormalizedPageAfterOCRCommon[] => {
  return parsedFile.pages
    .map(p => {
      const content = JSON.parse(p.content) as ParsedPageContent
      if (content.lackOfInformation) {
        return null
      }

      return {
        content: content.content,
        pdfPage: p.page,
        tableOfContents: content.tableOfContents,
        pageNumber: content.pageNumber,
      }
    })
    .filter(p => p !== null) as NormalizedPageAfterOCRCommon[]
}

export const normalizePCIDSSPages = async (traceId: string, pages: NormalizedPageAfterOCRCommon[], tableOfContents: string | null | undefined): Promise<Control[]> => {
  const TOKEN_THRESHOLD = 5000
  const controlsMap = new Map<string, Control>()

  // Group pages into batches that don't exceed the token threshold
  const batches: Array<Array<NormalizedPageAfterOCRCommon>> = []
  let currentBatch: Array<NormalizedPageAfterOCRCommon> = []
  let currentTokenCount = 0

  // First, fill up the batches by pages considering the token threshold
  for (const page of pages) {
    if (!page.pageNumber) {
      continue
    }
    // Use the token estimation function instead of character approximation
    const estimatedTokens = estimateTokens(page.content || '', 'gpt-4o')

    if (currentTokenCount + estimatedTokens > TOKEN_THRESHOLD && currentBatch.length > 0) {
      batches.push([...currentBatch])
      currentBatch = [page]
      currentTokenCount = estimatedTokens
    } else {
      currentBatch.push(page)
      currentTokenCount += estimatedTokens
    }
  }

  // Add the last batch if it's not empty
  if (currentBatch.length > 0) {
    batches.push([...currentBatch])
  }

  if (batches.length === 0) {
    return []
  }

  // Process each batch
  for (const batch of batches) {
    // Format the userPrompt as expected by the NormalizeParsedDocument function
    const userPrompt = batch
      .map(
        page => `PDF Page number: 
\`\`\`
${page.pdfPage}
\`\`\`
Doc page number: 
\`\`\`
${page.pageNumber}
\`\`\`
Page content: 
\`\`\`
${page.content || 'None'}
\`\`\`
`
      )
      .join('\n===\n')

    const result = await generateNormalizedControls({
      userPrompt,
      traceId,
      tableOfContents,
    })

    // Process normalized controls
    if (result?.controls) {
      for (const control of result.controls) {
        const controlId = control?.id

        if (!controlId) {
          continue
        }

        if (controlsMap.has(controlId)) {
          // Control already exists, merge enhancements
          const existingControl = controlsMap.get(controlId)!

          if (existingControl.content && control.content) {
            existingControl.content += `\n\n${control.content}`
          } else if (control.content) {
            existingControl.content = control.content
          }

          // Update page range
          if (control.docPagesRange) {
            existingControl.docPagesRange = existingControl.docPagesRange ? mergePageRanges(existingControl.docPagesRange, control.docPagesRange) : control.docPagesRange
          }
        } else {
          // New control, add to map
          controlsMap.set(controlId, control as Control)
        }
      }
    }
  }

  // Convert map to array
  return Array.from(controlsMap.values())
}
