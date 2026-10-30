import { jsonError } from '../../../../lib/http.ts';
import { findProject } from '../../../../lib/projects.ts';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext): Promise<Response> {
  const { id } = await params;
  const project = findProject(id);
  if (!project) return jsonError(404, `Project ${id} not found`);
  return Response.json({ project });
}
