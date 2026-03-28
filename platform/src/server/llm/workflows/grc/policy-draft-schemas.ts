import { z } from 'zod'

export const DraftSectionSchema = z.object({
  type: z.enum(['added', 'modified', 'removed']).describe('Type of change'),
  sectionNumber: z.string().describe('Section number (e.g. "4.2", "5.1.3")'),
  title: z.string().describe('Section title'),
  content: z.string().describe('Full text of the new or modified section'),
  previousContent: z
    .string()
    .optional()
    .describe('Previous text for modified/removed sections'),
  citations: z
    .array(
      z.object({
        frameworkName: z.string().describe('Framework or standard name'),
        sectionRef: z.string().describe('Specific section reference'),
        description: z.string().describe('What this citation supports'),
      }),
    )
    .describe('Framework citations supporting this section'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Confidence score for this section (0-1)'),
})

export const DraftRationaleSchema = z.object({
  whyNeeded: z
    .array(z.string())
    .describe('Reasons why this change is needed'),
  frameworksMandating: z
    .array(z.string())
    .describe('Frameworks that mandate this change'),
  relatedArtifactImpact: z
    .array(z.string())
    .describe('Impact on related policies, controls, or processes'),
})

export const PolicyDraftResponseSchema = z.object({
  policyName: z.string().describe('Name of the drafted or revised policy'),
  version: z.string().describe('New version number (e.g. "v3.0")'),
  sections: z.array(DraftSectionSchema).describe('Drafted policy sections with changes'),
  overallConfidence: z
    .number()
    .min(0)
    .max(1)
    .describe('Overall confidence score for the entire draft'),
  rationale: DraftRationaleSchema.describe('Agent rationale for the changes'),
  humanDraftRequired: z
    .boolean()
    .describe('True if confidence < 70% — requires human drafting'),
  humanDraftReason: z
    .string()
    .optional()
    .describe('Explanation if human draft is required'),
})

export type DraftSection = z.infer<typeof DraftSectionSchema>
export type PolicyDraftResponse = z.infer<typeof PolicyDraftResponseSchema>
