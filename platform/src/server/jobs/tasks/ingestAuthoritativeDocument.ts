import { z } from 'zod'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { Field, Payload, TaskHandler } from 'payload'
import { IngestAuthoritativeDocHandler } from '@/server/handlers/authoritative-doc'
import { MinioService } from '@/server/services/storage/minio'
import { AuthoritativeDocument } from '@/payload-types'
import { parsePagesRange } from '@/server/lib/utils'

// Define the input schema for the task
export const ingestAuthoritativeDocumentInputSchema: Field[] = [
  {
    name: 'docId',
    type: 'text',
    required: true,
  },
  {
    name: 'pagesRange',
    type: 'text',
    required: true,
  },
]

// Define the output schema for the task
export const ingestAuthoritativeDocumentOutputSchema: Field[] = [
  {
    name: 'success',
    type: 'checkbox',
    required: true,
  },
  {
    name: 'message',
    type: 'text',
    required: false,
  },
]

// Define input and output types based on schemas
interface IngestAuthoritativeDocumentInput {
  docId: string | number
  pagesRange?: string
}

interface IngestAuthoritativeDocumentOutput {
  success: boolean
  message?: string
}

// Helper function to download the file from Minio storage
const downloadFile = async (s3Key: string): Promise<string> => {
  const buffer = await MinioService.getFile(s3Key)

  const tmpDir = path.join(process.cwd(), 'temp')
  const filePath = path.join(tmpDir, s3Key)
  const fileDir = path.dirname(filePath)

  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir, { recursive: true })
  }

  fs.writeFileSync(filePath, buffer)

  return filePath
}

// Helper function to convert string range to tuple format
const convertPagesRange = (pagesRange?: string): number[] | undefined => {
  if (!pagesRange) return undefined

  const pages = parsePagesRange(pagesRange)
  if (!pages || pages.length === 0) return undefined

  // Return all pages
  return pages
}

// Define the task handler
export const ingestAuthoritativeDocumentHandler: TaskHandler<'ingest-authoritative-document'> = async ({
  input,
  req: { payload },
}: {
  input: IngestAuthoritativeDocumentInput

  req: { payload: Payload }
}): Promise<{ output: IngestAuthoritativeDocumentOutput }> => {
  let documentFilePath: string | null = null

  try {
    // Extract inputs
    const { docId, pagesRange } = input

    // Generate trace ID for logging and tracking
    const traceId = crypto.randomUUID()

    // Retrieve document metadata from the database
    const docResponse = (await payload.findByID({
      collection: 'authoritative-documents',
      id: docId,
    })) as AuthoritativeDocument

    if (!docResponse) {
      throw new Error(`Document with ID ${docId} not found`)
    }

    // Get S3 key from the document metadata
    const s3Key = docResponse.s3Key

    if (!s3Key) {
      throw new Error('Document does not have an S3 key')
    }

    // Download the file from Minio storage
    documentFilePath = await downloadFile(s3Key)

    const parsedPagesRange = convertPagesRange(pagesRange)

    // Call the ingest handler
    await IngestAuthoritativeDocHandler({
      filePath: documentFilePath,
      pagesRange: parsedPagesRange,
      docId: typeof docId === 'string' ? parseInt(docId, 10) : (docId as number),
      docType: docResponse.docType,
      traceId,
    })

    return {
      output: {
        success: true,
        message: 'Document ingestion completed successfully',
      },
    }
  } catch (error) {
    console.error('Error ingesting authoritative document:', error)
    return {
      output: {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred during document ingestion',
      },
    }
  } finally {
    // Clean up: Delete the temporary file
    if (documentFilePath && fs.existsSync(documentFilePath)) {
      try {
        fs.unlinkSync(documentFilePath)
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file:', cleanupError)
      }
    }
  }
}
