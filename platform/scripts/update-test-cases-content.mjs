import configPromise from '@payload-config'
import { getPayload } from 'payload'

const updateTestCasesContent = async () => {
  let payload

  try {
    console.log('Starting content field update process...')

    // Initialize Payload
    payload = await getPayload({
      config: configPromise,
    })

    // Set up pagination
    let page = 1
    const limit = 100
    let hasMorePages = true
    let totalProcessed = 0
    let successCount = 0
    let errorCount = 0

    // Process test cases in batches
    while (hasMorePages) {
      console.log(`Processing page ${page}...`)

      // Get test cases for current page
      const testCasesResponse = await payload.find({
        collection: 'test-cases',
        limit,
        page,
      })

      const { docs, totalDocs, totalPages } = testCasesResponse

      if (page === 1) {
        console.log(`Found ${totalDocs} total test cases to process across ${totalPages} pages`)
      }

      // Process each test case in this batch
      for (const testCase of docs) {
        const { id, title, statement, guidance, enhancements } = testCase

        try {
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

          // Update the test case with the new content field
          await payload.update({
            collection: 'test-cases',
            id,
            data: {
              content,
            },
          })

          console.log(`Updated test case: ${id} - ${title}`)
          successCount++
        } catch (updateError) {
          console.error(`Error updating test case ${id}:`, updateError.message)
          errorCount++
        }

        totalProcessed++
      }

      // Check if there are more pages
      hasMorePages = page < testCasesResponse.totalPages
      page++

      // Simple progress report
      console.log(`Progress: ${totalProcessed}/${totalDocs} (${Math.round((totalProcessed / totalDocs) * 100)}%)`)
    }

    // Final report
    console.log('\n--- Final Report ---')
    console.log(`Total test cases processed: ${totalProcessed}`)
    console.log(`Successful updates: ${successCount}`)
    console.log(`Failed updates: ${errorCount}`)
    console.log('Content field update process completed')
  } catch (error) {
    console.error('Fatal error during content update process:', error)
    process.exit(1)
  } finally {
    // Clean exit
    if (payload) {
      console.log('Shutting down Payload CMS...')

      // Give a moment for any pending operations to complete
      setTimeout(() => {
        process.exit(0)
      }, 1000)
    } else {
      process.exit(0)
    }
  }
}

// Run the update function
updateTestCasesContent()
