import { File } from 'formdata-node'
import fs from 'node:fs'
import path from 'node:path'
import { PdfParserService } from '@/server/services/pdf-parser/zerox'
import { z } from 'zod'

/**
 * Reads a PDF file and returns a File object for processing
 * @param filePath Path to the PDF file
 * @returns A File object suitable for PDF parsing services
 */
export const readPdfFile = async (filePath: string): Promise<File> => {
  const buffer = await fs.promises.readFile(filePath)
  const fileName = path.basename(filePath)
  return new File([buffer], fileName, { type: 'application/pdf' })
}

/**
 * Parses a PDF file with customized schema, prompt and page selection
 * @param fileObj File object representing the PDF
 * @param options Parsing options including page selection, custom prompt and schema
 * @returns The parsed PDF content according to the provided schema
 */
export const parsePdfFile = async <T extends z.ZodType>(
  fileObj: File,
  options: {
    selectPages?: number[]
    customPrompt: string
    schema: T
    generationId: string
  }
) => {
  const { selectPages, customPrompt, schema, generationId } = options

  return PdfParserService.parse(fileObj, {
    selectPages,
    customPrompt,
    schema,
    generationId,
  })
}
