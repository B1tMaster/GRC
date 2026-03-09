import fs from 'fs'
import path from 'path'

const updateTestCasesJson = async () => {
  try {
    console.log('Starting JSON update process...')

    // Get file path from command line arguments or use default
    const defaultPath = 'src/server/db/seeds/test-cases.json'
    const providedPath = process.argv[2]
    const jsonFilePath = providedPath ? path.resolve(providedPath) : path.resolve(defaultPath)

    // Check if file exists
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`Error: File not found at path: ${jsonFilePath}`)
      console.log(`Usage: node scripts/update-test-cases-json.mjs [optional-file-path]`)
      process.exit(1)
    }

    // Create backup
    const backupPath = `${jsonFilePath}.backup-${new Date().toISOString().replace(/[:.]/g, '-')}`
    console.log(`Creating backup at: ${backupPath}`)
    fs.copyFileSync(jsonFilePath, backupPath)

    // Read the JSON file
    console.log(`Reading file from: ${jsonFilePath}`)
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8')

    // Parse the JSON
    let testCases
    try {
      testCases = JSON.parse(jsonData)
      console.log(`Found ${testCases.length} test cases in JSON file`)
    } catch (parseError) {
      console.error('Error parsing JSON file:', parseError)
      console.log('Please check that the file contains valid JSON')
      process.exit(1)
    }

    // Process each test case
    const updatedTestCases = testCases.map((testCase, index) => {
      const { statement, guidance, enhancements, ...restData } = testCase

      // Format the content field
      const content = `${
        statement
          ? `Statement:
${statement}`
          : ''
      }

${
  guidance
    ? `Guidance:
${guidance}`
    : ''
}

${
  enhancements
    ? `Enhancements:
${enhancements}`
    : ''
}`

      // Log progress periodically
      if (index % 50 === 0 || index === testCases.length - 1) {
        console.log(`Processing test case ${index + 1}/${testCases.length}`)
      }

      // Return updated test case with content field
      return {
        ...restData,
        content,
      }
    })

    // Write updated JSON back to file
    fs.writeFileSync(jsonFilePath, JSON.stringify(updatedTestCases, null, 2), 'utf8')

    console.log(`Successfully updated ${updatedTestCases.length} test cases in JSON file`)
    console.log(`Updated file saved to: ${jsonFilePath}`)
    console.log(`Backup saved to: ${backupPath}`)
  } catch (error) {
    console.error('Error updating JSON file:', error)
    process.exit(1)
  }
}

// Run the update function
updateTestCasesJson()
