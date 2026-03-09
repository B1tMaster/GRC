import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Config } from '@/payload-types'

// Get the directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Define the seed directory paths
const seedsDir = path.resolve(__dirname, '..', 'seeds')
const nistSeedsDir = path.resolve(seedsDir, 'nist')
const pciDssSeedsDir = path.resolve(seedsDir, 'pci-dss')

// Helper function to ensure directory exists
const ensureDir = async (dir: string) => {
  try {
    await fs.mkdir(dir, { recursive: true })
    console.log(`Directory created or confirmed: ${dir}`)
  } catch (error) {
    console.error(`Error creating directory ${dir}:`, error)
    throw error
  }
}

// Helper function to fetch all documents from a collection
const fetchAllDocuments = async (payload: any, collection: 'authoritative-documents' | 'test-suites' | 'test-cases', populate?: string[]) => {
  try {
    console.log(`Fetching ${collection}...`)

    const queryParams: any = {
      collection,
      limit: 9999,
    }

    // Add populate parameter if provided
    if (populate && populate.length > 0) {
      queryParams.depth = 1
      queryParams.populate = populate
    }

    const result = await payload.find(queryParams)

    console.log(`Successfully fetched ${result.docs.length} ${collection}`)
    return result.docs
  } catch (error) {
    console.error(`Error fetching ${collection}:`, error)
    throw error
  }
}

// Helper to save data to a JSON file
const saveToJsonFile = async (data: any, filename: string, directory = seedsDir) => {
  try {
    const filePath = path.join(directory, filename)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    console.log(`Data successfully saved to ${filePath}`)
  } catch (error) {
    console.error(`Error saving to ${directory}/${filename}:`, error)
    throw error
  }
}

// Main function
const main = async () => {
  try {
    console.log('Starting fetch-seeds script...')

    // Initialize Payload
    const payload = await getPayload({
      config: configPromise,
    })

    console.log('Payload initialized successfully')

    // Ensure seeds directories exist
    await ensureDir(seedsDir)
    await ensureDir(nistSeedsDir)
    await ensureDir(pciDssSeedsDir)

    // Fetch authoritative documents
    const authoritativeDocuments = await fetchAllDocuments(payload, 'authoritative-documents')

    // Separate authoritative documents by docType
    const nistAuthDoc = authoritativeDocuments.find((doc: any) => doc.docType === 'nist')
    const pciDssAuthDoc = authoritativeDocuments.find((doc: any) => doc.docType === 'pci-dss')

    // Save authoritative documents by type
    if (nistAuthDoc) {
      await saveToJsonFile(nistAuthDoc, 'authoritative-doc.json', nistSeedsDir)
    } else {
      console.warn('No NIST authoritative document found')
    }

    if (pciDssAuthDoc) {
      await saveToJsonFile(pciDssAuthDoc, 'authoritative-doc.json', pciDssSeedsDir)
    } else {
      console.warn('No PCI-DSS authoritative document found')
    }

    // Fetch all test suites and save (regardless of type)
    const testSuites = await fetchAllDocuments(payload, 'test-suites')

    const testSuitesWithoutTestCases = testSuites.map((ts: any) => {
      const { testCases, authoritativeDocument, ...testSuiteData } = ts

      return {
        ...testSuiteData,
        authoritativeDocument: {
          id: authoritativeDocument.id,
          title: authoritativeDocument.title,
          docType: authoritativeDocument.docType,
        },
      }
    })
    await saveToJsonFile(testSuitesWithoutTestCases, 'test-suites.json')

    // Fetch test cases with their related suite information
    const testCases = await fetchAllDocuments(payload, 'test-cases', ['suite'])

    // Filter test cases by their associated authoritative document
    const nistTestCases = testCases
      .filter((testCase: any) => {
        const suite = testCase.suite
        return (
          suite &&
          suite.authoritativeDocument &&
          (typeof suite.authoritativeDocument === 'object' ? suite.authoritativeDocument.docType === 'nist' : nistAuthDoc && suite.authoritativeDocument === nistAuthDoc.id)
        )
      })
      .map((tc: any) => {
        const { suite, ...testCaseData } = tc

        return {
          ...testCaseData,
          suite: suite.id,
        }
      })

    const pciDssTestCases = testCases
      .filter((testCase: any) => {
        const suite = testCase.suite
        return (
          suite &&
          suite.authoritativeDocument &&
          (typeof suite.authoritativeDocument === 'object' ? suite.authoritativeDocument.docType === 'pci-dss' : pciDssAuthDoc && suite.authoritativeDocument === pciDssAuthDoc.id)
        )
      })
      .map((tc: any) => {
        const { suite, ...testCaseData } = tc

        return {
          ...testCaseData,
          suite: suite.id,
        }
      })

    // Save test cases by type
    await saveToJsonFile(nistTestCases, 'test-cases.json', nistSeedsDir)
    await saveToJsonFile(pciDssTestCases, 'test-cases.json', pciDssSeedsDir)

    console.log('Seed data fetch completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error in fetch-seeds script:', error)
    process.exit(1)
  }
}

// Run the main function
main()
