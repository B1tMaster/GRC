/**
 * Extract text from a PDF buffer using unpdf (built on Mozilla's pdf.js,
 * designed for Node.js with no browser/DOM dependencies).
 *
 * Used as a fallback when the Zerox vision service is unavailable.
 * Works well for text-based PDFs; scanned/image-only PDFs will return
 * minimal text.
 */
export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  const { extractText } = await import('unpdf')
  const result = await extractText(new Uint8Array(buffer), { mergePages: true })
  return result.text
}
