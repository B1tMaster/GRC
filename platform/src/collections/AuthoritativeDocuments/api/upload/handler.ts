import { PayloadRequest } from 'payload'
import { MinioService } from '@/server/services/storage/minio'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json',
}

const handleFile = async (fileName: string, file: File) => {
  const buffer = Buffer.from(await file.arrayBuffer())
  const key = `authoritative-documents/${fileName}`
  const uploadedFile = await MinioService.uploadFile(key, buffer)
  const s3FileUrl = `${process.env.MINIO_URL}/${uploadedFile}`

  return { s3FileUrl, key }
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

  const { s3FileUrl, key } = await handleFile(file.name, file)

  await req.payload.update({
    collection: 'authoritative-documents',
    id: id as string,
    data: {
      s3Url: s3FileUrl,
      s3Key: key,
    },
  })

  return new Response(JSON.stringify({ ok: true }), {
    headers: corsHeaders,
    status: 200,
  })
}

export default handler
