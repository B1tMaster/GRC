import { PayloadRequest } from 'payload'
import { z } from 'zod'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json',
}

const bodySchema = z.object({
  pagesRange: z.string(),
})

const handler = async (req: PayloadRequest) => {
  if (!req.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      headers: corsHeaders,
      status: 401,
    })
  }

  const id = req.routeParams?.id as string | undefined

  const body = await (req as Request).json()

  const parsedBody = bodySchema.safeParse(body)

  if (!parsedBody.success) {
    return new Response(
      JSON.stringify({
        error: 'Invalid request body',
        details: parsedBody.error.format(),
      }),
      {
        headers: corsHeaders,
        status: 400,
      }
    )
  }

  const { pagesRange } = parsedBody.data

  if (!id) {
    return new Response(JSON.stringify({ error: 'No id provided' }), {
      headers: corsHeaders,
      status: 400,
    })
  }

  try {
    await req.payload.jobs.queue({
      task: 'ingest-authoritative-document',
      input: {
        docId: id,
        pagesRange: pagesRange,
      },
    })

    return new Response(JSON.stringify({ message: 'Ingestion job successfully dispatched.' }), {
      headers: corsHeaders,
      status: 202,
    })
  } catch (error) {
    console.error(`API Error dispatching ingestion job for document ${id}:`, error)

    return new Response(
      JSON.stringify({
        error: 'Failed to dispatch ingestion job.',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: corsHeaders,
        status: 500,
      }
    )
  }
}

export default handler
