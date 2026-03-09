import { modelNames } from '@/server/llm/general-llm/mappings'
import { sendGeneralLlmRequest } from '@/server/llm/general-llm/request'
import { z } from 'zod'

const ControlSchema = z.object({
  chainOfThoughts: z.array(z.string()).describe('Before fill up the response, think step by step and write down your thoughts here'),
  id: z.string().nullable().describe('The id of the control. Example: "AC-1"'),
  suite: z.object({
    validation: z.boolean().describe('Set true if you sure that this suite is corresponds with the page of the table of contents'),
    id: z.string().nullable().describe('The id of the control family. Example: "AC"'),
    name: z.string().nullable().describe('The name of the control family. Example: "ACCESS CONTROL"'),
  }),
  title: z.string().nullable().describe('The title of the control. Example: "POLICY AND PROCEDURES"'),
  content: z.string().nullable().describe('All text that is relates to the control, excluding technical text.'),
  docPagesRange: z.string().describe('The range of pages in the document that the control is on. Example: "1-3" or "1" if it is on a single page'),
  pdfPagesRange: z.string().describe('The range of pages in the pdf document that the control is on. Example: "1-3" or "1" if it is on a single page'),
})

// Define the type for NormalizeParsedDocument parameters
interface NormalizeParams {
  userPrompt: string // This is a string containing formatted page content
  generationId: string
  tableOfContents: string | null | undefined
}

const PromptSchema = z.object({
  controls: z.array(ControlSchema).describe('The controls of the regulation'),
})

const prompt = (tableOfContents: string | null | undefined) => `
You are tasked with extracting and normalizing controls from a NIST document into structured format.

For each control in the document, extract the following information:

1. "id": The control ID (e.g., "PM-21")
2. "suite": 
   - "id": Two-letter prefix of the control ID (e.g., "PM")
   - "name": The suite name (e.g., "PROGRAM MANAGEMENT"). In the table of contents, it is the chapter name.
3. "title": The title of the control (e.g., "ACCOUNTING OF DISCLOSURES")
4. "content": All text that is relates to the control.
5. "docPagesRange": Document page numbers where this control appears (the number after "Doc page number:" in the content)
6. "pdfPagesRange": PDF page numbers where this control appears (the number after "PDF Page number:" in the content)

!!! DO NOT MAKE UP ANY INFORMATION !!! If data isn't found, use null.

To determine which suite a control belongs to:
1. Look at the two-letter prefix in the control ID (e.g., "PM" in "PM-8")
2. Use the table of contents to match this prefix to the corresponding suite name
3. The suite ID is the two-letter prefix, and the suite name is the full name in ALL CAPS

Important notes on page numbers:
- Each content section has both "PDF Page number" and "Doc page number" specified at the beginning
- A control may span across multiple pages - check if the control continues on subsequent pages
- For controls spanning multiple pages, use a range format (e.g., "234-235")
- For controls on a single page, use just that page number (e.g., "234")
- Always check if a control starts on one page and continues to another

Other important notes:
- Control IDs appear in format "XX-##" followed by title in ALL CAPS (e.g., "PM-8 CRITICAL INFRASTRUCTURE PLAN")
- !!! DO NOT MAKE UP ANY INFORMATION !!! If data isn't found, use null.
- "PDF Page number" — the page number of the pdf document and "Doc page number" — the page number of the document, they are not the same.

Here is the table of contents for reference:
\`\`\`
${tableOfContents}
\`\`\`

Example for determining page ranges:
If PM-9 starts on PDF Page 234 (Doc page 207) and continues through PDF Page 235 (Doc page 208),
then set:
- "docPagesRange": "207-208"
- "pdfPagesRange": "234-235"

If a control appears only on one page, like PM-8 on PDF Page 234 (Doc page 207),
then set:
- "docPagesRange": "207"
- "pdfPagesRange": "234"

Before finalizing your output, record your step-by-step reasoning in the "chainOfThoughts" field.

Return your response as a JSON object with a "controls" array containing all extracted controls.
`

export const NormalizeParsedDocument = async (params: NormalizeParams): Promise<z.infer<typeof PromptSchema>> => {
  const { userPrompt, tableOfContents, generationId } = params

  const input = {
    generationId,
    name: 'normalize-parsed-document',
    userPrompt,
    systemPrompt: prompt(tableOfContents),
    schema: PromptSchema,
    modelName: modelNames.o3mini,
    temperature: 0.1,
  }

  const result = await sendGeneralLlmRequest(input)

  return PromptSchema.parse(result)
}
