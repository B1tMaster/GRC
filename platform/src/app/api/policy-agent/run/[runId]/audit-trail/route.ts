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
      limit: 200,
    })

    const decisionLogs = await payload.find({
      collection: 'decision-logs',
      where: { traceId: { equals: run.traceId } },
      sort: 'createdAt',
      limit: 200,
    })

    return Response.json({
      runId: run.runId,
      traceId: run.traceId,
      auditTrail: auditEntries.docs.map((e: any) => ({
        id: e.id,
        eventType: e.eventType,
        entityType: e.entityType,
        entityId: e.entityId,
        actor: e.actor,
        details: e.details,
        timestamp: e.createdAt,
      })),
      decisionLogs: decisionLogs.docs.map((d: any) => ({
        id: d.id,
        action: d.action,
        entityType: d.entityType,
        entityId: d.entityId,
        agentType: d.agentType,
        reasoning: d.reasoning,
        confidence: d.confidence,
        timestamp: d.createdAt,
      })),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
