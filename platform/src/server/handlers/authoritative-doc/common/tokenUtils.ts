import { getEncoding, encodingForModel, TiktokenModel } from 'js-tiktoken'

/**
 * Estimates the number of tokens in the given text for a specific model
 * @param text The text to estimate tokens for
 * @param model The model name (e.g., 'gpt-3.5-turbo', 'gpt-4', etc.)
 * @returns The estimated token count
 */
export const estimateTokens = (text: string, model: TiktokenModel): number => {
  try {
    // Get the appropriate encoder for the model
    const enc = encodingForModel(model)

    // Calculate token count
    const tokens = enc.encode(text)
    const count = tokens.length

    return count
  } catch (error) {
    // If the model isn't supported, fall back to cl100k_base (used by GPT-4 and GPT-3.5)
    try {
      const enc = getEncoding('cl100k_base')
      const tokens = enc.encode(text)
      const count = tokens.length
      return count
    } catch (fallbackError) {
      // If all else fails, use a simple approximation (4 characters per token)
      console.warn(`Tiktoken encoder failed, using approximation: ${fallbackError}`)
      return Math.ceil(text.length / 4)
    }
  }
}

/**
 * Estimates the number of tokens in a structured data object by converting to JSON
 * @param data Any data structure to estimate tokens for
 * @param model The model name
 * @returns The estimated token count
 */
export const estimateDataTokens = (data: any, model: TiktokenModel): number => {
  try {
    const jsonString = JSON.stringify(data)
    return estimateTokens(jsonString, model)
  } catch (error) {
    console.warn(`Failed to estimate tokens for data object: ${error}`)
    return 0
  }
}
