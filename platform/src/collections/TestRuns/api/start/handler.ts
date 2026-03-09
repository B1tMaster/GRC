import { PayloadRequest } from 'payload'
import { AuthoritativeDocument, InputFile, TestSuite } from '@/payload-types'
//import { TestCaseSchema } from '@/server/llm/workflows/completions/related-test-suites'
import crypto from 'node:crypto'
import { z } from 'zod'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json',
}

const bodySchema = z.object({
  authoritativeDocument: z.enum(['nist', 'pci-dss']),
  choosedTestSuitesIds: z.array(z.number()),
})

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

  const testRun = await req.payload.findByID({
    collection: 'test-runs',
    id: id as string,
  })

  if (!testRun) {
    return new Response(JSON.stringify({ error: 'Test run not found' }), {
      headers: corsHeaders,
      status: 404,
    })
  }

  let body
  try {
    body = await (req as Request).json()
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid body' }), {
      headers: corsHeaders,
      status: 400,
    })
  }

  const { authoritativeDocument, choosedTestSuitesIds } = bodySchema.parse(body)

  if (!choosedTestSuitesIds.length) {
    return new Response(JSON.stringify({ error: 'No test cases found' }), {
      headers: corsHeaders,
      status: 400,
    })
  }

  // Update test run status to PENDING before enqueueing workflow
  await req.payload.update({
    collection: 'test-runs',
    id: testRun.id,
    data: {
      status: 'PENDING',
    },
  })

  // Generate a unique ID for this process
  const traceId = crypto.randomUUID()

  const testSuitesResponse = await req.payload.find({
    collection: 'test-suites',
    where: {
      id: { in: choosedTestSuitesIds },
    },
  })

  const testSuites = testSuitesResponse.docs as TestSuite[]

  const authoritativeDocumentResponse = await req.payload.find({
    collection: 'authoritative-documents',
    where: {
      docType: {
        equals: authoritativeDocument,
      },
    },
  })

  const foundAuthoritativeDocument = authoritativeDocumentResponse.docs[0] as AuthoritativeDocument
  if (!foundAuthoritativeDocument) {
    return new Response(JSON.stringify({ error: 'Authoritative document not found' }), {
      headers: corsHeaders,
      status: 404,
    })
  }

  try {
    // Use jobManager.enqueueWorkflow for workflows
    await req.payload.jobs.queue({
      workflow: 'process-test-run',
      input: {
        traceId,
        currentTestRun: testRun,
        choosedAuthoritativeDocument: foundAuthoritativeDocument,
        choosedTestSuites: testSuites,
      },
    })

    // Return an immediate response with 202 Accepted status
    return new Response(
      JSON.stringify({
        message: 'Test run processing started.',
        testRunId: testRun.id,
      }),
      {
        headers: corsHeaders,
        status: 202, // 202 Accepted is appropriate for async initiation
      }
    )
  } catch (error) {
    console.error(`Failed to enqueue test run processing:`, error)

    // Update status back to CREATED if enqueueing fails
    await req.payload.update({
      collection: 'test-runs',
      id: testRun.id,
      data: {
        status: 'CREATED',
      },
    })

    return new Response(
      JSON.stringify({
        error: 'Failed to start test run processing',
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
