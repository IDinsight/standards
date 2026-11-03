import { recordFeedback } from '../../../lib/feedback.ts';

type FeedbackBody = { slug?: unknown; helpful?: unknown; comment?: unknown } | null;

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => null)) as FeedbackBody;
  if (typeof body?.slug !== 'string' || typeof body.helpful !== 'boolean') {
    return Response.json({ error: 'Invalid feedback.' }, { status: 400 });
  }
  const comment = typeof body.comment === 'string' ? body.comment : '';
  const result = await recordFeedback(body.slug, body.helpful, comment);
  if (!result.ok) return Response.json({ error: result.error }, { status: 422 });
  return new Response(null, { status: 204 });
}
