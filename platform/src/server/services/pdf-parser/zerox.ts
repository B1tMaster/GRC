import { generateHash } from '@/server/lib/utils'
import { RedisCache } from '@/server/services/cache/redis'
import { FormData, File } from 'formdata-node'

// Add new interfaces for schema and extraction
interface ExtractionSummary {
  successful: number
  failed: number
}

interface Summary {
  totalPages: number
  ocr: ExtractionSummary | null
  extracted: ExtractionSummary | null
}

export interface ZeroxOutput {
  completionTime: number
  fileName: string
  inputTokens: number
  outputTokens: number
  pages: {
    content: string
    contentLength: number
    page: number
  }[]
  bookmarks:
    | {
        page_number: number
        title: string
      }[]
    | null
  extracted?: Record<string, any> | null // Add extracted field
  summary?: Summary | null // Add summary field
}

// We can accept either a File object or a Buffer
type ParseInput = File | Buffer

// Update ParseOptions to include new parameters
interface ParseOptions {
  generationId?: string
  selectPages?: number[]
  schema?: Record<string, any> // JSON schema for extraction
  extractPerPage?: boolean
  extractOnly?: boolean
  customPrompt?: string
}

/**
 * Parse a PDF file using the Zerox service
 * @param file The file to parse
 * @param options Optional parsing options including schema and custom prompt
 * @returns Parsed PDF data
 */
const parse = async (file: File, options?: ParseOptions): Promise<ZeroxOutput> => {
  try {
    const cache = new RedisCache()

    // Calculate file hash including options for cache key
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Include options in cache key if provided
    const { generationId, ...restOptions } = options || {}
    const optionsStr = generateHash(JSON.stringify(restOptions))
    const cacheKey = `zerox:${hashHex}:${optionsStr}`

    // Check cache first
    const cachedResult = await cache.get(cacheKey)
    if (cachedResult) {
      return cachedResult as ZeroxOutput
    }

    // Ensure we have a valid file with content
    if (!(file instanceof File)) {
      throw new Error('Invalid file object provided')
    }

    if (file.size === 0) {
      throw new Error('File is empty')
    }

    const formData = new FormData()
    formData.append('file', file, file.name)

    // Add all optional parameters to formData
    if (options) {
      if (options.generationId) {
        formData.append('generation_id', options.generationId)
      }

      if (options.selectPages) {
        formData.append('select_pages', options.selectPages.join(','))
      }

      if (options.schema) {
        formData.append('schema', JSON.stringify(options.schema))
      }

      if (options.extractPerPage) {
        formData.append('extract_per_page', 'true')
      }

      if (options.extractOnly) {
        formData.append('extract_only', 'true')
      }

      if (options.customPrompt) {
        formData.append('custom_prompt', options.customPrompt)
      }
    }

    const response = await fetch(`${process.env.ZEROX_SERVICE_URL}/parse`, {
      method: 'POST',
      body: formData as unknown as BodyInit,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Zerox service error:', errorText)
      throw new Error(`Zerox service failed: ${response.status} ${errorText}`)
    }

    const data = await response.json()

    // Store result in cache
    await cache.set(cacheKey, data, 3600 * 24 * 7)

    return data as ZeroxOutput
  } catch (error) {
    console.error('Error in parseInput:', error)
    throw error
  }
}

export const PdfParserService = {
  parse,
}
