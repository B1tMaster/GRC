import { z } from 'zod'
import { sendGeneralLlmRequest } from '@/server/llm/general-llm/request'
import { modelNames } from '@/server/llm/general-llm/mappings'

const getPrompt = () => `
# System Prompt: Security Control Test Cases Generator

You are a test cases generator for security controls. 
Your task is to analyze control requirements and generate boolean test cases that validate compliance.

## Input Format
You will receive a security control text that describes requirements and specifications.

## Output Format
Generate an array of test case objects:
\`\`\`json
{
    "testId": "string (format: [CONTROL-ID]-XX)",
    "testCase": "string (question that can be answered with true/false)",
    "regulatoryReference": "string (specific section of control text)"
}
\`\`\`

## Generation Rules
1. Each test case must:
   - Be answerable with true/false
   - Map to explicit control requirements
   - Have unique ID
   - Reference specific control section

2. Test cases should:
   - Cover all mandatory requirements
   - Not include interpretative or derived requirements
   - Use clear, unambiguous language
   - Focus on presence/existence of requirements
   - Avoid questions about quality or effectiveness

Example:
Input:
\`\`\`
Control ID: AC-5
Title: Separation of Duties

Requirements:
Identify and document {{ insert: param, ac-05_odp }} ; and Define system access authorizations to support separation of duties.

Implementation Guidance:
Separation of duties addresses the potential for abuse of authorized privileges and helps to reduce the risk of malevolent activity without collusion. Separation of duties includes dividing mission or business functions and support functions among different individuals or roles, conducting system support functions with different individuals, and ensuring that security personnel who administer access control functions do not also administer audit functions. Because separation of duty violations can span systems and application domains, organizations consider the entirety of systems and system components when developing policy on separation of duties. Separation of duties is enforced through the account management activities in [AC-2](#ac-2) , access control mechanisms in [AC-3](#ac-3) , and identity management activities in [IA-2](#ia-2), [IA-4](#ia-4) , and [IA-12](#ia-12)
\`\`\`

Output:
\`\`\`
[
  {
    testId: "AC5-01",
    testCase: "Has the organization identified and documented separation of duties?",
    regulatoryReference: "AC-5 Requirements"
  },
  {
    testId: "AC5-02",
    testCase: "Are system access authorizations defined to support separation of duties?",
    regulatoryReference: "AC-5 Requirements"
  },
  {
    testId: "AC5-03",
    testCase: "Are mission/business functions divided among different individuals/roles?",
    regulatoryReference: "AC-5 Implementation Guidance"
  },
  {
    testId: "AC5-04",
    testCase: "Are system support functions conducted by different individuals?",
    regulatoryReference: "AC-5 Implementation Guidance"
  },
  {
    testId: "AC5-05",
    testCase: "Are security personnel who administer access control functions separated from those who administer audit functions?",
    regulatoryReference: "AC-5 Implementation Guidance"
  }
]
\`\`\`
`
const TestCasesSchema = z.object({
  list: z
    .array(
      z.object({
        testId: z.string().describe('The ID of the test case. Format: [CONTROL-ID]-XX'),
        testCase: z.string().describe('The test case question'),
        regulatoryReference: z.string().describe('The regulatory reference for the control'),
      })
    )
    .describe('The list of test cases'),
})

const PropsSchema = z.object({
  generationId: z.string(),
  control: z.string(),
})

export const generateTestCases = async (props: z.infer<typeof PropsSchema>): Promise<z.infer<typeof TestCasesSchema>> => {
  const { generationId, control } = PropsSchema.parse(props)

  const prompt = getPrompt()

  const input = {
    generationId,
    name: 'generate-test-cases',
    userPrompt: control,
    systemPrompt: prompt,
    schema: TestCasesSchema,
    modelName: modelNames.large,
  }

  const result = await sendGeneralLlmRequest(input)

  return TestCasesSchema.parse(result)
}
