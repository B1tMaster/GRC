import crypto from 'node:crypto'
import { promisify } from 'util'
import { gunzip, gzip } from 'zlib'
import { z } from 'zod'

export const generateHash = (str: string) => crypto.createHash('md5').update(str).digest('hex')

export const gzipAsync = promisify(gzip)
export const gunzipAsync = promisify(gunzip)

export const transformToKebabCase = (text: string): string => {
  return (
    text
      // Convert to lowercase
      .toLowerCase()
      // Replace multiple spaces with single space
      .replace(/\s+/g, ' ')
      // Trim spaces at start and end
      .trim()
      // Replace spaces with hyphens
      .replace(/\s/g, '-')
      // Remove special characters
      .replace(/[^a-z0-9-]/g, '')
      // Replace multiple hyphens with single hyphen
      .replace(/-+/g, '-')
  )
}

export function createSchemaFromInterface<T>(): z.ZodType<T> {
  // This will give us runtime access to the type information
  return z.lazy(() => {
    // Here you define your runtime schema based on the interface
    // We need to explicitly define it since TypeScript types are not available at runtime
    return z.any()
  })
}

export const parsePagesRange = (input: string) => {
  if (!input) return null

  const expandRange = (range: string): number[] => {
    const parts = range.split('-').map(num => parseInt(num.trim()))
    console.log('parts', parts)
    if (parts.length === 1 || isNaN(parts[1])) return [parts[0]]
    const [start, end] = parts
    if (end < start) return [] // Skip invalid ranges
    const result = Array.from({ length: end - start + 1 }, (_, i) => start + i)
    console.log('result', result)
    return result
  }

  try {
    const pages = input
      .split(',')
      .flatMap(part => expandRange(part.trim()))
      .filter(num => !isNaN(num) && num > 0)

    if (pages.length === 0) return null
    return pages // Always return array, even for single numbers
  } catch (error) {
    console.error('Error parsing pages range:', error)
    return null
  }
}
