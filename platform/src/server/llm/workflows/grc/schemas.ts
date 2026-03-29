import { z } from 'zod'

export const ExtractedGovernanceObjectiveSchema = z.object({
  text: z.string().describe('The governance objective text extracted from the document'),
  sourceSection: z.string().describe('Title or heading of the source section'),
  sourceSectionType: z.enum([
    'board_responsibilities',
    'risk_appetite',
    'matters_reserved',
    'agenda_item',
    'committee_update',
    'strategic_objectives',
    'governance_principles',
    'risk_management',
    'compliance',
    'other',
  ]),
  extractionConfidence: z.enum(['high', 'medium', 'low']),
  keywords: z.array(z.string()).describe('Governance domain keywords found in the objective'),
})

export const GovernanceObjectivesResponseSchema = z.object({
  objectives: z.array(ExtractedGovernanceObjectiveSchema),
  documentSummary: z.string().describe('Brief summary of the document and its governance relevance'),
})

export const DerivedControlObjectiveSchema = z.object({
  title: z.string().describe('Short title for the control objective'),
  description: z.string().describe('Detailed description of the control objective'),
  category: z.enum(['preventive', 'detective', 'corrective', 'directive']),
  owner: z.string().describe('Suggested role or function responsible'),
  frequency: z.enum(['continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annual', 'event_driven']),
  frameworkReferences: z.array(
    z.object({
      frameworkCode: z.string(),
      controlId: z.string(),
      controlName: z.string(),
    })
  ),
  confidence: z.enum(['high', 'medium', 'low']),
})

export const ControlObjectivesResponseSchema = z.object({
  controls: z.array(DerivedControlObjectiveSchema),
})

export const ExtractedRiskAppetiteSchema = z.object({
  statement: z.string(),
  riskCategory: z.enum([
    'strategic',
    'operational',
    'financial',
    'compliance',
    'technology',
    'reputational',
    'cyber',
  ]),
  appetiteLevel: z.enum(['averse', 'minimal', 'cautious', 'open', 'hungry']),
  toleranceThreshold: z.string().optional().describe('Quantitative or qualitative tolerance boundary'),
  sourceSection: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
})

export const RiskAppetiteResponseSchema = z.object({
  statements: z.array(ExtractedRiskAppetiteSchema),
})

export const FrameworkMappingSchema = z.object({
  controlId: z.string(),
  controlName: z.string(),
  frameworkCode: z.string(),
  similarityScore: z.number().min(0).max(1),
  confidence: z.enum(['high', 'medium', 'low']),
  matchedKeywords: z.array(z.string()),
  rationale: z.string(),
})

export const FrameworkMappingResponseSchema = z.object({
  mappings: z.array(FrameworkMappingSchema),
})

export type GovernanceObjectivesResponse = z.infer<typeof GovernanceObjectivesResponseSchema>
export type ControlObjectivesResponse = z.infer<typeof ControlObjectivesResponseSchema>
export type RiskAppetiteResponse = z.infer<typeof RiskAppetiteResponseSchema>
