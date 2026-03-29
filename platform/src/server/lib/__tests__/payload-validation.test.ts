import { describe, it, expect, vi } from 'vitest'
import { text, textarea } from 'payload/dist/fields/validations.js'

/**
 * These tests exercise Payload's ACTUAL field validators to catch
 * config-level issues BEFORE deploying to Railway.
 *
 * Bug history:
 *   - defaultMaxTextLength: 40000 (Payload default) silently rejects large PDFs
 *   - defaultMaxTextLength: 0 passes for textarea but rejects ALL text fields
 *   - defaultMaxTextLength: 10_000_000 (our fix) allows large text safely
 */

const t = vi.fn((key: string) => key)

function makeOpts(overrides: {
  defaultMaxTextLength?: number
  fieldMaxLength?: number
  required?: boolean
}) {
  return {
    data: undefined,
    operation: 'update' as const,
    req: {
      context: {},
      payload: {
        config: {
          defaultMaxTextLength: overrides.defaultMaxTextLength,
          db: { defaultIDType: 'text', init: () => null },
        },
      },
      t,
    },
    siblingData: undefined,
    maxLength: overrides.fieldMaxLength,
    required: overrides.required ?? false,
  }
}

describe('Payload text validator — defaultMaxTextLength behaviour', () => {
  it('rejects text exceeding the default 40K limit', () => {
    const value = 'A'.repeat(50_000)
    const result = text(value, makeOpts({ defaultMaxTextLength: 40_000 }))
    expect(result).not.toBe(true)
  })

  it('accepts text under the default 40K limit', () => {
    const value = 'A'.repeat(30_000)
    const result = text(value, makeOpts({ defaultMaxTextLength: 40_000 }))
    expect(result).toBe(true)
  })

  it('accepts 500K text with our 10M config', () => {
    const value = 'A'.repeat(500_000)
    const result = text(value, makeOpts({ defaultMaxTextLength: 10_000_000 }))
    expect(result).toBe(true)
  })

  it('BUG: setting defaultMaxTextLength to 0 rejects ANY non-empty text', () => {
    const value = 'Hello'
    const result = text(value, makeOpts({ defaultMaxTextLength: 0 }))
    // typeof 0 === 'number' is true, and 5 > 0 is true → validation fails
    expect(result).not.toBe(true)
  })

  it('field-level maxLength overrides the global default', () => {
    const value = 'A'.repeat(50_000)
    const result = text(value, makeOpts({
      defaultMaxTextLength: 40_000,
      fieldMaxLength: 100_000,
    }))
    expect(result).toBe(true)
  })

  it('field-level maxLength is respected even when global is higher', () => {
    const value = 'A'.repeat(50_000)
    const result = text(value, makeOpts({
      defaultMaxTextLength: 10_000_000,
      fieldMaxLength: 40_000,
    }))
    expect(result).not.toBe(true)
  })

  it('accepts empty string regardless of maxLength', () => {
    const result = text('', makeOpts({ defaultMaxTextLength: 10 }))
    expect(result).toBe(true)
  })

  it('accepts undefined/null for non-required fields', () => {
    const result = text(undefined, makeOpts({ defaultMaxTextLength: 10 }))
    expect(result).toBe(true)
  })
})

describe('Payload textarea validator — defaultMaxTextLength behaviour', () => {
  it('rejects text exceeding the default 40K limit', () => {
    const value = 'A'.repeat(50_000)
    const result = textarea(value, makeOpts({ defaultMaxTextLength: 40_000 }))
    expect(result).not.toBe(true)
  })

  it('accepts 500K text with our 10M config', () => {
    const value = 'A'.repeat(500_000)
    const result = textarea(value, makeOpts({ defaultMaxTextLength: 10_000_000 }))
    expect(result).toBe(true)
  })

  it('ASYMMETRY: textarea with defaultMaxTextLength 0 does NOT reject text (unlike text field)', () => {
    const value = 'Hello'
    const result = textarea(value, makeOpts({ defaultMaxTextLength: 0 }))
    // textarea uses `maxLength && value.length > maxLength` — 0 is falsy, short-circuits
    expect(result).toBe(true)
  })
})

describe('Our config (10_000_000) is safe for all field types', () => {
  const ourConfig = { defaultMaxTextLength: 10_000_000 }

  it('text field: accepts short titles', () => {
    expect(text('Annual Report 2025', makeOpts(ourConfig))).toBe(true)
  })

  it('text field: accepts 500K extracted text', () => {
    expect(text('A'.repeat(500_000), makeOpts(ourConfig))).toBe(true)
  })

  it('textarea field: accepts 500K extracted text', () => {
    expect(textarea('A'.repeat(500_000), makeOpts(ourConfig))).toBe(true)
  })

  it('text field: rejects text over 10M (safety cap)', () => {
    const result = text('A'.repeat(10_000_001), makeOpts(ourConfig))
    expect(result).not.toBe(true)
  })
})
