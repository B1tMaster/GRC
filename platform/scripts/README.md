# Scripts for Payload CMS

This directory contains utility scripts for managing the Payload CMS database.

## Test Cases Content Update Script

The `update-test-cases-content.mjs` script updates the `content` field in the TestCases collection by combining the `statement`, `guidance`, and `enhancements` fields into a single formatted text field.

### Prerequisites

Before running the script:

1. Make sure you have added the `content` field to the TestCases collection
2. Ensure your database connection is properly configured in your environment variables

### Running the Script

```bash
# Navigate to the project root
cd /path/to/your/project

# Run the script
node scripts/update-test-cases-content.mjs
```

### What the Script Does

For each test case in the database, the script:

1. Reads the existing `statement`, `guidance`, and `enhancements` fields
2. Formats them into a single content string with the following structure:

   ```
   Statement:
   {statement text}

   Guidance:
   {guidance text}

   Enhancements:
   {enhancements text}
   ```

3. Updates the `content` field with this combined text

### Troubleshooting

If you encounter any issues:

- Check that the collection name is correct
- Verify your database connection settings
- Ensure you have the necessary permissions to update documents in the collection
- Check the logs for specific error messages

The script includes error handling and pagination to process large collections efficiently.

## Test Cases JSON Update Script

The `update-test-cases-json.mjs` script works similarly to the above script but operates on the JSON seed file (`src/server/db/seeds/test-cases.json`) instead of the database directly.

### Running the Script

```bash
# Navigate to the project root
cd /path/to/your/project

# Run the script with default path
node scripts/update-test-cases-json.mjs

# Or specify a custom path
node scripts/update-test-cases-json.mjs path/to/your/test-cases.json
```

### What the Script Does

1. Creates a backup of the original file before making any changes
2. Reads the test cases from the JSON seed file
3. For each test case, combines the `statement`, `guidance`, and `enhancements` fields into a formatted `content` field
4. Writes the updated JSON data back to the original file

### Features

- Automatic backup creation with timestamp
- Support for custom file paths
- Progress reporting for large files
- Error handling and validation

### Troubleshooting

If you encounter any issues:

- Ensure the path to the JSON file is correct
- Make sure you have write permissions to the file
- Check if the JSON structure matches the expected format
- Refer to the backup file if you need to restore the original data
