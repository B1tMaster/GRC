/**
 * Common types used across authoritative document handlers
 *
 * @deprecated Use imports from './common/types' directly instead
 */

/**
 * Represents a normalized control from an authoritative document
 */
export interface Control {
  id: string
  title: string
  statement?: string
  guidance?: string
  enhancements?: string[]
  suite?: {
    id: string
    name: string
  }
  docPagesRange?: string
  pdfPagesRange?: string
}

/**
 * Re-export common types to maintain backward compatibility
 */
export * from './common/types'
