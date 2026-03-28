import { PolicyGapSchema, PolicyGapAnalysisResponseSchema } from '../server/llm/workflows/grc/gap-analysis-schemas'
import { DraftSectionSchema, PolicyDraftResponseSchema } from '../server/llm/workflows/grc/policy-draft-schemas'
import { GAP_ANALYSIS_SYSTEM_PROMPT, buildGapAnalysisUserPrompt } from '../server/llm/workflows/grc/gap-analysis-prompts'
import { POLICY_DRAFTING_SYSTEM_PROMPT, buildPolicyDraftUserPrompt } from '../server/llm/workflows/grc/policy-draft-prompts'
import { PolicyGapAnalysesCollection } from '../collections/PolicyGapAnalyses/collection'
import { PolicyDraftsCollection } from '../collections/PolicyDrafts/collection'
import { PipelineRunsCollection } from '../collections/PipelineRuns/collection'
import { ChallengesCollection } from '../collections/Challenges/collection'
import { AuditTrailEntriesCollection } from '../collections/AuditTrailEntries/collection'
import { DecisionLogsCollection } from '../collections/DecisionLogs/collection'
import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  PASS: ${label}`)
    passed++
  } else {
    console.log(`  FAIL: ${label}`)
    failed++
  }
}

console.log('='.repeat(60))
console.log('Sprint 1 Comprehensive Validation')
console.log('='.repeat(60))

// 1. EVX-5: Gap Analysis Schemas
console.log('\n[1] EVX-5: Gap Analysis Schemas')
assert(!!PolicyGapSchema, 'PolicyGapSchema exists')
assert(!!PolicyGapAnalysisResponseSchema, 'PolicyGapAnalysisResponseSchema exists')
assert(GAP_ANALYSIS_SYSTEM_PROMPT.length > 100, 'Gap analysis system prompt is substantial')
const gapUserPrompt = buildGapAnalysisUserPrompt({
  documentTitle: 'Test', policyText: 'test', frameworkRequirements: 'test', governanceObjectives: 'test'
})
assert(gapUserPrompt.includes('Test'), 'Gap analysis user prompt builder works')

// 2. EVX-6: Policy Drafting Schemas
console.log('\n[2] EVX-6: Policy Drafting Schemas')
assert(!!DraftSectionSchema, 'DraftSectionSchema exists')
assert(!!PolicyDraftResponseSchema, 'PolicyDraftResponseSchema exists')
assert(POLICY_DRAFTING_SYSTEM_PROMPT.length > 100, 'Policy drafting system prompt is substantial')
assert(POLICY_DRAFTING_SYSTEM_PROMPT.includes('citation'), 'System prompt mentions citations')
assert(POLICY_DRAFTING_SYSTEM_PROMPT.includes('confidence'), 'System prompt mentions confidence')
const draftUserPrompt = buildPolicyDraftUserPrompt({
  gapPolicyName: 'Test', gapDescription: 'test', frameworksAffected: 'test', existingPolicyText: '', priority: 'High'
})
assert(draftUserPrompt.includes('Test'), 'Policy draft user prompt builder works')

// Validate draft schema structure
const draftParse = PolicyDraftResponseSchema.safeParse({
  policyName: 'Data Encryption Policy',
  version: 'v3.0',
  sections: [{
    type: 'added',
    sectionNumber: '4.2',
    title: 'Test Section',
    content: 'Test content',
    citations: [{ frameworkName: 'NIST', sectionRef: 'AC-2', description: 'test' }],
    confidence: 0.9,
  }],
  overallConfidence: 0.85,
  rationale: {
    whyNeeded: ['Regulatory requirement'],
    frameworksMandating: ['NIST'],
    relatedArtifactImpact: ['Key Management Policy'],
  },
  humanDraftRequired: false,
})
assert(draftParse.success, 'PolicyDraftResponseSchema parses valid data')

// 3. EVX-6: PolicyDrafts Collection
console.log('\n[3] EVX-6: PolicyDrafts Collection')
assert(PolicyDraftsCollection.slug === 'policy-drafts', 'PolicyDrafts slug is correct')
const draftFields = PolicyDraftsCollection.fields.map((f: any) => f.name)
assert(draftFields.includes('draftId'), 'Has draftId field')
assert(draftFields.includes('policyName'), 'Has policyName field')
assert(draftFields.includes('sections'), 'Has sections field')
assert(draftFields.includes('overallConfidence'), 'Has overallConfidence field')
assert(draftFields.includes('humanDraftRequired'), 'Has humanDraftRequired field')
assert(draftFields.includes('rationale'), 'Has rationale group')
assert(draftFields.includes('sourceGap'), 'Has sourceGap relationship')
assert(draftFields.includes('status'), 'Has status field')
assert(draftFields.includes('approvedBy'), 'Has approvedBy field')

// 4. EVX-7: PipelineRuns Collection
console.log('\n[4] EVX-7: PipelineRuns Collection')
assert(PipelineRunsCollection.slug === 'pipeline-runs', 'PipelineRuns slug is correct')
const pipeFields = PipelineRunsCollection.fields.map((f: any) => f.name)
assert(pipeFields.includes('runId'), 'Has runId field')
assert(pipeFields.includes('sourceDocument'), 'Has sourceDocument relationship')
assert(pipeFields.includes('traceId'), 'Has traceId field')
assert(pipeFields.includes('status'), 'Has status field')
assert(pipeFields.includes('steps'), 'Has steps array')
assert(pipeFields.includes('elapsedMs'), 'Has elapsedMs field')
assert(pipeFields.includes('results'), 'Has results group')

// 5. EVX-8: Challenges Collection
console.log('\n[5] EVX-8: Challenges Collection')
assert(ChallengesCollection.slug === 'challenges', 'Challenges slug is correct')
const chalFields = ChallengesCollection.fields.map((f: any) => f.name)
assert(chalFields.includes('challengeId'), 'Has challengeId field')
assert(chalFields.includes('policyDraft'), 'Has policyDraft relationship')
assert(chalFields.includes('challengedBy'), 'Has challengedBy field')
assert(chalFields.includes('rationale'), 'Has rationale field')
assert(chalFields.includes('status'), 'Has status field')

// 6. DecisionLogs updated entity types
console.log('\n[6] DecisionLogs Integration')
const entityTypeField = DecisionLogsCollection.fields.find((f: any) => f.name === 'entityType') as any
const entityOptions = entityTypeField?.options?.map((o: any) => o.value) || []
assert(entityOptions.includes('policy-gap-analysis'), 'DecisionLogs has policy-gap-analysis entity')
assert(entityOptions.includes('policy-draft'), 'DecisionLogs has policy-draft entity')

const agentTypeField = DecisionLogsCollection.fields.find((f: any) => f.name === 'agentType') as any
const agentOptions = agentTypeField?.options?.map((o: any) => o.value) || []
assert(agentOptions.includes('gap_analyzer'), 'DecisionLogs has gap_analyzer agent')
assert(agentOptions.includes('policy_drafter'), 'DecisionLogs has policy_drafter agent')

// 7. AuditTrailEntries updated event types
console.log('\n[7] AuditTrailEntries Integration')
const eventField = AuditTrailEntriesCollection.fields.find((f: any) => f.name === 'eventType') as any
const eventOptions = eventField?.options?.map((o: any) => o.value) || []
assert(eventOptions.includes('policy_draft_created'), 'Has policy_draft_created event')
assert(eventOptions.includes('policy_approved'), 'Has policy_approved event')
assert(eventOptions.includes('policy_challenge_raised'), 'Has policy_challenge_raised event')
assert(eventOptions.includes('pipeline_run_started'), 'Has pipeline_run_started event')
assert(eventOptions.includes('pipeline_run_completed'), 'Has pipeline_run_completed event')

// 8. API Routes exist
console.log('\n[8] API Route Files Exist')
const routeFiles = [
  'src/app/api/policy-agent/run/route.ts',
  'src/app/api/policy-agent/run/[runId]/status/route.ts',
  'src/app/api/policy-agent/draft/[draftId]/approve/route.ts',
  'src/app/api/policy-agent/draft/[draftId]/challenge/route.ts',
  'src/app/api/policy-agent/run/[runId]/audit-trail/route.ts',
  'src/app/api/policy-agent/run/[runId]/audit-trail/export/route.ts',
]
for (const file of routeFiles) {
  const fullPath = path.join(process.cwd(), file)
  assert(fs.existsSync(fullPath), `Route exists: ${file}`)
}

// 9. Task handler files exist
console.log('\n[9] Task Handler Files')
const taskFiles = [
  'src/server/jobs/tasks/analyze-policy-gaps.ts',
  'src/server/jobs/tasks/draft-policy.ts',
]
for (const file of taskFiles) {
  const fullPath = path.join(process.cwd(), file)
  assert(fs.existsSync(fullPath), `Task exists: ${file}`)
}

// 10. Prototype wired
console.log('\n[10] Prototype Frontend Wiring')
const protoPath = path.join(process.cwd(), '..', 'netlify-demo', 'prototype.html')
const protoContent = fs.readFileSync(protoPath, 'utf-8')
assert(protoContent.includes('API_BASE'), 'Prototype has API_BASE config')
assert(protoContent.includes('/api/policy-agent/run'), 'Prototype calls run endpoint')
assert(protoContent.includes('startPolling'), 'Prototype has polling logic')
assert(protoContent.includes('gap-table-body'), 'Prototype has dynamic gap table')
assert(protoContent.includes('draft-content'), 'Prototype has dynamic draft content')
assert(protoContent.includes('/approve'), 'Prototype calls approve endpoint')
assert(protoContent.includes('/challenge'), 'Prototype calls challenge endpoint')
assert(protoContent.includes('audit-trail/export'), 'Prototype has audit trail export')

console.log('\n' + '='.repeat(60))
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`)
if (failed === 0) {
  console.log('ALL SPRINT 1 VALIDATIONS PASSED')
} else {
  console.log('SOME VALIDATIONS FAILED')
  process.exit(1)
}
