import { Payload } from 'payload'
import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import * as fs from 'fs'
import { COBIT_2019_CONTROLS, COSO_ERM_CONTROLS, NIST_800_53_CONTROLS, ISO_27001_CONTROLS, HKMA_SPM_CONTROLS, PCI_DSS_CONTROLS } from '@/server/handlers/grc-extraction/framework-catalog'

// Define interfaces for the seed data structures (from JSON files)
interface SeedTestCase {
  id: string
  title: string
  suite: number
  methodology: string
  metadata: {
    version: string | null
    pdfPagesRange: string
    docPagesRange: string
  }
  links?: any[]
  content?: string
}

interface SeedAuthoritativeDoc {
  id: number
  title: string
  docType: 'nist' | 'pci-dss'
  s3Url: string
  s3Key: string
  ingestStatus: 'success' | 'pending' | 'error' | null
  tableOfContents: string
  updatedAt?: string
  createdAt?: string
}

interface SeedTestSuite {
  id: number
  title: string
  alias: string
  authoritativeDocument: {
    id: number
    title: string
    docType: 'nist' | 'pci-dss'
  }
  testCases?: SeedTestCase[]
  updatedAt?: string
  createdAt?: string
}

// Define interfaces for the data to be sent to Payload CMS
interface PayloadAuthDoc {
  title: string
  docType: 'nist' | 'pci-dss'
  s3Url: string
  s3Key: string
  ingestStatus: 'success' | 'pending' | 'error' | null
  tableOfContents: string
}

interface PayloadTestSuite {
  title: string
  alias: string
  authoritativeDocument: number
}

interface PayloadTestCase {
  id: string
  title: string
  suite: number
  methodology?: string
  metadata: {
    version: string | null
    pdfPagesRange: string
    docPagesRange: string
  }
  links?: any[]
  content?: string
}

