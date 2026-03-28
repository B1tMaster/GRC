import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { handlePreflight } from '@/lib/cors'

export const OPTIONS = handlePreflight

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ draftId: string }> },
) => {
  const { draftId } = await params

  try {
    const payload = await getPayload({ config: configPromise })
    const body = await req.json()

    const { userId, userName } = body

    if (!userId) {
      return Response.json({ error: 'Missing required field: userId' }, { status: 400 })
    }

    const draft = await payload.findByID({ collection: 'policy-drafts', id: draftId }) as any

    if (!draft) {
      return Response.json({ error: `Draft ${draftId} not found` }, { status: 404 })
    }

    if (draft.overallConfidence < 0.7) {
      return Response.json(
        {
          error: 'Cannot approve: draft confidence is below 70% threshold',
          confidence: draft.overallConfidence,
          humanDraftRequired: true,
          message: `This draft has ${Math.round(draft.overallConfidence * 100)}% confidence and requires human drafting before approval.`,
        },
        { status: 403 },
      )
    }

    if (draft.status === 'approved' || draft.status === 'published') {
      return Response.json(
        { error: `Draft is already ${draft.status}` },
        { status: 409 },
      )
    }

    const now = new Date().toISOString()

    await payload.update({
      collection: 'policy-drafts',
      id: draftId,
      data: {
        status: 'approved',
        approvedBy: userName || userId,
        approvedAt: now,
      },
    })

    await payload.create({
      collection: 'decision-logs',
      data: {
        traceId: draft.sourceRun || `manual-${draftId}`,
        action: `Approved policy draft: ${draft.policyName} ${draft.version}`,
        entityType: 'policy-draft',
        entityId: draft.draftId,
        agentType: 'human_review',
        input: { userId, draftId: draft.draftId, confidence: draft.overallConfidence },
        output: { status: 'approved', approvedAt: now },
        reasoning: `Human reviewer ${userName || userId} approved the policy draft`,
        confidence: draft.overallConfidence,
      },
    })

    await payload.create({
      collection: 'audit-trail-entries',
      data: {
        traceId: draft.sourceRun || `manual-${draftId}`,
        eventType: 'policy_approved',
        entityType: 'policy-drafts',
        entityId: draft.draftId,
        actor: { type: 'user', agentName: userName || userId },
        details: {
          policyName: draft.policyName,
          version: draft.version,
          confidence: draft.overallConfidence,
          approvedBy: userName || userId,
        },
      },
    })

    return Response.json({
      message: 'Policy draft approved successfully',
      draftId: draft.draftId,
      policyName: draft.policyName,
      status: 'approved',
      approvedBy: userName || userId,
      approvedAt: now,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
