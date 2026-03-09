/**
 * Merges two page ranges into a single range
 * @param range1 First page range (e.g. "1-3")
 * @param range2 Second page range (e.g. "4-5")
 * @returns Merged page range (e.g. "1-5")
 */
export const mergePageRanges = (range1: string, range2: string): string => {
  const parseRange = (range: string) => {
    const parts = range.split('-')
    return parts.length === 1 ? [parseInt(parts[0], 10), parseInt(parts[0], 10)] : [parseInt(parts[0], 10), parseInt(parts[1], 10)]
  }

  const [start1, end1] = parseRange(range1)
  const [start2, end2] = parseRange(range2)

  const newStart = Math.min(start1, start2)
  const newEnd = Math.max(end1, end2)

  return newStart === newEnd ? `${newStart}` : `${newStart}-${newEnd}`
}

/**
 * Formats control information as text
 */
export const controlIntoText = (controlInfo: { id: string; title: string; content: string | null }): string => {
  return `
Control ID: ${controlInfo.id}
Title: ${controlInfo.title}

Content:
${controlInfo.content || 'No content provided'}`.trim()
}
