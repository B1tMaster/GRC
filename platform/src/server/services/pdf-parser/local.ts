/**
 * Extract text from a PDF buffer using unpdf (built on Mozilla's pdf.js,
 * designed for Node.js with no browser/DOM dependencies).
 *
 * Used as a fallback when the Zerox vision service is unavailable.
 * Works well for text-based PDFs; scanned/image-only PDFs will return
 * minimal text.
 */
export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  // pdfjs-dist (used by unpdf) references DOMMatrix which doesn't exist in
  // Node.js. Provide a minimal stub — only identity-matrix usage occurs
  // during text extraction (no actual rendering).
  if (typeof globalThis.DOMMatrix === 'undefined') {
    ;(globalThis as any).DOMMatrix = class DOMMatrix {
      m11 = 1; m12 = 0; m13 = 0; m14 = 0
      m21 = 0; m22 = 1; m23 = 0; m24 = 0
      m31 = 0; m32 = 0; m33 = 1; m34 = 0
      m41 = 0; m42 = 0; m43 = 0; m44 = 1
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0
      is2D = true; isIdentity = true
      inverse() { return new DOMMatrix() }
      multiply() { return new DOMMatrix() }
      translate() { return new DOMMatrix() }
      scale() { return new DOMMatrix() }
      rotate() { return new DOMMatrix() }
      transformPoint(p: any) { return p }
      toString() { return 'matrix(1,0,0,1,0,0)' }
    }
  }

  const { extractText } = await import('unpdf')
  const result = await extractText(new Uint8Array(buffer), { mergePages: true })
  return result.text
}
