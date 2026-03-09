import { z } from 'zod'
import { sendGeneralLlmRequest } from '@/server/llm/general-llm/request'
const prompt = `
Your task is to generate a table of contents for the given document.
If the document is already structured, use it structure but add more details for each section.
`

const propsSchema = z.object({
  inputFile: z.string(),
  generationId: z.string(),
})
export const generateTableOfContents = async (props: z.infer<typeof propsSchema>) => {
  const { inputFile, generationId } = propsSchema.parse(props)

  const response = await sendGeneralLlmRequest({
    generationId: generationId,
    name: 'generate-table-of-contents',
    userPrompt: inputFile,
    systemPrompt: prompt,
    temperature: 0.5,
  })

  return response
}
