import { PayloadRequest } from 'payload'
import { InputFile, TestSuite } from '@/payload-types'
import crypto from 'node:crypto'
import { completeRelatedTestSuites } from '@/server/llm/workflows/completions/related-test-suites'
import { z } from 'zod'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json',
}

/**
 * Handles the request to find related test suites for a test run
 * @param {PayloadRequest} req - The incoming request
 * @returns {Promise<Response>} Response containing related test suites or error message
 * @description This handler performs the following:
 * 1. Validates authentication and request parameters
 * 2. Retrieves the test run by ID
 * 3. Extracts input text from the test run's input files
 * 4. Calls the LLM to complete related test suites based on the chosen authoritative document
 * 5. Returns the results or appropriate error responses
 *
 * Business Logic:
 * - Enables users to find relevant test suites based on their input files and a chosen compliance standard
 * - Supports two authoritative documents: NIST (National Institute of Standards and Technology) and PCI-DSS (Payment Card Industry Data Security Standard)
 * - Combines all input file text to create a context for the LLM processing
 * - Uses LLM to analyze the relationship between user input and compliance requirements
 * - Generates recommended test suites that should be implemented to meet the selected compliance framework
 * - Provides a structured response that can be used to guide compliance testing efforts
 */
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

  const inputText = (testRun.input as InputFile[]).map(file => file.parsedText).join('\n')

  const llmResponse = await completeRelatedTestSuites({
    traceId: crypto.randomUUID(),
    userInput: inputText,
  })

  // Process each test suite type separately
  const enrichedResults = await Promise.all(
    llmResponse.relatedTestSuites.map(async testSuiteResult => {
      const { docType, relevantAuthoritativeDocumentSections } = testSuiteResult

      // Get all aliases from the relevant sections
      const aliases = relevantAuthoritativeDocumentSections.map(section => section.alias)

      if (aliases.length === 0) {
        return {
          ...testSuiteResult,
          testSuiteIds: [],
        }
      }

      // Find test suites that match the aliases for this document type
      const testSuitesResponse = await req.payload.find({
        collection: 'test-suites',
        where: {
          and: [
            {
              alias: {
                in: aliases,
              },
            },
            {
              'authoritativeDocument.docType': {
                equals: docType,
              },
            },
          ],
        },
        limit: 1000,
      })

      // Create a mapping of alias to test suite ID (as number)
      const aliasToIdMap = testSuitesResponse.docs.reduce(
        (map, suite) => {
          if (suite.alias) {
            // Convert ID to number
            map[suite.alias as string] = Number(suite.id)
          }
          return map
        },
        {} as Record<string, number>
      )

      // Add test suite IDs to each relevant section
      const enrichedSections = relevantAuthoritativeDocumentSections.map(section => ({
        ...section,
        testSuiteId: section.alias in aliasToIdMap ? aliasToIdMap[section.alias] : null,
      }))

      return {
        ...testSuiteResult,
        relevantAuthoritativeDocumentSections: enrichedSections,
        testSuiteIds: testSuitesResponse.docs.map(suite => Number(suite.id)),
      }
    })
  )

  const response = {
    ...llmResponse,
    relatedTestSuites: enrichedResults,
  }

  return new Response(JSON.stringify(response), {
    headers: corsHeaders,
    status: 200,
  })
}

export default handler
