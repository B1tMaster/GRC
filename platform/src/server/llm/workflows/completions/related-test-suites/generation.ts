import { z } from 'zod'
import { sendGeneralLlmRequest } from '@/server/llm/general-llm/request'
import { modelNames } from '@/server/llm/general-llm/mappings'

export const llmOutputSchema = z.object({
  chainOfThought: z.string().describe('The chain of thought'),
  relevantAuthoritativeDocumentSections: z.array(
    z.object({
      alias: z.string().describe('The alias of the relevant section'),
      title: z.string().describe('The title of the relevant section'),
      justification: z.string().describe('The justification for why this section is relevant'),
    })
  ),
})

export const responseSchema = llmOutputSchema.pick({ relevantAuthoritativeDocumentSections: true })
export type CompletionRelatedTestSuitesResponse = z.infer<typeof responseSchema>

const prompt = (authoritativeDocument: string, sections: { title: string; alias: string }[]) => `You are a specialized compliance assessment system. Your task is to:

1. Analyze the user-provided document that describes their company practices and systems
2. Identify which sections of authoritative compliance frameworks (NIST, PCI DSS, ISO, etc.) are relevant based on the content of the user document
3. Only select sections from authoritative documents that are directly related to topics covered in the user's document
4. Provide a mapping of relevance with justification

## Analysis Process:

Step 1: Extract key topics from the user document
- Identify main systems, processes, and security controls described
- Note what the document explicitly covers (and by omission, what it doesn't cover)
- Determine the scope of the company's operations as described

Step 2: Map relevant authoritative document sections
- For each key topic identified, determine which specific sections of the compliance frameworks apply
- Only include sections that directly relate to practices or systems mentioned in the user document
- Exclude sections that reference controls or requirements not relevant to the described environment

Step 3: Provide assessment output
- List each relevant compliance section with a direct reference to where in the user document it applies
- Include a brief justification explaining why this section is relevant


Authoritative document is ${authoritativeDocument}

Authoritative document sections:
\`\`\`
${sections.map(section => `alias: ${section.alias}, title: ${section.title}`).join('\n')}
\`\`\`

Note: Only include compliance sections that are directly related to the content provided. 
If the user document doesn't mention password policies, remote access, physical security, etc., do NOT include compliance sections for those topics.
`

const GenerateRelatedTestSuitesPropsSchema = z.object({
  userInput: z.string(),
  choosedAuthoritativeDocument: z.string(),
  testSuites: z.array(
    z.object({
      title: z.string(),
      alias: z.string(),
    })
  ),
  traceId: z.string(),
})

export const generateRelatedTestSuites = async (props: z.infer<typeof GenerateRelatedTestSuitesPropsSchema>): Promise<z.infer<typeof responseSchema>> => {
  const { userInput, choosedAuthoritativeDocument, testSuites, traceId } = GenerateRelatedTestSuitesPropsSchema.parse(props)

  const userPrompt = userInput

  const response = await sendGeneralLlmRequest({
    generationId: traceId,
    name: 'generate-related-test-suites',
    userPrompt: userPrompt,
    systemPrompt: prompt(choosedAuthoritativeDocument, testSuites),
    schema: llmOutputSchema,
    modelName: modelNames.o3mini,
    temperature: 0.5,
  })

  return responseSchema.parse(response)
}

export const generateDocSummary = async (props: { userInput: string; traceId: string }): Promise<string> => {
  const { userInput, traceId } = props

  const response = await sendGeneralLlmRequest<string>({
    generationId: traceId,
    name: 'generate-doc-summary',
    userPrompt: userInput,
    systemPrompt: `You are a specialized compliance assessment system. Your task is to:

1. Analyze the user-provided document that describes their company practices and systems
2. Provide a summary of the document
3. Summary maximum is 2-4 sentences

Output format:
- Just a summary text, without any other formatting, comments, intros, etc
`,
    modelName: modelNames.o3mini,
    temperature: 0.5,
  })

  return response
}
