/**
 * Extract text from a PDF buffer using pdf-parse (pure Node.js, no external
 * service required). Used as a fallback when the Zerox vision service is
 * unavailable. Works well for text-based PDFs; scanned/image PDFs will
 * return empty text.
 *
 * Uses dynamic import to avoid crashing the server if pdf-parse has
 * missing native dependencies (e.g. canvas) in some environments.
 */
export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse')
  const parser: any = new PDFParse(new Uint8Array(buffer))
  await parser.load()
  const result = await parser.getText()
  return result.text as string
}
