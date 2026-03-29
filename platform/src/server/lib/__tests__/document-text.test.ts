import { describe, it, expect } from 'vitest'
import { truncateDocumentText, buildMultiDocumentContext } from '../document-text'

describe('truncateDocumentText', () => {
  it('returns original text when under the limit', () => {
    const text = 'Short text'
    const result = truncateDocumentText(text)
    expect(result.text).toBe(text)
    expect(result.wasTruncated).toBe(false)
    expect(result.originalLength).toBe(text.length)
  })

  it('returns original text when exactly at the limit', () => {
    const text = 'A'.repeat(120_000)
    const result = truncateDocumentText(text)
    expect(result.text).toBe(text)
    expect(result.wasTruncated).toBe(false)
  })

  it('truncates text exceeding the default 120K limit', () => {
    const text = 'A'.repeat(200_000)
    const result = truncateDocumentText(text)
    expect(result.wasTruncated).toBe(true)
    expect(result.originalLength).toBe(200_000)
    expect(result.text.length).toBeLessThan(200_000)
    expect(result.text).toContain('[Document truncated:')
  })

  it('respects a custom maxChars value', () => {
    const text = 'A'.repeat(500)
    const result = truncateDocumentText(text, { maxChars: 100 })
    expect(result.wasTruncated).toBe(true)
    expect(result.text).toContain('A'.repeat(100))
    expect(result.text).toContain('[Document truncated:')
  })

  it('preserves paragraph boundaries when option is set', () => {
    const paragraphs = Array.from({ length: 20 }, (_, i) =>
      `Paragraph ${i + 1}: ${'x'.repeat(50)}`
    ).join('\n\n')
    const result = truncateDocumentText(paragraphs, {
      maxChars: 200,
      preserveParagraphs: true,
    })
    expect(result.wasTruncated).toBe(true)
    expect(result.text).not.toMatch(/Paragraph \d+: x+$/)
  })

  it('appends truncation notice with character counts', () => {
    const text = 'B'.repeat(200_000)
    const result = truncateDocumentText(text)
    expect(result.text).toContain('120,000')
    expect(result.text).toContain('200,000')
  })
})

describe('buildMultiDocumentContext', () => {
  it('combines multiple documents', () => {
    const docs = [
      { id: 1, title: 'Doc A', parsedText: 'Content A', category: 'annual_report' },
      { id: 2, title: 'Doc B', parsedText: 'Content B', category: 'board_circular' },
    ]
    const result = buildMultiDocumentContext(docs, 10_000)
    expect(result.text).toContain('Doc A')
    expect(result.text).toContain('Content A')
    expect(result.text).toContain('Doc B')
    expect(result.text).toContain('Content B')
    expect(result.text).toContain('---')
  })

  it('distributes budget evenly across documents', () => {
    const docs = [
      { id: 1, title: 'Doc A', parsedText: 'X'.repeat(10_000) },
      { id: 2, title: 'Doc B', parsedText: 'Y'.repeat(10_000) },
    ]
    const result = buildMultiDocumentContext(docs, 5_000)
    expect(result.wasTruncated).toBe(true)
    const xCount = (result.text.match(/X/g) || []).length
    const yCount = (result.text.match(/Y/g) || []).length
    expect(xCount).toBeLessThanOrEqual(2_500)
    expect(yCount).toBeLessThanOrEqual(2_500)
  })

  it('handles documents with no parsedText', () => {
    const docs = [
      { id: 1, title: 'Empty Doc' },
      { id: 2, title: 'Has Text', parsedText: 'Real content' },
    ]
    const result = buildMultiDocumentContext(docs)
    expect(result.text).toContain('Empty Doc')
    expect(result.text).toContain('Real content')
  })

  it('uses default title and category for missing fields', () => {
    const docs = [{ id: 42, parsedText: 'Some text' }]
    const result = buildMultiDocumentContext(docs)
    expect(result.text).toContain('Document 42')
    expect(result.text).toContain('unknown')
  })
})
