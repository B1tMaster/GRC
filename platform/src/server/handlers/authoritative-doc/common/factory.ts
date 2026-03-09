import { IAuthoritativeDocumentProcessor } from './types'
import { NIST80053Processor } from '../nist800-53/processor'
import { PCIDSSProcessor } from '../pci-dss/processor'

/**
 * Factory function that returns the appropriate document processor based on the document type
 * @param docType The type of authoritative document (e.g., 'nist')
 * @returns The appropriate processor implementation
 * @throws Error if no processor is available for the given document type
 */
export const getAuthoritativeDocumentProcessor = (docType: string): IAuthoritativeDocumentProcessor => {
  // Convert to lowercase for case-insensitive comparison
  const type = docType.toLowerCase()

  if (type === 'nist') {
    return new NIST80053Processor()
  }

  if (type === 'pci-dss') {
    return new PCIDSSProcessor()
  }

  // Throw an error for unsupported document types
  throw new Error(`Unsupported document type: ${docType}. No processor available.`)
}
