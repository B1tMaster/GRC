/**
 * Validation script for EVX-5 Gap Analysis Engine components.
 * Run with: pnpm debug src/scripts/validate-gap-analysis.ts
 *
 * Tests:
 * 1. Zod schema validates correct data and rejects bad data
 * 2. Prompt builder produces well-formed prompts
 * 3. Framework requirements context builder works
 * 4. Collection definition has required fields
 */

import { PolicyGapSchema, PolicyGapAnalysisResponseSchema } from '../server/llm/workflows/grc/gap-analysis-schemas'
import { GAP_ANALYSIS_SYSTEM_PROMPT, buildGapAnalysisUserPrompt } from '../server/llm/workflows/grc/gap-analysis-prompts'
import { ALL_FRAMEWORK_CONTROLS } from '../server/handlers/grc-extraction/framework-catalog'
import { PolicyGapAnalysesCollection } from '../collections/PolicyGapAnalyses/collection'

let passed = 0
let failed = 0

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  PASS: ${label}`)
    passed++
  } else {
    console.error(`  FAIL: ${label}`)
    failed++
  }
}

// --- Test 1: Schema validation with valid data ---
console.log('\n[1] PolicyGapSchema — valid data')
const validGap = {
  policyName: 'Data Encryption Policy v2.1',
  gapDescription: 'No FIPS 140-3 reference for cryptographic modules',
  frameworksAffected: [
    { frameworkName: 'FIPS 140-3', sectionRef: '§4.1' },
    { frameworkName: 'NIST 800-57', sectionRef: 'Part 1 §5.2' },
  ],
  priority: 'High' as const,
  action: 'Draft Revision' as const,
  confidence: 0.91,
  reasoning: 'The policy references AES-256 but does not cite FIPS 140-3 for module validation.',
}

const gapResult = PolicyGapSchema.safeParse(validGap)
assert(gapResult.success, 'Valid gap parses successfully')

const validResponse = {
  gaps: [validGap],
  summary: 'Found 1 critical gap in encryption policy coverage.',
}
const responseResult = PolicyGapAnalysisResponseSchema.safeParse(validResponse)
assert(responseResult.success, 'Valid response parses successfully')

// --- Test 2: Schema rejects invalid data ---
console.log('\n[2] PolicyGapSchema — invalid data rejection')

const badPriority = { ...validGap, priority: 'Critical' }
assert(!PolicyGapSchema.safeParse(badPriority).success, 'Rejects invalid priority value')

const badAction = { ...validGap, action: 'Delete' }
assert(!PolicyGapSchema.safeParse(badAction).success, 'Rejects invalid action value')

const badConfidence = { ...validGap, confidence: 1.5 }
assert(!PolicyGapSchema.safeParse(badConfidence).success, 'Rejects confidence > 1')

const negativeConfidence = { ...validGap, confidence: -0.1 }
assert(!PolicyGapSchema.safeParse(negativeConfidence).success, 'Rejects confidence < 0')

const missingPolicy = { ...validGap, policyName: undefined }
assert(!PolicyGapSchema.safeParse(missingPolicy).success, 'Rejects missing policyName')

const emptyFrameworks = { ...validGap, frameworksAffected: [] }
assert(PolicyGapSchema.safeParse(emptyFrameworks).success, 'Allows empty frameworksAffected array')

// --- Test 3: Prompt builder ---
console.log('\n[3] Prompt builder')

assert(GAP_ANALYSIS_SYSTEM_PROMPT.length > 500, 'System prompt has substantial content')
assert(GAP_ANALYSIS_SYSTEM_PROMPT.includes('Step 1'), 'System prompt includes multi-step reasoning')
assert(GAP_ANALYSIS_SYSTEM_PROMPT.includes('High priority'), 'System prompt defines priority levels')
assert(GAP_ANALYSIS_SYSTEM_PROMPT.includes('Draft Revision'), 'System prompt defines action types')

const userPrompt = buildGapAnalysisUserPrompt({
  documentTitle: 'Test Encryption Policy',
  policyText: 'All data at rest must use AES-256 encryption.',
  frameworkRequirements: '### COBIT2019\n- APO13: Managed Security',
  governanceObjectives: '1. [compliance] Ensure data encryption meets regulatory standards',
})

assert(userPrompt.includes('Test Encryption Policy'), 'User prompt includes document title')
assert(userPrompt.includes('AES-256'), 'User prompt includes policy text')
assert(userPrompt.includes('COBIT2019'), 'User prompt includes framework requirements')
assert(userPrompt.includes('data encryption'), 'User prompt includes governance objectives')

// --- Test 4: Framework catalog integration ---
console.log('\n[4] Framework catalog')

assert(ALL_FRAMEWORK_CONTROLS.length > 0, `Framework catalog has ${ALL_FRAMEWORK_CONTROLS.length} controls`)

const cobitControls = ALL_FRAMEWORK_CONTROLS.filter(c => c.framework === 'COBIT2019')
const cosoControls = ALL_FRAMEWORK_CONTROLS.filter(c => c.framework === 'COSO_ERM')
assert(cobitControls.length > 10, `COBIT 2019 has ${cobitControls.length} controls`)
assert(cosoControls.length > 10, `COSO ERM has ${cosoControls.length} controls`)

const securityControl = ALL_FRAMEWORK_CONTROLS.find(c => c.controlId === 'APO13')
assert(!!securityControl, 'APO13 (Managed Security) exists in catalog')

// --- Test 5: Collection definition ---
console.log('\n[5] PolicyGapAnalyses collection definition')

assert(PolicyGapAnalysesCollection.slug === 'policy-gap-analyses', 'Collection slug is correct')

const fieldNames = PolicyGapAnalysesCollection.fields.map((f: any) => f.name).filter(Boolean)
const requiredFields = ['gapId', 'policyName', 'gapDescription', 'frameworksAffected', 'priority', 'action', 'confidence', 'reasoning', 'sourceRun', 'status']
for (const field of requiredFields) {
  assert(fieldNames.includes(field), `Collection has '${field}' field`)
}

const priorityField = PolicyGapAnalysesCollection.fields.find((f: any) => f.name === 'priority') as any
assert(
  priorityField?.options?.some((o: any) => o.value === 'High') &&
  priorityField?.options?.some((o: any) => o.value === 'Medium') &&
  priorityField?.options?.some((o: any) => o.value === 'Low'),
  'Priority field has High/Medium/Low options',
)

const actionField = PolicyGapAnalysesCollection.fields.find((f: any) => f.name === 'action') as any
assert(
  actionField?.options?.some((o: any) => o.value === 'Draft Revision') &&
  actionField?.options?.some((o: any) => o.value === 'Draft New'),
  'Action field has Draft Revision / Draft New options',
)

// --- Test 6: Schema matches collection fields ---
console.log('\n[6] Schema-to-collection alignment')

const schemaShape = PolicyGapSchema.shape
assert('policyName' in schemaShape, 'Schema has policyName matching collection')
assert('gapDescription' in schemaShape, 'Schema has gapDescription matching collection')
assert('frameworksAffected' in schemaShape, 'Schema has frameworksAffected matching collection')
assert('priority' in schemaShape, 'Schema has priority matching collection')
assert('action' in schemaShape, 'Schema has action matching collection')
assert('confidence' in schemaShape, 'Schema has confidence matching collection')
assert('reasoning' in schemaShape, 'Schema has reasoning matching collection')

// --- Summary ---
console.log(`\n${'='.repeat(50)}`)
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`)
if (failed > 0) {
  console.error('VALIDATION FAILED')
  process.exit(1)
} else {
  console.log('ALL VALIDATIONS PASSED')
}
