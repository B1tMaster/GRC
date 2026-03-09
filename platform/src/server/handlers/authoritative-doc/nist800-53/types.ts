/**
 * Types specific to NIST 800-53 document processing
 */

import { Control } from '../common/types'

/**
 * Represents a page parsed from a NIST 800-53 document
 */
export type ParsedPage = {
  content: string
  pdfPage?: number
  controlNames?: string[] | null
  docPageNumber?: number | null
}

/**
 * Represents a NIST 800-53 control with any NIST-specific properties
 */
export interface NIST80053Control extends Control {
  // Add any NIST-specific properties here if needed
}

/**
 * Re-export common types for convenience
 */
export type { Control }
