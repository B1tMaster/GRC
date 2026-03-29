import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { handlePreflight, corsHeaders } from '@/lib/cors'

export const OPTIONS = handlePreflight

export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ runId: string }> },
) => {
  const { runId } = await params
  const headers = corsHeaders(req)

  try {
    const payload = await getPayload({ config: configPromise })
    const body = await req.json()
    const adminKey = req.headers.get('x-admin-key')
    const expected = process.env.ADMIN_API_KEY || 'evonix-admin-2026'

    if (adminKey !== expected) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers })
    }

    const runs = await payload.find({
      collection: 'pipeline-runs',
      where: { runId: { equals: runId } },
      limit: 1,
    })

    if (runs.docs.length === 0) {
      return Response.json({ error: `Run ${runId} not found` }, { status: 404, headers })
    }

    const run = runs.docs[0] as any
    const data: Record<string, any> = {}

    if (body.status) data.status = body.status
    if (body.completedAt) data.completedAt = body.completedAt
    if (body.elapsedMs != null) data.elapsedMs = body.elapsedMs
    if (body.results) data.results = body.results

    if (body.markAllStepsComplete && run.steps) {
      data.steps = run.steps.map((s: any) => ({
        ...s,
        status: 'complete',
        completedAt: s.completedAt || new Date().toISOString(),
      }))
      data.currentStep = undefined
    }

    await payload.update({
      collection: 'pipeline-runs',
      id: run.id,
      data,
    })

    return Response.json({ ok: true, runId, updated: Object.keys(data) }, { headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500, headers })
  }
}

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ runId: string }> },
) => {
  const { runId } = await params
  const headers = corsHeaders(req)

  try {
    const payload = await getPayload({ config: configPromise })

    const runs = await payload.find({
      collection: 'pipeline-runs',
      where: { runId: { equals: runId } },
      limit: 1,
    })

    if (runs.docs.length === 0) {
      return Response.json({ error: `Run ${runId} not found` }, { status: 404, headers })
    }

    const run = runs.docs[0] as any

    const auditEntries = await payload.find({
      collection: 'audit-trail-entries',
      where: { traceId: { equals: run.traceId } },
      sort: 'createdAt',
      limit: 100,
    })

    const elapsedMs = run.elapsedMs ?? (
      run.startedAt
        ? Date.now() - new Date(run.startedAt).getTime()
        : 0
    )

    return Response.json({
      runId: run.runId,
      status: run.status,
      currentStep: run.currentStep,
      steps: (run.steps || []).map((s: any) => ({
        name: s.name,
        label: s.label,
        status: s.status,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        output: s.output,
        error: s.error,
      })),
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      elapsedMs,
      error: run.error,
      results: run.results,
      auditTrail: auditEntries.docs.map((e: any) => ({
        id: e.id,
        eventType: e.eventType,
        entityType: e.entityType,
        entityId: e.entityId,
        actor: e.actor,
        details: e.details,
        timestamp: e.createdAt,
      })),
    }, { headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500, headers })
  }
}
