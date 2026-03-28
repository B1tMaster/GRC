import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { handlePreflight } from '@/lib/cors'

export const OPTIONS = handlePreflight

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ runId: string }> },
) => {
  const { runId } = await params

  try {
    const payload = await getPayload({ config: configPromise })

    const runs = await payload.find({
      collection: 'pipeline-runs',
      where: { runId: { equals: runId } },
      limit: 1,
    })

    if (runs.docs.length === 0) {
      return Response.json({ error: `Run ${runId} not found` }, { status: 404 })
    }

    const run = runs.docs[0] as any

    const auditEntries = await payload.find({
      collection: 'audit-trail-entries',
      where: { traceId: { equals: run.traceId } },
      sort: 'createdAt',
      limit: 500,
    })

    const decisionLogs = await payload.find({
      collection: 'decision-logs',
      where: { traceId: { equals: run.traceId } },
      sort: 'createdAt',
      limit: 500,
    })

    const gaps = await payload.find({
      collection: 'policy-gap-analyses',
      where: { sourceRun: { equals: run.traceId } },
      limit: 100,
    })

    const drafts = await payload.find({
      collection: 'policy-drafts',
      where: { sourceRun: { equals: run.traceId } },
      limit: 100,
    })

    const challenges = await payload.find({
      collection: 'challenges',
      where: {
        policyDraft: {
          in: drafts.docs.map((d: any) => d.id).join(','),
        },
      },
      limit: 100,
    })

    const auditPack = {
      exportedAt: new Date().toISOString(),
      run: {
        runId: run.runId,
        traceId: run.traceId,
        status: run.status,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        elapsedMs: run.elapsedMs,
        results: run.results,
        steps: run.steps,
      },
      auditTrail: auditEntries.docs.map((e: any) => ({
        id: e.id,
        eventType: e.eventType,
        entityType: e.entityType,
        entityId: e.entityId,
        actor: e.actor,
        details: e.details,
        sourceTrace: e.sourceTrace,
        timestamp: e.createdAt,
      })),
      decisionLogs: decisionLogs.docs.map((d: any) => ({
        id: d.id,
        action: d.action,
        entityType: d.entityType,
        entityId: d.entityId,
        agentType: d.agentType,
        input: d.input,
        output: d.output,
        reasoning: d.reasoning,
        confidence: d.confidence,
        timestamp: d.createdAt,
      })),
      gapAnalyses: gaps.docs.map((g: any) => ({
        id: g.id,
        gapId: g.gapId,
        policyName: g.policyName,
        gapDescription: g.gapDescription,
        frameworksAffected: g.frameworksAffected,
        priority: g.priority,
        action: g.action,
        confidence: g.confidence,
        reasoning: g.reasoning,
      })),
      policyDrafts: drafts.docs.map((d: any) => ({
        id: d.id,
        draftId: d.draftId,
        policyName: d.policyName,
        version: d.version,
        overallConfidence: d.overallConfidence,
        humanDraftRequired: d.humanDraftRequired,
        status: d.status,
        approvedBy: d.approvedBy,
        approvedAt: d.approvedAt,
        sections: d.sections,
        rationale: d.rationale,
      })),
      challenges: challenges.docs.map((c: any) => ({
        id: c.id,
        challengeId: c.challengeId,
        challengedBy: c.challengedBy,
        rationale: c.rationale,
        status: c.status,
        resolution: c.resolution,
        timestamp: c.createdAt,
      })),
    }

    const json = JSON.stringify(auditPack, null, 2)

    return new Response(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="audit-trail-${runId}.json"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
