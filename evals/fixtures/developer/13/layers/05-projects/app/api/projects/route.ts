import { jsonError } from '../../../lib/http.ts';
import { createProject, listProjects } from '../../../lib/projects.ts';

export async function GET(): Promise<Response> {
  return Response.json({ projects: listProjects() });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'Request body must be JSON');
  }
  const { name, owner } = (body ?? {}) as { name?: unknown; owner?: unknown };
  if (typeof name !== 'string' || name.trim() === '' || typeof owner !== 'string' || owner.trim() === '') {
    return jsonError(400, 'name and owner are required');
  }
  const project = createProject({ name: name.trim(), owner: owner.trim() });
  return Response.json({ project }, { status: 201 });
}