export const seedDatabase = async (payload: Payload): Promise<void> => {
  try {
    // Check if test-suites collection is empty
    const testSuitesResult = await payload.find({
      collection: 'test-suites',
      limit: 0,
    })

    // Check if test-cases collection is empty
    const testCasesResult = await payload.find({
      collection: 'test-cases',
      limit: 0,
    })

    // Check if authoritative-documents collection is empty
    const authDocResult = await payload.find({
      collection: 'authoritative-documents',
      limit: 0,
    })

    // Only proceed with seeding if collections are empty
    if (testSuitesResult.totalDocs === 0 && testCasesResult.totalDocs === 0 && authDocResult.totalDocs === 0) {
      console.log('Database is empty. Starting seed process...')

      // Get directory paths for seed files
      const filename = fileURLToPath(import.meta.url)
      const dirname = path.dirname(filename)
      const suitesPath = path.resolve(dirname, 'test-suites.json')

      // Paths for NIST and PCI-DSS seed files
      const nistDirPath = path.resolve(dirname, 'nist')
      const pciDssDirPath = path.resolve(dirname, 'pci-dss')

      const nistAuthDocPath = path.resolve(nistDirPath, 'authoritative-doc.json')
      const pciDssAuthDocPath = path.resolve(pciDssDirPath, 'authoritative-doc.json')

      const nistCasesPath = path.resolve(nistDirPath, 'test-cases.json')
      const pciDssCasesPath = path.resolve(pciDssDirPath, 'test-cases.json')

      // Prepare data containers
      let suitesData: SeedTestSuite[] = []
      let nistCasesData: SeedTestCase[] = []
      let pciDssCasesData: SeedTestCase[] = []
      let nistAuthDocData: SeedAuthoritativeDoc | null = null
      let pciDssAuthDocData: SeedAuthoritativeDoc | null = null
      let allTestCases: SeedTestCase[] = []

      // Create a map to store the mapping between authDocType and the created authDocId
      const authDocMap = new Map<'nist' | 'pci-dss', number>()

      // Read and parse test-suites.json
      try {
        const suitesDataRaw = JSON.parse(await readFile(suitesPath, 'utf8'))
        suitesData = Array.isArray(suitesDataRaw) ? suitesDataRaw : [suitesDataRaw]
      } catch (error) {
        console.error('Error reading test-suites.json:', error)
        suitesData = []
      }

      // Read and parse NIST test-cases.json
      try {
        if (fs.existsSync(nistCasesPath)) {
          const nistCasesDataRaw = JSON.parse(await readFile(nistCasesPath, 'utf8'))
          nistCasesData = Array.isArray(nistCasesDataRaw) ? nistCasesDataRaw : [nistCasesDataRaw]
          console.log(`Read ${nistCasesData.length} NIST test cases`)
          allTestCases = [...nistCasesData]
        } else {
          console.log('NIST test-cases.json file not found. Skipping NIST test cases.')
        }
      } catch (error) {
        console.error('Error reading NIST test-cases.json:', error)
      }

      // Read and parse PCI-DSS test-cases.json
      try {
        if (fs.existsSync(pciDssCasesPath)) {
          const pciDssCasesDataRaw = JSON.parse(await readFile(pciDssCasesPath, 'utf8'))
          pciDssCasesData = Array.isArray(pciDssCasesDataRaw) ? pciDssCasesDataRaw : [pciDssCasesDataRaw]
          console.log(`Read ${pciDssCasesData.length} PCI-DSS test cases`)
          allTestCases = [...allTestCases, ...pciDssCasesData]
        } else {
          console.log('PCI-DSS test-cases.json file not found. Skipping PCI-DSS test cases.')
        }
      } catch (error) {
        console.error('Error reading PCI-DSS test-cases.json:', error)
      }

      // Read and parse NIST authoritative-doc.json
      try {
        if (fs.existsSync(nistAuthDocPath)) {
          nistAuthDocData = JSON.parse(await readFile(nistAuthDocPath, 'utf8'))
          console.log('NIST authoritative document data loaded')
        } else {
          console.log('NIST authoritative-doc.json file not found. Skipping NIST document.')
        }
      } catch (error) {
        console.error('Error reading NIST authoritative-doc.json:', error)
      }

      // Read and parse PCI-DSS authoritative-doc.json
      try {
        if (fs.existsSync(pciDssAuthDocPath)) {
          pciDssAuthDocData = JSON.parse(await readFile(pciDssAuthDocPath, 'utf8'))
          console.log('PCI-DSS authoritative document data loaded')
        } else {
          console.log('PCI-DSS authoritative-doc.json file not found. Skipping PCI-DSS document.')
        }
      } catch (error) {
        console.error('Error reading PCI-DSS authoritative-doc.json:', error)
      }

      // Check if we have at least one authoritative document to seed
      if (!nistAuthDocData && !pciDssAuthDocData) {
        console.log('No authoritative documents found to seed. Exiting.')
        return
      }

      // Seed NIST authoritative document if available
      if (nistAuthDocData) {
        console.log('Seeding NIST authoritative document...')
        try {
          const payloadData: PayloadAuthDoc = {
            title: nistAuthDocData.title,
            docType: nistAuthDocData.docType,
            s3Url: nistAuthDocData.s3Url,
            s3Key: nistAuthDocData.s3Key,
            ingestStatus: nistAuthDocData.ingestStatus,
            tableOfContents: nistAuthDocData.tableOfContents,
          }

          const createdNistAuthDoc = await payload.create({
            collection: 'authoritative-documents',
            data: payloadData,
          })

          console.log(`Created NIST authoritative document with ID: ${createdNistAuthDoc.id}`)
          // Store the mapping between docType and the created DB ID
          authDocMap.set('nist', createdNistAuthDoc.id)
        } catch (error) {
          console.error('Error creating NIST authoritative document:', error)
        }
      }

      // Seed PCI-DSS authoritative document if available
      if (pciDssAuthDocData) {
        console.log('Seeding PCI-DSS authoritative document...')
        try {
          const payloadData: PayloadAuthDoc = {
            title: pciDssAuthDocData.title,
            docType: pciDssAuthDocData.docType,
            s3Url: pciDssAuthDocData.s3Url,
            s3Key: pciDssAuthDocData.s3Key,
            ingestStatus: pciDssAuthDocData.ingestStatus,
            tableOfContents: pciDssAuthDocData.tableOfContents,
          }

          const createdPciDssAuthDoc = await payload.create({
            collection: 'authoritative-documents',
            data: payloadData,
          })

          console.log(`Created PCI-DSS authoritative document with ID: ${createdPciDssAuthDoc.id}`)
          // Store the mapping between docType and the created DB ID
          authDocMap.set('pci-dss', createdPciDssAuthDoc.id)
        } catch (error) {
          console.error('Error creating PCI-DSS authoritative document:', error)
        }
      }

      // If no authoritative documents were created, exit
      if (authDocMap.size === 0) {
        console.log('Failed to create any authoritative documents. Exiting.')
        return
      }

      // Then seed test-suites
      console.log(`Seeding ${suitesData.length} test suites...`)

      // Map of original suite ID to newly created suite ID
      const suiteIdMap = new Map<number, number>()

      for (const suite of suitesData) {
        // Determine which authoritative document this suite belongs to
        // Check if suite.alias contains the standard name or use authoritativeDocument field
        let docType: 'nist' | 'pci-dss' | null = null

        // Try to determine docType from alias or authoritativeDocument
        if (suite.alias && typeof suite.alias === 'string') {
          if (suite.authoritativeDocument.docType === 'nist') {
            docType = 'nist'
          } else if (suite.authoritativeDocument.docType === 'pci-dss') {
            docType = 'pci-dss'
          }
        }

        // If not determined from alias, try using the authoritativeDocument field
        if (!docType && suite.authoritativeDocument) {
          // This checks if the original suite.authoritativeDocument matches one of our auth doc IDs
          // For example, if in the original data NIST has ID=4, we would look for that value
          if (nistAuthDocData && suite.authoritativeDocument.id === nistAuthDocData.id) {
            docType = 'nist'
          } else if (pciDssAuthDocData && suite.authoritativeDocument.id === pciDssAuthDocData.id) {
            docType = 'pci-dss'
          }
        }

        // If we still can't determine, default to the first available auth doc
        if (!docType) {
          const firstKey = authDocMap.keys().next().value
          if (firstKey) {
            docType = firstKey
            console.log(`Could not determine standard for suite ${suite.title}. Defaulting to ${docType}.`)
          } else {
            console.log(`No authoritative document types available. Skipping suite ${suite.title}.`)
            continue
          }
        }

        // Get the corresponding authoritative document ID from our map
        const authDocId = authDocMap.get(docType)

        if (!authDocId) {
          console.log(`No authoritative document ID found for type ${docType}. Skipping suite ${suite.title}.`)
          continue
        }

        try {
          const payloadData: PayloadTestSuite = {
            title: suite.title,
            alias: suite.alias,
            // Link to the corresponding authoritative document based on docType
            authoritativeDocument: authDocId,
          }

          const createdSuite = await payload.create({
            collection: 'test-suites',
            data: payloadData,
          })

          // Store mapping from original ID to new ID
          suiteIdMap.set(suite.id, createdSuite.id)
          console.log(`Created test suite: ${createdSuite.title} (ID: ${createdSuite.id}) for ${docType} standard`)
        } catch (error) {
          console.error(`Error creating test suite ${suite.title}:`, error)
        }
      }

      if (suiteIdMap.size === 0) {
        console.log('Failed to create any test suites. Exiting.')
        return
      }

      // Also add test cases from test suites if they exist
      for (const suite of suitesData) {
        if (suite.testCases && Array.isArray(suite.testCases)) {
          // Add the suite ID to each test case if not already present
          for (const testCase of suite.testCases) {
            if (!testCase.suite) {
              testCase.suite = suite.id
            }
            allTestCases.push(testCase)
          }
        }
      }

      // Remove duplicates by ID
      const uniqueTestCases: SeedTestCase[] = []
      const seenIds = new Set<string>()

      for (const testCase of allTestCases) {
        if (!seenIds.has(testCase.id)) {
          seenIds.add(testCase.id)
          uniqueTestCases.push(testCase)
        }
      }

      // Finally seed test-cases and link them to the correct test suite
      console.log(`Seeding ${uniqueTestCases.length} test cases (combined from NIST and PCI-DSS)...`)
      const createdCases = []

      for (const testCase of uniqueTestCases) {
        // Skip if no suite reference or if the suite doesn't exist in our map
        if (!testCase.suite || !suiteIdMap.has(testCase.suite)) {
          console.log(`Skipping test case ${testCase.id}: No valid suite reference`)
          continue
        }

        // Determine which standard this test case belongs to based on ID prefix
        let standard = 'unknown'
        if (testCase.id.startsWith('nist-')) {
          standard = 'NIST'
        } else if (testCase.id.startsWith('pci-dss-')) {
          standard = 'PCI-DSS'
        }

        const suiteId = suiteIdMap.get(testCase.suite)
        if (!suiteId) {
          console.log(`Could not find new suite ID for test case ${testCase.id}. Skipping.`)
          continue
        }

        // Prepare the data for Payload
        const payloadData: PayloadTestCase = {
          id: testCase.id,
          title: testCase.title,
          suite: suiteId, // Link to the newly created suite
          methodology: testCase.methodology,
          metadata: {
            version: null,
            pdfPagesRange: testCase.metadata.pdfPagesRange,
            docPagesRange: testCase.metadata.docPagesRange,
          },
          links: testCase.links || [],
          content: testCase.content || '',
        }

        try {
          const created = await payload.create({
            collection: 'test-cases',
            data: payloadData,
          })
          createdCases.push(created)
          console.log(`Created test case: ${created.title} (ID: ${created.id}) for ${standard} standard`)
        } catch (error) {
          console.error(`Error creating test case ${testCase.id}:`, error)
        }
      }

      console.log(`Successfully seeded ${createdCases.length} test cases`)
      console.log('Seeding completed successfully!')
    } else {
      console.log('Database already has data. Skipping seed process.')
    }

    // Seed GRC frameworks independently
    await seedFrameworks(payload)
  } catch (error) {
    console.error('Error during database seeding:', error)
  }
}

