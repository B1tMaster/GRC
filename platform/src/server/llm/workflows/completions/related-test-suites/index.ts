import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { z } from 'zod'
import { type CompletionRelatedTestSuitesResponse, generateDocSummary, generateRelatedTestSuites } from './generation'
import { TestSuite } from '@/payload-types'

import { langfuse } from '@/server/llm/observability/langfuse'

export const RelatedTestSuitesPropsSchema = z.object({
  traceId: z.string(),
  userInput: z.string(),
})

type RelatedTestSuites = CompletionRelatedTestSuitesResponse & {
  docType: string
}

// Define the result type that includes both test suites and document summary
export type CompletionResult = {
  relatedTestSuites: RelatedTestSuites[]
  docSummary: string
}

/*
Pass the user input and authoritative documents to the LLM and get the related test cases
Processes multiple document types in parallel along with document summary
*/
export const completeRelatedTestSuites = async (props: z.infer<typeof RelatedTestSuitesPropsSchema>): Promise<CompletionResult> => {
  const { traceId, userInput } = RelatedTestSuitesPropsSchema.parse(props)

  const payload = await getPayload({
    config: configPromise,
  })

  const foundAuthoritativeDocumentsResponse = await payload.find({
    collection: 'authoritative-documents',
    where: {
      docType: {
        exists: true,
      },
    },
    depth: 2,
  })

  const foundAuthoritativeDocuments = foundAuthoritativeDocumentsResponse.docs
  if (!foundAuthoritativeDocuments || foundAuthoritativeDocuments.length === 0) {
    throw new Error('No authoritative documents found')
  }

  // Group documents by docType
  const documentsByType = foundAuthoritativeDocuments.reduce(
    (acc, doc) => {
      const docType = doc.docType as string
      if (!acc[docType]) {
        acc[docType] = []
      }
      acc[docType].push(doc)
      return acc
    },
    {} as Record<string, typeof foundAuthoritativeDocuments>
  )

  // Create a trace for the whole operation
  const trace = langfuse.trace({
    id: traceId,
    name: 'complete-related-test-suites',
    input: {
      userInput,
      documentTypes: Object.keys(documentsByType),
    },
  })

  // Process each document type in parallel
  const testSuitePromises = Object.entries(documentsByType).map(async ([docType, documents]) => {
    // Extract all test suites from documents of this type
    const testSuitesByType = documents.flatMap(doc =>
      ((doc.testSuites?.docs as TestSuite[]) || []).map(s => ({
        title: s.title,
        alias: s.alias,
      }))
    )

    if (testSuitesByType.length === 0) {
      return null // Skip if no test suites for this type
    }

    const llmResponse = await generateRelatedTestSuites({
      traceId,
      choosedAuthoritativeDocument: docType,
      userInput,
      testSuites: testSuitesByType,
    })

    // Add docType to the response
    return {
      ...llmResponse,
      docType,
    } as RelatedTestSuites
  })

  // Generate document summary in parallel with test suite processing
  const docSummaryPromise = generateDocSummary({
    userInput,
    traceId,
  }).catch(error => {
    trace.update({
      output: {
        summaryError: error instanceof Error ? error.message : 'Unknown error',
      },
    })
    return 'Error generating document summary'
  })

  // Wait for all promises to resolve in parallel
  const [docSummary, ...testSuiteResults] = await Promise.all([docSummaryPromise, ...testSuitePromises])

  // Filter out null results from test suite processing
  const relatedTestSuites = testSuiteResults.filter(result => result !== null) as RelatedTestSuites[]

  // Create the final result
  const result: CompletionResult = {
    relatedTestSuites,
    docSummary,
  }

  trace.update({
    output: {
      resultCount: relatedTestSuites.length,
      docTypes: Object.keys(documentsByType),
      summary: docSummary,
    },
  })

  return result
}
