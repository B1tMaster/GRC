import OpenAI, { APIConnectionTimeoutError } from 'openai'
import { z, ZodType } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'
import { langfuse } from '@/server/llm/observability/langfuse'
import { RedisCache } from '@/server/services/cache/redis'
import { generateHash } from '@/server/lib/utils'

const ParamsSchema = z.object({
  name: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  userPrompt: z.string(),
  schema: z.instanceof(ZodType).optional(),
  temperature: z.number().default(0.8).optional(),
  systemPrompt: z.string(),
  generationId: z.string(),
  modelName: z.string().optional(),
})

export const MessagesSchema = z.array(
  z.discriminatedUnion('role', [
    z.object({
      role: z.literal('system'),
      content: z.string(),
    }),
    z.object({
      role: z.literal('user'),
      content: z.string(),
    }),
    z.object({
      role: z.literal('assistant'),
      content: z.string().optional(),
      function_call: z
        .object({
          name: z.string(),
          arguments: z.string(),
        })
        .optional(),
    }),
  ])
)

export type Messages = z.infer<typeof MessagesSchema>

export async function sendGeneralLlmRequest(params: z.infer<typeof ParamsSchema>): Promise<any> {
  const { name, userPrompt, schema, temperature, systemPrompt, generationId } = ParamsSchema.parse(params)
  let { modelName } = ParamsSchema.parse(params)

  const cache = new RedisCache()

  const cacheKey = `${name}:${generateHash(userPrompt)}:${generateHash(systemPrompt)}`
  if (process.env.NODE_ENV === 'development') {
    console.log('cacheKey', cacheKey)
  }

  const cached = await cache.get(cache.mappings.generalLlm(cacheKey))
  if (cached) {
    return cached
  }

  const trace = langfuse.trace({ id: generationId })

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60 * 1000 * 3,
  })

  modelName = modelName ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini-2024-07-18'

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ] as Messages

  let responseSchema
  if (schema) responseSchema = zodResponseFormat(schema, name)

  const generation = trace.generation({
    name,
    input: { messages, schema: responseSchema },
    model: modelName,
  })

  let retries = 0
  const maxRetries = 3
  const initialDelay = 1000 // 1 second
  let delay = initialDelay

  while (true) {
    try {
      const response = await client.beta.chat.completions.parse({
        model: modelName,
        messages: messages,
        response_format: responseSchema,
        ...(modelName.includes('o3-mini') || modelName.includes('o4-mini')
          ? { max_completion_tokens: 50000 }
          : {
              max_tokens: 16000,
              temperature: temperature,
            }),
      })

      let content
      if (schema) {
        content = response.choices[0].message.parsed as unknown as object
      } else {
        content = response.choices[0].message.content as unknown as string
      }

      generation.end({
        output: content,
        usage: response.usage
          ? {
              input: response.usage.prompt_tokens,
              output: response.usage.completion_tokens,
              total: response.usage.total_tokens,
              unit: 'TOKENS' as const,
            }
          : undefined,
      })

      await cache.set(cache.mappings.generalLlm(cacheKey), content, 60 * 60 * 24 * 7) // 1 week()

      return content
    } catch (error) {
      const isTimeoutError = error instanceof APIConnectionTimeoutError

      if (isTimeoutError && retries < maxRetries) {
        console.warn(`Timeout error encountered. Retrying in ${delay / 1000} seconds... (Attempt ${retries + 1}/${maxRetries})`, { name, generationId })
        await new Promise(resolve => setTimeout(resolve, delay))
        retries++
        delay *= 2 // Exponential backoff
      } else {
        // Not a timeout error or max retries reached
        generation.end({
          output: { error: error instanceof Error ? error.message : String(error) },
        })
        console.error(`Request failed for ${name} after ${retries} retries or due to a non-timeout error:`, error)
        throw error // Re-throw the error
      }
    }
  }
}
