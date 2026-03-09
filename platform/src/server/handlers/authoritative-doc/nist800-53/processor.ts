import { IAuthoritativeDocumentProcessor, Control, BookmarkItem, TableOfContentsResponse, NormalizedPageAfterOCRCommon } from '../common/types'
import { ParsedPage } from './types'
import { NIST80053OCRPrompt, ParseSchema } from './ocr-prompt'
import { normalizeNIST80053Pages, normalizeNIST80053PagesAfterOCR } from './normalize'
import { Payload } from 'payload'
import configPromise from '@payload-config'
import { handleBookmarks } from '../common'
import { z } from 'zod'
import { ZeroxOutput } from '@/server/services/pdf-parser/zerox'
/**
 * Processor implementation for NIST 800-53 documents
 */
export class NIST80053Processor implements IAuthoritativeDocumentProcessor {
  /**
   * Gets the LLM prompt for NIST 800-53 PDF parsing
   */
  getLlmPrompt(): string {
    return NIST80053OCRPrompt
  }

  /**
   * Gets the Zod schema for parsing NIST 800-53 documents
   */
  getParseSchema(): z.ZodType<any, any, any> {
    return ParseSchema
  }

  /**
   * Normalizes the parsed NIST 800-53 pages after OCR
   */
  normalizePagesAfterOCR(parsedFile: ZeroxOutput): NormalizedPageAfterOCRCommon[] {
    return normalizeNIST80053PagesAfterOCR(parsedFile)
  }

  /**
   * Normalizes the parsed NIST 800-53 pages/content
   */
  async normalizeParsedPages(generationId: string, pages: NormalizedPageAfterOCRCommon[], tableOfContents?: string | null | undefined): Promise<Control[]> {
    // Convert NormalizedPageAfterOCR to ParsedPage for backward compatibility
    const parsedPages: ParsedPage[] = pages.map(page => ({
      content: page.content || '',
      pdfPage: page.pdfPage,
      // Add any other necessary properties
    }))

    return normalizeNIST80053Pages(generationId, parsedPages, tableOfContents)
  }

  /**
   * Optional method to process table of contents from bookmarks
   */
  async processTableOfContents(bookmarks: BookmarkItem[], generationId: string): Promise<TableOfContentsResponse | null | undefined> {
    return handleBookmarks({
      bookmarks,
      generationId,
    })
  }

  /**
   * Maps normalized NIST 800-53 controls to Payload test case/suite structures
   */
  async mapToPayloadStructures(payload: Payload, controls: Control[], docId: number, traceId: string): Promise<void> {
    const doc = await payload.find({
      collection: 'authoritative-documents',
      where: {
        id: { equals: docId },
      },
    })

    if (!doc.docs.length) {
      throw new Error('Document not found')
    }

    const document = doc.docs[0]

    for (const control of controls) {
      const controlId = `${document.docType}-${control.id.toLowerCase()}`
      const existingControlResponse = await payload.find({
        collection: 'test-cases',
        where: {
          id: { equals: controlId },
        },
      })

      const existingControl = existingControlResponse.docs[0]
      if (existingControl) {
        continue
      }

      // Skip controls without suite information
      if (!control.suite) {
        console.warn(`Control ${control.id} has no suite information, skipping`)
        continue
      }

      const relatedSuiteResponse = await payload.find({
        collection: 'test-suites',
        where: {
          title: { equals: control.suite.name },
        },
      })

      const suiteAlias = `${document.docType}-${control.suite.id.toLowerCase()}`

      let relatedSuite = relatedSuiteResponse.docs[0]

      if (!relatedSuite) {
        relatedSuite = await payload.create({
          collection: 'test-suites',
          data: {
            title: control.suite.name,
            alias: suiteAlias,
            authoritativeDocument: docId,
          },
        })
      }

      // Using any type here due to complex Payload CMS type requirements
      const data: any = {
        id: controlId,
        title: control.title,
        suite: relatedSuite.id,
        content: control.content || null,
        metadata: {
          docPagesRange: control.docPagesRange,
          pdfPagesRange: control.pdfPagesRange,
        },
        methodology: control.methodology || null,
        status: 'published',
      }

      await payload.create({
        collection: 'test-cases',
        data,
      })
    }
  }
}
