import { describe, it, expect } from 'vitest'
import { sanitizeForStorage } from '../sanitize-text'

describe('sanitizeForStorage', () => {
  it('passes through clean text unchanged', () => {
    const clean = 'Hello, this is a normal document.\nWith paragraphs.\n\nAnd more text.'
    expect(sanitizeForStorage(clean)).toBe(clean)
  })

  it('handles empty string', () => {
    expect(sanitizeForStorage('')).toBe('')
  })

  it('strips null bytes', () => {
    const dirty = 'Hello\x00World\x00!'
    expect(sanitizeForStorage(dirty)).toBe('HelloWorld!')
  })

  it('strips ASCII control characters', () => {
    const dirty = 'Hello\x01\x02\x03\x04\x05\x06\x07\x08World'
    expect(sanitizeForStorage(dirty)).toBe('HelloWorld')
  })

  it('preserves tabs, newlines, and carriage returns', () => {
    const text = 'Line1\tTabbed\nLine2\r\nLine3'
    expect(sanitizeForStorage(text)).toBe(text)
  })

  it('strips \x0B (vertical tab) and \x0C (form feed)', () => {
    const dirty = 'Hello\x0BWorld\x0C!'
    expect(sanitizeForStorage(dirty)).toBe('HelloWorld!')
  })

  it('strips \x7F (DEL character)', () => {
    const dirty = 'Hello\x7FWorld'
    expect(sanitizeForStorage(dirty)).toBe('HelloWorld')
  })

  it('truncates text exceeding 500K characters', () => {
    const huge = 'A'.repeat(600_000)
    const result = sanitizeForStorage(huge)
    expect(result.length).toBe(500_000)
    expect(result).toBe('A'.repeat(500_000))
  })

  it('does not truncate text at exactly 500K characters', () => {
    const exact = 'B'.repeat(500_000)
    expect(sanitizeForStorage(exact).length).toBe(500_000)
  })

  it('does not truncate text under 500K characters', () => {
    const under = 'C'.repeat(499_999)
    expect(sanitizeForStorage(under).length).toBe(499_999)
  })

  it('strips control chars before measuring length for truncation', () => {
    const nulls = '\x00'.repeat(100_000)
    const text = 'D'.repeat(450_000)
    const result = sanitizeForStorage(nulls + text)
    expect(result.length).toBe(450_000)
    expect(result).toBe('D'.repeat(450_000))
  })

  it('handles a realistic PDF extraction with mixed issues', () => {
    const pdfText = 'Annual Report 2025\x00\n\nSection 1: Governance\x01\x02\n' +
      'The board\x00 approved the framework.\n\n' +
      'Section 2: Risk\x7F Management\n'
    const expected = 'Annual Report 2025\n\nSection 1: Governance\n' +
      'The board approved the framework.\n\n' +
      'Section 2: Risk Management\n'
    expect(sanitizeForStorage(pdfText)).toBe(expected)
  })
})
