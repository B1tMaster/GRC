const DEFAULT_MAX_CHARS = 120_000

interface TruncateOptions {
  maxChars?: number
  preserveParagraphs?: boolean
}

/**
 * Truncates document text to fit within LLM context windows.
 * Default 120K chars (~36K tokens) fits comfortably in DeepSeek-Chat's 128K token window
 * while leaving room for system prompt + response generation.
 */
export function truncateDocumentText(text: string, options: TruncateOptions = {}): {
  text: string
  wasTruncated: boolean
  originalLength: number
} {
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS
  const originalLength = text.length

  if (text.length <= maxChars) {
    return { text, wasTruncated: false, originalLength }
  }

  let truncated: string
  if (options.preserveParagraphs) {
    const cutPoint = text.lastIndexOf('\n\n', maxChars)
    truncated = cutPoint > maxChars * 0.8
      ? text.slice(0, cutPoint)
      : text.slice(0, maxChars)
  } else {
    truncated = text.slice(0, maxChars)
  }

  return {
    text: truncated + `\n\n[Document truncated: showing ${truncated.length.toLocaleString()} of ${originalLength.toLocaleString()} characters]`,
    wasTruncated: true,
    originalLength,
  }
}

/**
 * Builds context from multiple documents, distributing the character budget evenly.
 */
export function buildMultiDocumentContext(
  docs: Array<{ id: string | number; title?: string; parsedText?: string; category?: string }>,
  maxChars: number = DEFAULT_MAX_CHARS,
): { text: string; wasTruncated: boolean; totalOriginalLength: number } {
  const sections: string[] = []
  let totalOriginalLength = 0

  const perDocBudget = Math.floor(maxChars / Math.max(docs.length, 1))

  for (const doc of docs) {
    const title = doc.title || `Document ${doc.id}`
    const category = doc.category || 'unknown'
    const rawText = doc.parsedText || ''
    totalOriginalLength += rawText.length

    const { text } = truncateDocumentText(rawText, { maxChars: perDocBudget, preserveParagraphs: true })
    sections.push(`=== DOCUMENT: "${title}" (category: ${category}, id: ${doc.id}) ===\n\n${text}`)
  }

  const combined = sections.join('\n\n---\n\n')
  const wasTruncated = combined.length < totalOriginalLength

  return { text: combined, wasTruncated, totalOriginalLength }
}