async function seedFrameworks(payload: Payload): Promise<void> {
  try {
    const existing = await payload.find({ collection: 'frameworks', limit: 0 })
    if (existing.totalDocs > 0) {
      console.log('Frameworks already seeded. Skipping.')
      return
    }

    console.log('Seeding GRC frameworks...')

    await payload.create({
      collection: 'frameworks',
      data: {
        name: 'COBIT 2019',
        code: 'COBIT2019',
        version: '2019',
        description: 'Control Objectives for Information and Related Technologies — a framework for the governance and management of enterprise IT.',
        controls: COBIT_2019_CONTROLS.map((c) => ({
          controlId: c.controlId,
          controlName: c.controlName,
          domain: c.domain,
          process: c.process,
          description: c.description,
          keywords: c.keywords,
        })),
      },
    })
    console.log('Seeded COBIT 2019 framework')

    await payload.create({
      collection: 'frameworks',
      data: {
        name: 'COSO ERM',
        code: 'COSO_ERM',
        version: '2017',
        description: 'Committee of Sponsoring Organizations Enterprise Risk Management — Integrating with Strategy and Performance.',
        controls: COSO_ERM_CONTROLS.map((c) => ({
          controlId: c.controlId,
          controlName: c.controlName,
          domain: c.domain,
          description: c.description,
          keywords: c.keywords,
        })),
      },
    })
    console.log('Seeded COSO ERM framework')

    await payload.create({
      collection: 'frameworks',
      data: {
        name: 'NIST SP 800-53 r5',
        code: 'NIST_800_53',
        version: 'Revision 5',
        description: 'Security and Privacy Controls for Information Systems and Organizations — the most comprehensive catalog of security controls from NIST.',
        controls: NIST_800_53_CONTROLS.map((c) => ({
          controlId: c.controlId,
          controlName: c.controlName,
          domain: c.domain,
          description: c.description,
          keywords: c.keywords,
        })),
      },
    })
    console.log('Seeded NIST 800-53 r5 framework')

    await payload.create({
      collection: 'frameworks',
      data: {
        name: 'ISO/IEC 27001:2022',
        code: 'ISO27001',
        version: '2022',
        description: 'Information security management systems — Requirements. The international standard for information security management.',
        controls: ISO_27001_CONTROLS.map((c) => ({
          controlId: c.controlId,
          controlName: c.controlName,
          domain: c.domain,
          description: c.description,
          keywords: c.keywords,
        })),
      },
    })
    console.log('Seeded ISO 27001 framework')

    await payload.create({
      collection: 'frameworks',
      data: {
        name: 'HKMA Supervisory Policy Manual',
        code: 'HKMA_SPM',
        version: '2026',
        description: 'Hong Kong Monetary Authority Supervisory Policy Manual — technology risk management, operational resilience, and GenAI governance guidance for authorized institutions.',
        controls: HKMA_SPM_CONTROLS.map((c) => ({
          controlId: c.controlId,
          controlName: c.controlName,
          domain: c.domain,
          description: c.description,
          keywords: c.keywords,
        })),
      },
    })
    console.log('Seeded HKMA SPM framework')

    await payload.create({
      collection: 'frameworks',
      data: {
        name: 'PCI DSS v4.0',
        code: 'PCI_DSS',
        version: '4.0',
        description: 'Payment Card Industry Data Security Standard — requirements for organizations that store, process, or transmit cardholder data.',
        controls: PCI_DSS_CONTROLS.map((c) => ({
          controlId: c.controlId,
          controlName: c.controlName,
          domain: c.domain,
          description: c.description,
          keywords: c.keywords,
        })),
      },
    })
    console.log('Seeded PCI DSS v4.0 framework')

    console.log('GRC framework seeding completed!')
  } catch (error) {
    console.error('Error seeding frameworks:', error)
  }
}
