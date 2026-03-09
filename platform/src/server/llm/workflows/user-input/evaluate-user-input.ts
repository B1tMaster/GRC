import { z } from 'zod'
import { sendGeneralLlmRequest } from '@/server/llm/general-llm/request'
import { modelNames } from '@/server/llm/general-llm/mappings'
import { transformToKebabCase } from '@/server/lib/utils'

const ReferenceSchema = z
  .object({
    citation: z.string().describe('Exact quote from the document'),
    location: z.string().describe('Reference identifier or section'),
    context: z.string().describe('Additional context about this reference'),
  })
  .describe('Reference to documentation')

const ThoughtSchema = z
  .object({
    thought: z.string().describe('Individual analysis step or consideration'),
    reasoning: z.string().describe('Explanation of the thought process'),
    impact: z.string().describe('How this thought affects the analysis'),
  })
  .describe('Chain of thought reasoning step')

const GapAnalysisSchema = z
  .object({
    title: z.string().describe('Brief description of the gap'),
    description: z.string().describe('Detailed explanation of the gap'),
    severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).describe('Impact severity of the gap'),

    // Evidence from security documentation
    documentEvidence: z.array(ReferenceSchema).describe('References from security documentation'),

    // Evidence from control requirements
    controlEvidence: z.array(ReferenceSchema).describe('References from control requirements'),

    // Analysis
    impact: z
      .object({
        security: z.string().describe('Security impact of this gap'),
        compliance: z.string().describe('Compliance impact of this gap'),
        operational: z.string().describe('Operational impact of this gap'),
      })
      .describe('Impact analysis'),

    // Mitigation
    recommendation: z
      .object({
        description: z.string().describe('Detailed recommendation'),
        priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).describe('Implementation priority'),
        steps: z.array(z.string()).describe('Implementation steps'),
        expectedOutcome: z.string().describe('Expected outcome after implementation'),
      })
      .describe('Gap mitigation recommendation'),
  })
  .describe('Comprehensive gap analysis')

const ControlEvaluationSchema = z.object({
  thoughtProcess: z.array(ThoughtSchema).describe('Overall evaluation thought process'),

  summary: z
    .object({
      status: z.enum(['COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT']).describe('Overall compliance status'),
      confidenceLevel: z.string().describe('Confidence in the assessment. 10-100%, with the step by 10'),
      briefing: z.string().describe('Brief assessment summary'),
    })
    .describe('Evaluation summary'),

  gaps: z.array(GapAnalysisSchema).describe('Identified gaps analysis'),

  overallRecommendations: z
    .object({
      priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).describe('Overall priority for improvements'),
      dependencies: z.array(z.string()).describe('Implementation dependencies'),
    })
    .describe('Overall recommendations'),
})

type ControlEvaluation = z.infer<typeof ControlEvaluationSchema>

const prompt = (userDocument: string, testCaseText: string) => `You are an expert system for evaluating security controls implementation in documentation.

Your task is to perform a compliance check for a specific security documentation.

Do a thorough gap analysis following these steps:

1. INITIAL ANALYSIS
- Review the provided security documentation carefully
- Identify potential gaps between documentation and control requirements
- Consider security, compliance, and operational impacts

2. GAP IDENTIFICATION
For each gap found:
- Provide exact citations from both documentation and control requirements
- Assess severity based on impact

3. RECOMMENDATION DEVELOPMENT
For each gap:
- Provide detailed mitigation steps
- Assess implementation priority
- Define expected outcomes

4. THOUGHT PROCESS
Document your analysis process using these prompts:
- "I am analyzing..."
- "This appears to be a gap because..."
- "The impact of this gap is..."
- "A suitable mitigation would be..."

Return your analysis in JSON matching the provided schema structure.

Security documentation:
\`\`\`
${userDocument}
\`\`\`

Use this to fulfill the task:
${testCaseText}
`

const propsSchema = z.object({
  testCaseId: z.string(),
  userDocument: z.string(),
  control: z.string(),
  traceId: z.string(),
  methodology: z.string(),
})
export const evaluateUserInput = async (props: z.infer<typeof propsSchema>): Promise<ControlEvaluation> => {
  const { userDocument, control, traceId, methodology, testCaseId } = propsSchema.parse(props)

  const testCaseText = `Methodology:
\`\`\`
${methodology}
\`\`\`

Control:  
\`\`\`
${control}
\`\`\`
`

  const response = await sendGeneralLlmRequest({
    generationId: traceId,
    name: `evaluate-test-case-task-${transformToKebabCase(testCaseId)}`,
    systemPrompt: prompt(userDocument, testCaseText),
    userPrompt: 'Please proceed with the analysis.',
    temperature: 0.4,
    modelName: modelNames.small,
    schema: ControlEvaluationSchema,
  })

  return ControlEvaluationSchema.parse(response)
}
