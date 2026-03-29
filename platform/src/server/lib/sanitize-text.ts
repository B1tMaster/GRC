const MAX_STORED_TEXT = 500_000

/**
 * Sanitise extracted PDF text for safe storage in PostgreSQL via Payload.
 *
 * PDFs frequently contain null bytes (\x00), stray control characters, and
 * invalid UTF-8 sequences that PostgreSQL's text/varchar columns reject.
 * This strips those out and caps the length so the Payload update never
 * throws a "field is invalid" validation error.
 */
export function sanitizeForStorage(raw: string): string {
  let clean = raw
    // Remove null bytes (PostgreSQL cannot store 0x00 in text/varchar)
    .replace(/\0/g, '')
    // Strip ASCII control chars except tab, newline, carriage return
    // eslint-disable-next-line no-control-regex
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  if (clean.length > MAX_STORED_TEXT) {
    clean = clean.slice(0, MAX_STORED_TEXT)
  }

  return clean
}
