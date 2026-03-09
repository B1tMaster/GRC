import { z } from 'zod'

export const ParseSchema = z.object({
  chainOfThoughts: z.array(z.string()).describe('Explain your reasoning on determining the control names. Why and how you determined each of the control names.'),
  lackOfInformation: z.boolean().describe('Whether there is lack of information to determine at least one field except page number.'),
  tableOfContents: z.boolean().describe('Set true if the page is a table of contents.'),
  content: z.string().optional().describe('Content of the page'),

  pageNumber: z.number().nullable().describe('The page number of the page'),
})

export type ParsedPageContent = z.infer<typeof ParseSchema>

export const PciDssOcrPrompt = `
You will be provided with the parts of a regulation document of the PCI DSS.
Convert the following document to markdown.
Return only the markdown with no explanation text. Do not include delimiters like \`\`\`markdown or \`\`\`html.

Add only existing information from the document. Do not make up any information.

Place a page content in the "content" field.

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
