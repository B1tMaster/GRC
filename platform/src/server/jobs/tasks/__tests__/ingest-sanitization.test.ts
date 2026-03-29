import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/server/services/storage/minio', () => ({
  MinioService: {
    getFile: vi.fn(),
  },
}))

vi.mock('@/server/services/pdf-parser/zerox', () => ({
  PdfParserService: {
    parse: vi.fn(),
  },
}))

vi.mock('@/server/services/pdf-parser/local', () => ({
  extractTextFromPdfBuffer: vi.fn(),
}))

import { MinioService } from '@/server/services/storage/minio'
import { PdfParserService } from '@/server/services/pdf-parser/zerox'
import { extractTextFromPdfBuffer } from '@/server/services/pdf-parser/local'
import { ingestAnnualReportHandler } from '../ingest-annual-report'

const mockMinio = vi.mocked(MinioService.getFile)
const mockZerox = vi.mocked(PdfParserService.parse)
const mockLocal = vi.mocked(extractTextFromPdfBuffer)

function makePayload(doc: Record<string, any>) {
  const updates: Array<{ collection: string; id: any; data: any }> = []
  return {
    payload: {
      findByID: vi.fn().mockResolvedValue(doc),
      update: vi.fn().mockImplementation(async (args: any) => {
        updates.push(args)
        return args.data
      }),
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
    },
    updates,
  }
}

describe('ingest-annual-report: sanitization pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('skips already-parsed documents', async () => {
    const { payload } = makePayload({ id: 1, parsedText: 'existing', s3Key: 'test.pdf' })

    const result = await (ingestAnnualReportHandler as any)({
      input: { docId: 1 },
      req: { payload },
    })

    expect(result.output.success).toBe(true)
    expect(result.output.message).toBe('Document already parsed')
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('sanitizes extracted text (strips null bytes) before saving', async () => {
    const dirtyText = 'Hello\x00World\x00!'
    const buffer = Buffer.from('fake pdf')

    const { payload, updates } = makePayload({ id: 2, s3Key: 'report.pdf', parsedText: null })
    mockMinio.mockResolvedValue(buffer)
    mockZerox.mockResolvedValue({
      pages: [{ content: dirtyText }],
    } as any)

    const result = await (ingestAnnualReportHandler as any)({
      input: { docId: 2 },
      req: { payload },
    })

    expect(result.output.success).toBe(true)
    const savedUpdate = updates.find(u => u.data.parsedText !== undefined)
    expect(savedUpdate).toBeDefined()
    expect(savedUpdate!.data.parsedText).toBe('HelloWorld!')
    expect(savedUpdate!.data.parsedText).not.toContain('\x00')
  })

  it('truncates text exceeding 500K characters', async () => {
    const hugeText = 'A'.repeat(600_000)
    const buffer = Buffer.from('fake pdf')

    const { payload, updates } = makePayload({ id: 3, s3Key: 'huge.pdf', parsedText: null })
    mockMinio.mockResolvedValue(buffer)
    mockZerox.mockResolvedValue({
      pages: [{ content: hugeText }],
    } as any)

    const result = await (ingestAnnualReportHandler as any)({
      input: { docId: 3 },
      req: { payload },
    })

    expect(result.output.success).toBe(true)
    const savedUpdate = updates.find(u => u.data.parsedText !== undefined)
    expect(savedUpdate!.data.parsedText.length).toBe(500_000)
    expect(payload.logger.info).toHaveBeenCalledWith(
      expect.stringContaining('Sanitized parsedText'),
    )
  })

  it('falls back to local PDF parser when Zerox fails', async () => {
    const fallbackText = 'Locally extracted text'
    const buffer = Buffer.from('fake pdf')

    const { payload, updates } = makePayload({ id: 4, s3Key: 'broken.pdf', parsedText: null })
    mockMinio.mockResolvedValue(buffer)
    mockZerox.mockRejectedValue(new Error('Vision model unavailable'))
    mockLocal.mockResolvedValue(fallbackText)

    const result = await (ingestAnnualReportHandler as any)({
      input: { docId: 4 },
      req: { payload },
    })

    expect(result.output.success).toBe(true)
    expect(mockLocal).toHaveBeenCalledWith(buffer)
    expect(payload.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Zerox failed'),
    )
    const savedUpdate = updates.find(u => u.data.parsedText !== undefined)
    expect(savedUpdate!.data.parsedText).toBe(fallbackText)
  })

  it('reports error when document has no S3 key', async () => {
    const { payload } = makePayload({ id: 5, s3Key: null, parsedText: null })

    const result = await (ingestAnnualReportHandler as any)({
      input: { docId: 5 },
      req: { payload },
    })

    expect(result.output.success).toBe(false)
    expect(result.output.message).toContain('no S3 key')
  })

  it('sanitized text passes Payload 40K default validation', async () => {
    // This is the end-to-end scenario that was failing:
    // A 200K-char PDF that gets sanitized to 200K → still over 40K default
    // but our config sets defaultMaxTextLength: 10M so it should pass.
    // The sanitize + truncate ensures stored text is <= 500K.
    const { text: textValidator } = await import('payload/dist/fields/validations.js')

    const largeText = 'A'.repeat(200_000)
    const { sanitizeForStorage } = await import('@/server/lib/sanitize-text')
    const sanitized = sanitizeForStorage(largeText)

    const t = vi.fn((key: string) => key)
    const result = textValidator(sanitized, {
      req: {
        payload: {
          config: { defaultMaxTextLength: 10_000_000 },
        },
        t,
      },
    })
    expect(result).toBe(true)
  })
})
