import type { Payload } from 'payload'
import type { Config } from '@/payload-types'

type CollectionSlug = keyof Config['collections']

/**
 * Type-safe dynamic collection access for tasks that receive collection slugs as strings.
 * Payload's API expects literal collection slug types, but pipeline tasks receive
 * the slug dynamically. This helper validates and casts safely.
 */
const DOCUMENT_COLLECTION_SLUGS = new Set<CollectionSlug>([
  'board-circulars',
  'annual-reports',
  'policy-documents',
])

const SOURCE_DOCUMENT_TYPES = new Set<string>([
  'board-circulars',
  'annual-reports',
])

export function asCollectionSlug(slug: string): CollectionSlug {
  if (!DOCUMENT_COLLECTION_SLUGS.has(slug as CollectionSlug)) {
    throw new Error(`Invalid document collection slug: "${slug}". Expected one of: ${[...DOCUMENT_COLLECTION_SLUGS].join(', ')}`)
  }
  return slug as CollectionSlug
}

export function asSourceDocumentType(slug: string): 'board-circulars' | 'annual-reports' {
  if (!SOURCE_DOCUMENT_TYPES.has(slug)) {
    throw new Error(`Invalid source document type: "${slug}". Expected: board-circulars or annual-reports`)
  }
  return slug as 'board-circulars' | 'annual-reports'
}

/**
 * Builds a polymorphic relationship value for Payload's sourceDocument fields.
 * Payload requires `{ relationTo: <literal>, value: <number> }` for polymorphic relations.
 */
export function buildSourceDocumentRelation(collectionSlug: string, docId: string | number) {
  return {
    relationTo: asSourceDocumentType(collectionSlug),
    value: Number(docId),
  }
}

/**
 * Common shape for documents with parsed text content.
 * Tasks should use this for working with dynamically-loaded documents.
 */
export interface ParsedDocument {
  id: number
  title?: string | null
  organization?: string | null
  parsedText?: string | null
  extractionStatus?: string | null
  s3Key?: string | null
  [key: string]: unknown
}

/**
 * Finds a document by ID from a dynamic collection slug, returning it typed as ParsedDocument.
 */
export async function findDocumentById(
  payload: Payload,
  collectionSlug: string,
  id: string | number,
): Promise<ParsedDocument> {
  const doc = await payload.findByID({
    collection: asCollectionSlug(collectionSlug),
    id,
  })
  return doc as unknown as ParsedDocument
}

/**
 * Updates a document in a dynamic collection slug.
 */
export async function updateDocument(
  payload: Payload,
  collectionSlug: string,
  id: string | number,
  data: Record<string, unknown>,
) {
  return payload.update({
    collection: asCollectionSlug(collectionSlug),
    id,
    data,
  })
}
