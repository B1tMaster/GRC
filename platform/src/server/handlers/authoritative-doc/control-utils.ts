import { mergePageRanges } from './common/utils'

/**
 * @deprecated This function has been moved to nist800-53/control-utils.ts
 * Formats control information as text
 */
export const controlIntoText = (controlInfo: { id: string; title: string; statement: string | null; guidance: string | null; enhancements: string[] | null }): string => {
  // TODO: This function should be imported from nist800-53/control-utils.ts
  return `
Control ID: ${controlInfo.id}
Title: ${controlInfo.title}

Statement:
${controlInfo.statement || 'No statement provided'}

Guidance:
${controlInfo.guidance || 'No guidance provided'}

${controlInfo.enhancements?.length ? 'Enhancements:\n' + controlInfo.enhancements.join('\n') : ''}
    `.trim()
}

// Export the merged mergePageRanges from common
export { mergePageRanges }
