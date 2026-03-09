export interface TestCase {
    id: string
    suiteId: string
    title?: string
}

export interface TestSuite {
    alias: string
    title: string
    justification: string
    testSuiteId: number | null
}

export interface TestSuiteWithDocType extends TestSuite {
    docType: string
}

export interface RelatedTestSuite {
    docType: string
    relevantAuthoritativeDocumentSections: TestSuite[]
    testSuiteIds: number[]
}

export interface RelatedTestCases {
    testCases: TestCase[]
    summary: string
}

export interface RelatedTestSuitesResponse {
    docSummary: string
    relatedTestSuites: RelatedTestSuite[]
}
