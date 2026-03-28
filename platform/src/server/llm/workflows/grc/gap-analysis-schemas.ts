import { z } from 'zod'

export const PolicyGapSchema = z.object({
  policyName: z
    .string()
    .describe(
      'Name and version of the affected policy (e.g. "Data Encryption Policy v2.1") or "Missing: <name>" for entirely absent policies',
    ),
  gapDescription: z.string().describe('Concise human-readable description of the gap'),
  frameworksAffected: z
    .array(
      z.object({
        frameworkName: z
          .string()
          .describe('Framework or standard name (e.g. "NIST 800-53", "ISO 27001", "COBIT 2019")'),
        sectionRef: z
          .string()
          .describe('Specific section, control, or clause reference (e.g. "AC-2", "A.10.1.2", "§4.1")'),
      }),
    )
    .describe('Frameworks and specific sections affected by this gap'),
  priority: z
    .enum(['High', 'Medium', 'Low'])
    .describe(
      'High = mandatory requirement completely missing; Medium = requirement exists but outdated or incomplete; Low = minor enhancement opportunity',
    ),
  action: z
    .enum(['Draft Revision', 'Draft New'])
    .describe(
      '"Draft Revision" when existing policy needs updating; "Draft New" when no policy exists for the domain',
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence score (0-1) in the accuracy of this gap identification'),
  reasoning: z
    .string()
    .describe(
      'Explanation of why this gap was identified, what the policy is missing, and which framework requirements mandate the change',
    ),
})

export const PolicyGapAnalysisResponseSchema = z.object({
  gaps: z.array(PolicyGapSchema).describe('List of identified policy gaps'),
  summary: z
    .string()
    .describe('Overall summary of the gap analysis findings and key themes'),
})

export type PolicyGap = z.infer<typeof PolicyGapSchema>
export type PolicyGapAnalysisResponse = z.infer<typeof PolicyGapAnalysisResponseSchema>
