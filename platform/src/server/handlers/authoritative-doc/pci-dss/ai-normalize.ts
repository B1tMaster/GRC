import { modelNames } from '@/server/llm/general-llm/mappings'
import { sendGeneralLlmRequest } from '@/server/llm/general-llm/request'
import { z } from 'zod'

const ControlSchema = z.object({
  chainOfThoughts: z.array(z.string()).describe('Before fill up the response, think step by step and write down your thoughts here'),
  id: z.string().nullable().describe('The id of the control. Example: "req-1.1"'),
  suite: z.object({
    validation: z.boolean().describe('Set true if you sure that this suite is corresponds with the page of the table of contents'),
    id: z.string().nullable().describe('The id of the control family. Example: "req-1"'),
    name: z.string().nullable().describe('The name of the control family. Example: "Requirement 1: Install and Maintain Network Security Controls"'),
  }),
  title: z.string().nullable().describe('The title of the control. Should be generated from the control statement, one sentence maximum.'),
  content: z.string().nullable().describe('All text that is relates to the requirement'),
  docPagesRange: z.string().describe('The range of pages in the document that the control is on. Example: "1-3" or "1" if it is on a single page'),
  pdfPagesRange: z.string().describe('The range of pages in the pdf document that the control is on. Example: "1-3" or "1" if it is on a single page'),
})

// Define the type for NormalizeParsedDocument parameters
interface NormalizeParams {
  userPrompt: string // This is a string containing formatted page content
  tableOfContents: string | null | undefined
  traceId: string
}

const PromptSchema = z.object({
  controls: z.array(ControlSchema).describe('The controls of the regulation'),
})

const prompt = (tableOfContents: string | null | undefined) => `You are tasked with extracting and normalizing controls from a PCI-DSS document into structured format.

## Control Hierarchy Definition
- **Suite**: Each of the 12 PCI DSS requirements (e.g., "Requirement 1: Install and Maintain Network Security Controls")
- **Control**: three-level sub-sub-requirements (1.1.1, 1.1.2, etc.)

## Control Identifiers
- Each unique numeric sequence (e.g., 9.4.4, 9.4.5, 9.4.5.1, 9.5.1.2.1) represents a distinct control
- Treat each control as a separate entity with its own entry in the output
- Format all control IDs as "req-X.Y.Z..." preserving all numeric levels
- Controls with letter suffixes (e.g., 9.4.4.a, 9.4.4.b) are testing procedures belonging to their parent control, not separate controls
- A new control begins whenever a new numbered requirement statement appears

## Content Boundaries
- Extract all text related to a control from where its numbered identifier first appears until the next control identifier begins or the page ends
- When a control spans multiple pages (indicated by "Continued" text), merge all its content across those pages
- When a page contains content from multiple controls, carefully separate content based on control identifiers
- Include all sections (requirements, objectives, notes, testing procedures, purpose statements) that directly relate to the specific control number
- The beginning of a new control is marked by a new numbered identifier, not by section headers

## Information to Extract for Each Control
1. **"id"**: 
   - Format as "req-X.Y.Z" (e.g., "req-1.1.1")
2. **"suite"**: 
   - **"id"**: Always format as "req-X" based on the main requirement number (e.g., "req-1")
   - **"name"**: The complete requirement name from the table of contents
3. **"title"**: The title text of the control. Generate it from the control statement, one sentence maximum.
4. **"content"**: All text that is relates to the requirement.
5. **"docPagesRange"**: Document page range (from "Doc page number:" values)
6. **"pdfPagesRange"**: PDF page range (from "PDF Page number:" values)

## Page Range Rules
- For controls on a single page: use single value (e.g., "234")
- For controls spanning multiple pages: use range format (e.g., "234-235")
- Always verify if a control continues across pages

## Important Notes
- If data isn't found for any field, use null (not empty string)
- DO NOT MAKE UP ANY INFORMATION
- "PDF Page number" and "Doc page number" are different - capture both correctly

## Table of Contents Reference

\`\`\`
${tableOfContents}
\`\`\`

Example for determining page ranges:
If Control starts on PDF Page 234 (Doc page 207) and continues through PDF Page 235 (Doc page 208),
then set:
- "docPagesRange": "207-208"
- "pdfPagesRange": "234-235"

If a control appears only on one page, then set:
- "docPagesRange": "207"
- "pdfPagesRange": "234"

Before finalizing your output, record your step-by-step reasoning in the "chainOfThoughts" field.

Return your response as a JSON object with a "controls" array containing all extracted controls.
`

export const generateNormalizedControls = async (params: NormalizeParams): Promise<z.infer<typeof PromptSchema>> => {
  const { userPrompt, tableOfContents, traceId } = params

  const input = {
    generationId: traceId,
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
