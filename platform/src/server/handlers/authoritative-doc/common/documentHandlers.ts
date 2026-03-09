import { Payload } from 'payload'

/**
 * Fetch an authoritative document by its ID
 * @param docId The ID of the document to fetch
 * @returns The document or throws an error if not found
 */
export const fetchAuthoritativeDocument = async (payload: Payload, docId: number) => {

  const docResponse = await payload.find({
    collection: 'authoritative-documents',
    where: {
      id: { equals: docId },
    },
  })

  if (!docResponse.docs.length) {
    throw new Error('Document not found')
  }

  return docResponse.docs[0]
}

/**
 * Update the ingestion status of an authoritative document
 * @param docId The document ID
 * @param status The status to set ('pending', 'success', 'error')
 */
export const updateDocumentStatus = async (payload: Payload, docId: number, status: 'pending' | 'success' | 'error' | null) => {
  await payload.update({
    collection: 'authoritative-documents',
    id: docId,
    data: {
      ingestStatus: status,
    },
  })
}

/**
 * Update the table of contents for a document
 * @param docId The document ID
 * @param tableOfContents The table of contents to set
 */
export const updateDocumentTableOfContents = async (payload: Payload, docId: number, tableOfContents: string | undefined) => {
  await payload.update({
    collection: 'authoritative-documents',
    id: docId,
    data: {
      tableOfContents,
    },
  })
}
