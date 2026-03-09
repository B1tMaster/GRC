import { Payload } from 'payload'
import { z } from 'zod'
import { ZeroxOutput } from '@/server/services/pdf-parser/zerox'
/**
 * Represents a normalized control from an authoritative document
 */
export interface Control {
  id: string
  title: string
  content?: string
  methodology?: string
  suite?: {
    id: string
    name: string
  }
  docPagesRange?: string
  pdfPagesRange?: string
}

export const IngestAuthoritativeDocPropsSchema = z.object({
  filePath: z.string(),
  pagesRange: z.array(z.number()).optional(),
  docId: z.number(),
  docType: z.string(),
  traceId: z.string(),
})

export type IngestAuthoritativeDocProps = z.infer<typeof IngestAuthoritativeDocPropsSchema>

// Define types for the normalizePages function
// ParsedPage type has been moved to nist800-53/types.ts

/**
 * Bookmark item from PDF parsing
 */
export type BookmarkItem = {
  page_number: number
  title: string
}

/**
 * Response structure for table of contents processing
 */
export type TableOfContentsResponse = {
  lackOfInformation?: boolean
  tableOfContents?: string
}

export type NormalizedPageAfterOCRCommon = Record<string, any> & {
  content?: string
  pdfPage: number
  tableOfContents: boolean
}

/**
 * Interface defining methods required for document-specific processing
 */
export interface IAuthoritativeDocumentProcessor {
  /**
   * Gets the LLM prompt for PDF parsing
   * @returns The prompt string for the specific document type
   */
  getLlmPrompt: () => string

  /**
   * Gets the Zod schema for parsing
   * @returns The Zod schema for validating parsed data
   */
  getParseSchema: () => z.ZodType<any, any, any>

  /**
   * Normalizes the parsed pages after OCR
   * @param parsedFile The parsed file output from the PDF parser
   * @returns Array of normalized pages after OCR processing
   */
  normalizePagesAfterOCR: (parsedFile: ZeroxOutput) => NormalizedPageAfterOCRCommon[]

  /**
   * Normalizes the parsed pages/content
   * @param generationId The ID for tracking generation
   * @param pages Array of normalized pages after OCR
   * @param tableOfContents Optional table of contents string
   * @returns Array of normalized controls
   */
  normalizeParsedPages: (traceId: string, pages: NormalizedPageAfterOCRCommon[], tableOfContents?: string | null | undefined) => Promise<Control[]>

  /**
   * Maps normalized data to Payload test case/suite structures
   * @param payload The Payload CMS instance
   * @param controls The normalized controls
   * @param docId The document ID
   * @param traceId The trace ID for tracking
   * @returns void as this method performs side effects in Payload CMS
   */
  mapToPayloadStructures: (payload: Payload, controls: Control[], docId: number, traceId: string) => Promise<void>

  /**
   * Optional method to handle document-specific TOC/bookmark logic
   * @param bookmarks The bookmarks from the PDF
   * @param generationId The generation trace ID
   * @returns Processed table of contents
   */
  processTableOfContents?: (bookmarks: BookmarkItem[], generationId: string) => Promise<TableOfContentsResponse | null | undefined>
}
