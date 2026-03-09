import { z } from 'zod'
import { modelNames } from '@/server/llm/general-llm/mappings'
import { sendGeneralLlmRequest } from '@/server/llm/general-llm/request'

const TableOfContentsSchema = z.object({
  lackOfInformation: z.boolean().describe('Whether there is lack of information to determine the table of contents.'),
  tableOfContents: z.string().describe('The table of contents of the page.'),
})

type TableOfContentsResponse = z.infer<typeof TableOfContentsSchema>

type BookmarkItem = {
  page_number: number
  title: string
}

type HandleBookmarksParams = {
  bookmarks: BookmarkItem[]
  generationId: string
}

/**
 * Processes bookmarks from a PDF to extract a structured table of contents
 */
export const handleBookmarks = async (params: HandleBookmarksParams): Promise<TableOfContentsResponse> => {
  const { bookmarks, generationId } = params

  const prompt = `
You will be provided with the table of contents for the regulation document.
Your task is to normalize this table of contents and extract only the specifications
that are belongs to the controls.

Example output:
3.1 ACCESS CONTROL, page 16
AC-1 POLICY AND PROCEDURES, page 16
AC-2 ACCOUNT MANAGEMENT, page 19
and so on

IMPORTANT:
- Return only secitons that are belongs to the controls.
- Do not make up any information. If you cannot find the information for the field, set the lackOfInformation to true.
- Do NOT add any other information to the output except the table of contents, introductions, conclusions, etc.
  `

  const userPrompt = bookmarks.map(b => `${b.title}, page ${b.page_number}`).join('\n')

  const response = await sendGeneralLlmRequest({
    name: 'handle-bookmarks-table-of-contents',
    modelName: modelNames.small,
    systemPrompt: prompt,
    userPrompt: userPrompt,
    schema: TableOfContentsSchema,
    generationId: generationId,
  })

  return TableOfContentsSchema.parse(response)
}

/**
 * Extracts table of contents from a document page that contains table of contents
 */
export const handleTableOfContents = async (traceId: string, page: { tableOfContents: boolean; content?: string; pdfPage: number }): Promise<TableOfContentsResponse | null> => {
  if (!page.tableOfContents || !page.content) {
    return null
  }

  const prompt = `
You will be provided with the parsed content (a markdown formatted text) of a pdf page of a regulation document.

Your task is to extract the table of contents from the page that is relates to the section that describes all controls of the document.

Example output:

- 3.1 ACCESS CONTROL - page 16
- 3.2 AWARENESS AND TRAINING - page 24

and so on.

IMPORTANT:
- Do not make up any information. If you cannot find the information for the field, set the lackOfInformation to true.
- Do NOT add any other information to the output except the table of contents, introductions, conclusions, etc.
  `

  const response = await sendGeneralLlmRequest({
    name: 'handle-table-of-contents',
    modelName: modelNames.small,
    systemPrompt: prompt,
    userPrompt: page.content,
    schema: TableOfContentsSchema,
    generationId: traceId,
  })

  return TableOfContentsSchema.parse(response)
}

const RetrieveRelatedOnlyPagesResponseSchema = z.object({
  chainOfThoughts: z.array(z.string()).describe('Before fill up the response, think step by step and write down your thoughts here'),
  lackOfInformation: z.boolean().describe('Whether there is lack of information to determine the related sections.'),
  relatedSections: z.array(z.string()).describe('The sections that are belongs to the specified page numbers.'),
})

type RetrieveRelatedOnlyPagesParams = {
  traceId: string
  tableOfContents: string
  pageNumbers: number[]
}

/**
 * Retrieves sections from a table of contents that are related to specific page numbers
 */
export const retrieveRelatedOnlyPages = async (params: RetrieveRelatedOnlyPagesParams): Promise<z.infer<typeof RetrieveRelatedOnlyPagesResponseSchema>> => {
  const { traceId, tableOfContents, pageNumbers } = params

  const prompt = `
You're provided with a table of contents from a regulation document, followed by specific page numbers.

Task:
- Retrieve the chapter (e.g., "3.1 ACCESS CONTROL") to which these pages belong.

- Retrieve all sections listed under the provided page numbers.

- A chapter line is identifiable by its numbering format (e.g., "3.1 ACCESS CONTROL, page 45").

- Sections are all other lines (e.g., "AC-1 POLICY AND PROCEDURES, page 45").

**Table of contents:**
\`\`\`
${tableOfContents}
\`\`\`

**Output Structure:**
Respond in JSON format.

**Example:**

**Table of Contents (excerpt):**
\`\`\`
3.1 ACCESS CONTROL, page 45
AC-5 SEPARATION OF DUTIES, page 63
AC-6 LEAST PRIVILEGE, page 63
AC-7 UNSUCCESSFUL LOGON ATTEMPTS, page 66
AC-8 SYSTEM USE NOTIFICATION, page 67
AC-9 PREVIOUS LOGON NOTIFICATION, page 68
AC-10 CONCURRENT SESSION CONTROL, page 69
AC-11 DEVICE LOCK, page 69
AC-12 SESSION TERMINATION, page 70
3.2 AWARENESS AND TRAINING, page 86
AT-1 POLICY AND PROCEDURES, page 86

\`\`\`

**Input:**
\`\`\`
45, 46, 47, 48, 49, 50, 51, 52
\`\`\`

**Output:**
\`\`\`json
{
...,
  "relatedSections": [
    "3.1 ACCESS CONTROL",
    "AC-1 POLICY AND PROCEDURES, page 45",
    "AC-2 ACCOUNT MANAGEMENT, page 46",
    "AC-3 ACCESS ENFORCEMENT, page 50"
  ],
  ...
}
\`\`\`


**Constraints:**
- Do not generate or infer additional information.
- Do not include extra explanations or text beyond the structured output.
  `

  const response = await sendGeneralLlmRequest({
    name: 'retrieve-related-only-pages-from-table-of-contents',
    modelName: modelNames.o3mini,
    temperature: 0.3,
    systemPrompt: prompt,
    userPrompt: `Page numbers: ${pageNumbers.join(', ')}`,
    schema: RetrieveRelatedOnlyPagesResponseSchema,
    generationId: traceId,
  })

  return RetrieveRelatedOnlyPagesResponseSchema.parse(response)
}
