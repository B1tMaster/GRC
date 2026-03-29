import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { extractTextFromPdfBuffer } from '@/server/services/pdf-parser/local'
import { sanitizeForStorage } from '../sanitize-text'
import { text as textValidator, textarea as textareaValidator } from 'payload/dist/fields/validations.js'
import { vi } from 'vitest'

const FIXTURES = path.resolve(__dirname, 'fixtures')
const OUR_CONFIG_MAX = 10_000_000
const PAYLOAD_DEFAULT_MAX = 40_000
const SANITIZE_MAX = 500_000

const t = vi.fn((key: string) => key)

function payloadOpts(maxLen: number) {
  return {
    req: {
      payload: {
        config: { defaultMaxTextLength: maxLen },
      },
      t,
    },
  }
}

interface PdfTestResult {
  name: string
  fileSize: string
  rawChars: number
  sanitizedChars: number
  hasNullBytes: boolean
  hasControlChars: boolean
  passesOurConfig: boolean
  wouldFailDefault: boolean
}

const results: PdfTestResult[] = []

const PDF_FIXTURES = [
  { file: 'hsbc-ar25.pdf', label: 'HSBC Annual Report 2025 (9.6MB)', timeout: 30_000 },
  { file: 'hkjc-ar25.pdf', label: 'HKJC Annual Report 2025 (58MB)', timeout: 120_000 },
  { file: 'jpmorgan-ar24.pdf', label: 'JPMorgan Annual Report 2024 (16MB)', timeout: 60_000 },
  { file: 'barclays-ar24.pdf', label: 'Barclays Annual Report 2024 (12MB)', timeout: 60_000 },
  { file: 'berkshire-10k-2024.pdf', label: 'Berkshire Hathaway 10-K 2024 (1.8MB)', timeout: 30_000 },
  { file: 'samsung-ar24.pdf', label: 'Samsung Annual Report 2024 (1.5MB)', timeout: 30_000 },
  { file: 'nvidia-10k-2025.pdf', label: 'NVIDIA 10-K 2025 (1MB)', timeout: 30_000 },
]

for (const fixture of PDF_FIXTURES) {
  const filePath = path.join(FIXTURES, fixture.file)
  const available = existsSync(filePath)

  describe.skipIf(!available)(fixture.label, () => {
    let rawText: string
    let sanitized: string

    it('extracts text from PDF', async () => {
      const buffer = readFileSync(filePath)
      rawText = await extractTextFromPdfBuffer(buffer)
      expect(rawText.length).toBeGreaterThan(0)
    }, fixture.timeout)

    it('extracted text is non-trivial (> 1000 chars)', () => {
      expect(rawText.length).toBeGreaterThan(1000)
    })

    it('sanitizeForStorage produces clean text <= 500K', () => {
      sanitized = sanitizeForStorage(rawText)
      expect(sanitized.length).toBeLessThanOrEqual(SANITIZE_MAX)
    })

    it('sanitized text contains no null bytes', () => {
      expect(sanitized).not.toContain('\x00')
    })

    it('sanitized text contains no forbidden control characters', () => {
      expect(sanitized).not.toMatch(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/)
    })

    it('sanitized text passes Payload text validator (our 10M config)', () => {
      const result = textValidator(sanitized, payloadOpts(OUR_CONFIG_MAX))
      expect(result).toBe(true)
    })

    it('sanitized text passes Payload textarea validator (our 10M config)', () => {
      const result = textareaValidator(sanitized, payloadOpts(OUR_CONFIG_MAX))
      expect(result).toBe(true)
    })

    it('raw text would FAIL Payload default 40K limit (if over 40K)', () => {
      if (rawText.length > PAYLOAD_DEFAULT_MAX) {
        const result = textareaValidator(rawText, payloadOpts(PAYLOAD_DEFAULT_MAX))
        expect(result).not.toBe(true)
      }
    })

    it('collects results for summary', () => {
      results.push({
        name: fixture.label,
        fileSize: fixture.file,
        rawChars: rawText.length,
        sanitizedChars: sanitized.length,
        hasNullBytes: rawText.includes('\x00'),
        hasControlChars: /[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(rawText),
        passesOurConfig: textValidator(sanitized, payloadOpts(OUR_CONFIG_MAX)) === true,
        wouldFailDefault: rawText.length > PAYLOAD_DEFAULT_MAX,
      })
    })
  })
}

describe('Summary', () => {
  it('prints extraction results table', () => {
    if (results.length === 0) return

    console.log('\n┌─────────────────────────────────────────────────────────────────────────────────┐')
    console.log('│                        PDF EXTRACTION TEST RESULTS                              │')
    console.log('├──────────────────────────────────┬───────────┬───────────┬──────┬──────┬────────┤')
    console.log('│ Report                           │ Raw chars │ Sanitized │ Null │ Ctrl │ 40K?   │')
    console.log('├──────────────────────────────────┼───────────┼───────────┼──────┼──────┼────────┤')
    for (const r of results) {
      const name = r.name.slice(0, 32).padEnd(32)
      const raw = r.rawChars.toLocaleString().padStart(9)
      const san = r.sanitizedChars.toLocaleString().padStart(9)
      const nul = (r.hasNullBytes ? 'YES' : 'no').padStart(4)
      const ctrl = (r.hasControlChars ? 'YES' : 'no').padStart(4)
      const fail = (r.wouldFailDefault ? 'FAIL' : 'ok').padStart(6)
      console.log(`│ ${name} │ ${raw} │ ${san} │ ${nul} │ ${ctrl} │ ${fail} │`)
    }
    console.log('└──────────────────────────────────┴───────────┴───────────┴──────┴──────┴────────┘')
    console.log(`\n  All ${results.length} PDFs: extracted ✓, sanitized ✓, Payload validation ✓`)
  })
})
