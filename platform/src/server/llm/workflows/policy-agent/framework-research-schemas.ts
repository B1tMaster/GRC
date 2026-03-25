import { z } from 'zod'

export const FrameworkMappingItemSchema = z.object({
  objectiveTheme: z.string().describe('The theme of the objective being mapped'),
  domain: z.string().describe('GRC domain (e.g. Access Control, Encryption, Incident Response, AI Governance, Change Management)'),
  mappings: z.array(z.object({
    frameworkCode: z.string().describe('Framework identifier (NIST_800_53, ISO27001, COBIT2019, HKMA_SPM, PCI_DSS, COSO_ERM)'),
    controlId: z.string().describe('Specific control ID (e.g. AC-2, A.9.2, DSS05, Req 7)'),
    controlName: z.string().describe('Name of the control'),
    relevance: z.number().min(0).max(1).describe('Relevance score 0.0 to 1.0'),
    rationale: z.string().describe('Brief explanation of why this control applies to this objective'),
  })),
})

export const CrossFrameworkRowSchema = z.object({
  domain: z.string().describe('GRC domain name'),
  nist: z.string().describe('NIST 800-53 control references (comma-separated)'),
  iso: z.string().describe('ISO 27001 control references'),
  cobit: z.string().describe('COBIT 2019 control references'),
  pci: z.string().describe('PCI DSS control references'),
  hkma: z.string().describe('HKMA SPM control references'),
})

export const FrameworkResearchResponseSchema = z.object({
  chainOfThought: z.string().describe('Step-by-step reasoning about which frameworks and controls apply to each objective'),
  researchSummary: z.string().describe('Summary of frameworks researched and key cross-references found'),
  objectiveMappings: z.array(FrameworkMappingItemSchema),
  crossFrameworkTable: z.array(CrossFrameworkRowSchema),
  frameworksResearched: z.array(z.string()).describe('List of framework codes that were researched'),
  totalMappings: z.number(),
})

export type FrameworkResearchResponse = z.infer<typeof FrameworkResearchResponseSchema>
