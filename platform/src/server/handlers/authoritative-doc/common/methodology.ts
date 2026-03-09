import { Control } from './types'
import { controlIntoText } from './utils'
import { generateExpertMethodology } from '@/server/llm/workflows/nist/test-case/generate'

/**
 * Generates expert methodologies for controls that have statement or guidance content
 * @param traceId Trace ID for tracking generation
 * @param docType Document type identifier (e.g., 'nist800-53', 'pci-dss')
 * @param controls Array of controls to process
 * @returns The modified controls array with methodology field populated where applicable
 */
export const generateMethodologiesForControls = async (traceId: string, docType: string, controls: Control[]): Promise<Control[]> => {
  const updatedControls = [...controls]

  for (let i = 0; i < updatedControls.length; i++) {
    const control = updatedControls[i]

    // Only process controls that have statement or guidance content
    if (control.content) {
      try {
        // Construct control ID alias
        const controlId = `${docType}-${control.id.toLowerCase()}`

        // Format control content
        const formattedControl = controlIntoText({
          id: control.id,
          title: control.title,
          content: control.content,
        })

        // Call LLM to generate methodology
        const methodology = await generateExpertMethodology({
          generationId: traceId,
          testCase: {
            text: formattedControl,
            title: control.title,
            alias: controlId,
          },
        })

        // Assign the methodology text to the control
        control.methodology = methodology.text
      } catch (error) {
        // Log error but continue processing other controls
        console.error(`Error generating methodology for control ${control.id}:`, error)
      }
    }
  }

  return updatedControls
}
