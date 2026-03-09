/**
 * Types specific to PCI-DSS document processing
 */

import { Control } from '../common/types'

/**
 * Represents a page parsed from a PCI-DSS document
 */
export type ParsedPage = {
  content: string
  pdfPage?: number
  controlNames?: string[] | null
  docPageNumber?: number | null
}

/**
 * Represents a PCI-DSS control with any PCI-specific properties
 */
export interface PCIDSSControl extends Control {
  // Add any PCI-specific properties here if needed
}

/**
 * Re-export common types for convenience
 */
export type { Control }
