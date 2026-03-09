import { IngestAuthoritativeDocProps, Control } from './common/types'
import { fetchAuthoritativeDocument, updateDocumentStatus, readPdfFile, getAuthoritativeDocumentProcessor, handleTableOfContents, updateDocumentTableOfContents } from './common'
import { generateMethodologiesForControls } from './common/methodology'
import { PdfParserService } from '@/server/services/pdf-parser/zerox'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { langfuse } from '@/server/llm/observability/langfuse'
import { zodResponseFormat } from 'openai/helpers/zod.mjs'

/**
 * Main handler for ingesting authoritative documents.
 * Acts as an orchestrator that delegates document-specific logic to specialized processors.
 */
export const IngestAuthoritativeDocHandler = async (props: IngestAuthoritativeDocProps) => {
  const { filePath, pagesRange, docId, traceId } = props

  const payload = await getPayload({
    config: configPromise,
  })

  // Fetch the document details
  const doc = await fetchAuthoritativeDocument(payload, docId)
  const docType = doc.docType

  // Update status to pending
  await updateDocumentStatus(payload, docId, 'pending')

  // Create trace for monitoring
  const trace = langfuse.trace({
    id: traceId,
    name: `Ingest ${docType} Doc`,
    input: {
      docType: docType,
      pages: pagesRange,
    },
  })

  try {
    // Get the appropriate processor for this document type
    const processor = getAuthoritativeDocumentProcessor(docType)

    // Read PDF file (common operation for all document types)
    const fileObj = await readPdfFile(filePath)

    // Parse PDF with document-specific prompt and schema
    const parsedFile = await PdfParserService.parse(fileObj, {
      selectPages: pagesRange,
      customPrompt: processor.getLlmPrompt(),
      schema: zodResponseFormat(processor.getParseSchema(), 'content'),
      generationId: traceId,
    })

    // Verify content was parsed successfully
    const contentLength = parsedFile.pages.reduce((acc, p) => acc + p.content.length, 0)
    if (contentLength === 0) {
      throw new Error('No content found in the file')
    }

    // Process parsed pages
    const pages = processor.normalizePagesAfterOCR(parsedFile)

    // Handle table of contents processing
    let tableOfContents = doc.tableOfContents

    if (!tableOfContents) {
      const bookmarks = parsedFile.bookmarks

      // Try to extract table of contents from bookmarks if available
      if (bookmarks && typeof processor.processTableOfContents === 'function') {
        const tocResult = await processor.processTableOfContents(bookmarks, traceId)
        if (!tocResult?.lackOfInformation) {
          await updateDocumentTableOfContents(payload, docId, tocResult?.tableOfContents)
        }
      } else {
        // Fall back to looking for TOC in parsed pages
        const tableOfContentsPage = pages.find(p => p.tableOfContents)
        if (tableOfContentsPage) {
          const tocResult = await handleTableOfContents(traceId, tableOfContentsPage)
          if (!tocResult?.lackOfInformation) {
            await updateDocumentTableOfContents(payload, docId, tocResult?.tableOfContents)
          }
        }
      }

      // Fetch the updated document to get the table of contents
      const tableOfContentsResponse = await payload.find({
        collection: 'authoritative-documents',
        where: {
          id: { equals: docId },
        },
      })

      if (tableOfContentsResponse.docs.length) {
        const updatedDoc = tableOfContentsResponse.docs[0]
        tableOfContents = updatedDoc.tableOfContents
      }
    }

    if (!tableOfContents || !pages.length) {
      throw new Error('Table of contents not found or no valid pages parsed')
    }

    // Use the processor to normalize the parsed pages
    const normalizedControls: Control[] = await processor.normalizeParsedPages(traceId, pages, tableOfContents)

    // Generate methodologies for the controls
    const controls = await generateMethodologiesForControls(traceId, docType, normalizedControls)

    // Map normalized controls to Payload structures
    await processor.mapToPayloadStructures(payload, controls, docId, traceId)

    // Update document status to success
    await updateDocumentStatus(payload, docId, 'success')

    trace.update({
      output: {
        normalizedControls: controls,
      },
    })

    return controls
  } catch (error) {
    console.error(error)
    await updateDocumentStatus(payload, docId, 'error')
    throw error
  }
}
