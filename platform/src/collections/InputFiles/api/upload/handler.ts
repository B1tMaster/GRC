import { PayloadRequest } from 'payload'
import { PdfParserService } from '@/server/services/pdf-parser/zerox'
import { MinioService } from '@/server/services/storage/minio'
import fs from 'node:fs'
import path from 'node:path'
import { transformToKebabCase } from '@/server/lib/utils'
import { File as FormDataFile } from 'formdata-node'
import crypto from 'node:crypto'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json',
}

const parsePrompt = `
You will be provided with the part of a document.
Convert these part to markdown.
Return only the markdown with no explanation text. Do not include delimiters like \`\`\`markdown or \`\`\`html.

Add only existing information from the document. Do not make up any information.


RULES:
- You must include all information on the page. Do not exclude headers, footers, or subtext.
- Return tables in an HTML format.
- Charts & infographics must be interpreted to a markdown format. Prefer table format when applicable.
- Logos should be wrapped in brackets. Ex: <logo>Coca-Cola<logo>
- Watermarks should be wrapped in brackets. Ex: <watermark>OFFICIAL COPY<watermark>
- Page numbers should be wrapped in brackets. Ex: <page_number>14<page_number> or <page_number>9/22<page_number>
- Prefer using ☐ and ☑ for check boxes.
- Do not add any line breaks in the string fields.
- Do not make up any information, only use the provided text.
`

const calculateFileHash = (buffer: Buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

const handleFile = async (id: number, file: File) => {
  const buffer = Buffer.from(await file.arrayBuffer())
  const uploadedFile = await MinioService.uploadFile(`input-files/${id}.pdf`, buffer)
  const s3FileUrl = `${process.env.MINIO_URL}/${uploadedFile}`

  return { s3FileUrl }
}

const handler = async (req: PayloadRequest) => {
  if (!req.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      headers: corsHeaders,
      status: 400,
    })
  }

  const id = req.routeParams?.id

  if (!id) {
    return new Response(JSON.stringify({ error: 'No id provided' }), {
      headers: corsHeaders,
      status: 400,
    })
  }

  // Get the file from FormData
  const formData = await (req as Request).formData()
  const file = formData?.get('file')

  if (!file || !(file instanceof File)) {
    return new Response(JSON.stringify({ error: 'No file provided' }), {
      headers: corsHeaders,
      status: 400,
    })
  }

  const entity = await req.payload.findByID({
    collection: 'input-files',
    id: id as string,
  })

  if (!entity) {
    return new Response(JSON.stringify({ error: 'Input file not found' }), {
      headers: corsHeaders,
      status: 404,
    })
  }

  const buffer = Buffer.from(await (file as File).arrayBuffer())

  // Calculate hash of the file
  const fileHash = calculateFileHash(buffer)

  // Check if a file with this hash already exists
  const existingFile = await req.payload.find({
    collection: 'input-files',
    where: {
      hash: {
        equals: fileHash,
      },
    },
  })

  // If file with same hash exists, use its data
  if (existingFile.docs && existingFile.docs.length > 0) {
    const existingDoc = existingFile.docs[0]

    await req.payload.update({
      collection: 'input-files',
      id: entity.id,
      data: {
        hash: fileHash,
        parsedText: existingDoc.parsedText,
        s3Url: existingDoc.s3Url,
      },
    })

    const response = { ok: true, reused: true }

    return new Response(JSON.stringify(response), {
      headers: corsHeaders,
      status: 200,
    })
  }

  // If no matching hash found, process the file normally
  const { s3FileUrl } = await handleFile(entity.id, file)

  const generationId = crypto.randomUUID()
  const formDataFile = new FormDataFile([buffer], file.name, { type: file.type })

  const parsedFile = await PdfParserService.parse(formDataFile, {
    customPrompt: parsePrompt,
    ...(process.env.NODE_ENV === 'development' && { generationId }),
  })

  const parsedText = parsedFile.pages?.map(page => page?.content).join('\n')

  await req.payload.update({
    collection: 'input-files',
    id: entity.id,
    data: {
      hash: fileHash,
      parsedText,
      s3Url: s3FileUrl,
    },
  })

  const response = { ok: true }

  return new Response(JSON.stringify(response), {
    headers: corsHeaders,
    status: 200,
  })
}

export default handler
