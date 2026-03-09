import { z } from 'zod'
import { sendGeneralLlmRequest } from '@/server/llm/general-llm/request'
import { modelNames } from '@/server/llm/general-llm/mappings'

const propsSchema = z.object({
  alias: z.string(),
  title: z.string(),
})

const prompt = (props: z.infer<typeof propsSchema>) => `
You are an expert cybersecurity auditor with extensive practical experience. 
Your task is to analyze control and generate practical validation steps.

Generate validation methodology using this framework:

1. PRACTICAL SIGNS OF IMPLEMENTATION
- What visible evidence proves this control exists?
- Which technical artifacts demonstrate compliance?
- What operational patterns indicate control is active?

2. COMMON EVASIONS/BYPASSES
- How do organizations often fake compliance?
- What surface-level implementations fail in practice?
- Which technical gaps are frequently missed?

3. VALIDATION STEPS
- List 3-5 concrete checks that prove real implementation
- Prioritize automated/observable evidence over documentation
- Focus on operational effectiveness over policy existence

4. EXPERT TIPS
- Share verification shortcuts based on experience
- Highlight critical indicators of poor implementation
- Note which details matter most in practice

Format each finding as:
CHECK: {what to verify}
WHY: {why this proves compliance}
HOW: {specific steps to validate}
FAIL: {what indicates check failed}

Keep focus on practical verification over theoretical compliance. Emphasize checks that can't be easily faked.

${props.alias} ${props.title}
`

const CheckStructure = z
  .object({
    check: z.string().describe('What to verify'),
    why: z.string().describe('Why this proves compliance'),
    how: z.array(z.string()).describe('Specific steps to validate'),
    fail: z.string().describe('What indicates check failed'),
  })
  .describe('Standard check structure used across all validation sections')

// Input control structure
const ControlInput = z
  .object({
    statement: z.string().describe('Original control statement text'),
    guidance: z.string().describe('Additional guidance for control implementation'),
  })
  .describe('Input control information')

// Framework section: Practical Signs of Implementation
const PracticalSigns = z
  .object({
    visibleEvidence: z.array(CheckStructure).describe('What visible evidence proves this control exists'),
    technicalArtifacts: z.array(CheckStructure).describe('Which technical artifacts demonstrate compliance'),
    operationalPatterns: z.array(CheckStructure).describe('What operational patterns indicate control is active'),
  })
  .describe('Observable evidence of control implementation')

// Framework section: Common Evasions/Bypasses
const CommonEvasions = z
  .object({
    fakeCompliance: z.array(z.string()).describe('How do organizations often fake compliance'),
    surfaceLevelImplementations: z.array(z.string()).describe('What surface-level implementations fail in practice'),
    technicalGaps: z.array(z.string()).describe('Which technical gaps are frequently missed'),
  })
  .describe('Common ways controls are bypassed or improperly implemented')

// Framework section: Validation Steps
const ValidationSteps = z
  .object({
    checks: z.array(CheckStructure).min(3).max(5).describe('3-5 concrete checks that prove real implementation'),
    automationFocus: z.boolean().describe('Prioritize automated/observable evidence over documentation'),
    operationalFocus: z.boolean().describe('Focus on operational effectiveness over policy existence'),
  })
  .describe('Specific steps to validate control implementation')

// Framework section: Expert Tips
const ExpertTips = z
  .object({
    verificationShortcuts: z.array(z.string()).describe('Verification shortcuts based on experience'),
    poorImplementationIndicators: z.array(z.string()).describe('Critical indicators of poor implementation'),
    criticalDetails: z.array(z.string()).describe('Which details matter most in practice'),
  })
  .describe('Expert guidance for effective validation')

// Complete validation methodology for any control
const ControlValidationMethodology = z.object({
  text: z.string().describe('Complete validation methodology for security controls'),
})

const GenerateExpertMethodologyPropsSchema = z.object({
  generationId: z.string(),
  testCase: propsSchema.extend({ text: z.string() }),
})
export const generateExpertMethodology = async (props: z.infer<typeof GenerateExpertMethodologyPropsSchema>): Promise<z.infer<typeof ControlValidationMethodology>> => {
  const { generationId, testCase } = GenerateExpertMethodologyPropsSchema.parse(props)

  const { text, title, alias } = testCase

  const response = await sendGeneralLlmRequest({
    generationId: generationId,
    name: 'generate-expert-methodology',
    userPrompt: text,
    modelName: modelNames.o3mini,
    systemPrompt: prompt({ title, alias }),
    schema: ControlValidationMethodology,
  })

  return ControlValidationMethodology.parse(response)
}
