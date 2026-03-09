import { generateMethodologiesForControls } from '@/server/handlers/authoritative-doc/common/methodology'
import { PayloadRequest } from 'payload'
import crypto from 'node:crypto'
import { AuthoritativeDocument, TestSuite } from '@/payload-types'
import { Control } from '@/server/handlers/authoritative-doc/common/types'
import { langfuse } from '@/server/llm/observability/langfuse'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json',
}

export const generateMethodologyHandler = async (req: PayloadRequest) => {
  if (!req.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      headers: corsHeaders,
      status: 400,
    })
  }

  const id = req.routeParams?.id as string

  if (!id) {
    return new Response(JSON.stringify({ error: 'No id provided' }), {
      headers: corsHeaders,
      status: 400,
    })
  }

  try {
    const testCase = await req.payload.findByID({
      collection: 'test-cases',
      id,
      depth: 2,
    })

    if (!testCase) {
      return new Response(JSON.stringify({ error: 'Test case not found' }), {
        headers: corsHeaders,
        status: 404,
      })
    }

    const suite = testCase.suite as TestSuite
    const authoritativeDocument = suite.authoritativeDocument as AuthoritativeDocument

    const traceId = crypto.randomUUID()

    const control = {
      id: testCase.id,
      title: testCase.title,
      content: testCase.content,
    } as Control

    const trace = langfuse.trace({
      id: traceId,
      name: 'generate-methodology',
      userId: req.user.id.toString(),
      input: {
        testCase: `${testCase.id} - ${testCase.title}`,
      },
    })

    const methodology = await generateMethodologiesForControls(traceId, authoritativeDocument.docType, [control])

    const updatedTestCase = await req.payload.update({
      collection: 'test-cases',
      id,
      data: {
        methodology: methodology[0].methodology,
      },
    })

    trace.update({
      output: {
        methodology: updatedTestCase.methodology,
      },
    })

    await langfuse.flushAsync()

    return new Response(JSON.stringify({ message: 'Methodology generated' }), {
      headers: corsHeaders,
      status: 200,
    })
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: 'Failed to generate methodology',
        details: e instanceof Error ? e.message : 'Unknown error',
      }),
      {
        headers: corsHeaders,
        status: 500,
      }
    )
  }
}
