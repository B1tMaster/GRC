import { z } from 'zod'

export const ParseSchema = z.object({
  chainOfThoughts: z.array(z.string()).describe('Explain your reasoning on determining the control names. Why and how you determined each of the control names.'),
  lackOfInformation: z.boolean().describe('Whether there is lack of information to determine at least one field except page number.'),
  tableOfContents: z.boolean().describe('Set true if the page is a table of contents.'),
  content: z.string().describe('The content of the page'),
  controlNames: z.array(z.string()).nullable().describe('The unique names of the controls on the page. Example: "ACCOUNT MANAGEMENT"'),
  pageNumber: z.number().nullable().describe('The page number of the page'),
})

export type ParsedPageContent = z.infer<typeof ParseSchema>

export const NIST80053OCRPrompt = `
You will be provided with the parts of a regulation document of the NIST 800-53.
Convert the following document to markdown.
Return only the markdown with no explanation text. Do not include delimiters like \`\`\`markdown or \`\`\`html.

Add only existing information from the document. Do not make up any information.

IMPORTANT: For control names in NIST 800-53, follow these specific rules:
- The main control identifier appears in a format like "AC-2 ACCOUNT MANAGEMENT"
- Control enhancements appear in a format like "(1) ACCOUNT MANAGEMENT | AUTOMATED SYSTEM ACCOUNT MANAGEMENT"
- For control enhancements (numbered items in parentheses), the control name is the text that appears BEFORE the pipe symbol (|). For example, in "(8) ACCOUNT MANAGEMENT | DYNAMIC ACCOUNT MANAGEMENT", the control name is "ACCOUNT MANAGEMENT".
- The text after the pipe symbol (|) is the name of the enhancement, not the control name.
- If no main control identifier is present on the page and you only see control enhancements, determine the control name from the text before the pipe symbol (|) in the enhancements.

Return a list of unique control names found on the page in the controlNames list.
If there are in the list duplicates, leave only the first occurrence.


If there is lack of information to determine at least one field except page number, return lackOfInformation: true and end your response.


The page number is on the bottom right of the page.

RULES:
- You must include all information on the page. Do not exclude headers, footers, or subtext.
- Return tables in an HTML format.
- Charts & infographics must be interpreted to a markdown format. Prefer table format when applicable.
- Logos should be wrapped in brackets. Ex: <logo>Coca-Cola<logo>
- Watermarks should be wrapped in brackets. Ex: <watermark>OFFICIAL COPY<watermark>
- Page numbers should be wrapped in brackets. Ex: <page_number>14<page_number> or <page_number>9/22<page_number>
- Prefer using ☐ and ☑ for check boxes.
- Do not add any line breaks in the string fields.
- Do not make up any information, only use the provided text.
`
