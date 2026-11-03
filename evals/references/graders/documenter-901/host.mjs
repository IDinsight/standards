// documenter-901 (Doc1, a changed import endpoint). Runs on the host
// (graders.mjs): it reads apps/api/openapi.yaml with the yaml package, which
// runs nothing, and the sample configuration and READMEs as text.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import YAML from 'yaml';

const CONTRACT = 'apps/api/openapi.yaml';
// The documents at the repository root before the cycle.
const ROOT_DOCS = new Set(['README.md', 'AGENTS.md', 'CLAUDE.md']);
const IMPORT_JOB = '#/components/schemas/ImportJob';

const asList = (v) => (v === undefined || v === null ? [] : Array.isArray(v) ? v : [v]);
const read = (projectDir, rel) => (existsSync(path.join(projectDir, rel)) ? readFileSync(path.join(projectDir, rel), 'utf8') : null);

// A document node with any local $ref followed (one hop at a time, no cycles).
function deref(doc, node, seen = new Set()) {
  const ref = node && typeof node === 'object' ? node.$ref : undefined;
  if (typeof ref !== 'string' || !ref.startsWith('#/') || seen.has(ref)) return node;
  seen.add(ref);
  const target = ref.slice(2).split('/').map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~')).reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), doc);
  return deref(doc, target, seen);
}

export async function grade({ projectDir }) {
  const checks = [];
  const add = (id, ok, detail) => checks.push({ id, verdict: ok ? 'PASS' : 'FAIL', detail });
  let doc = null;
  let parseError = null;
  try {
    doc = YAML.parse(read(projectDir, CONTRACT) ?? '');
  } catch (error) {
    parseError = error.message;
  }
  const paths = doc?.paths ?? {};
  const post = paths['/imports']?.post;
  const responses = post?.responses ?? {};
  const schemes = doc?.components?.securitySchemes ?? {};

  // bearer-security: the operation's security (or the document's, when it sets none) names a bearer scheme.
  const security = post?.security ?? doc?.security ?? [];
  const bearer = asList(security).some((req) => req && typeof req === 'object' && Object.keys(req).some((name) => {
    const s = deref(doc, schemes[name]);
    return s?.type === 'http' && String(s.scheme).toLowerCase() === 'bearer';
  }));
  add('bearer-security', bearer, `POST /imports security: ${JSON.stringify(post?.security ?? null)}${post?.security === undefined && doc?.security ? ` (document: ${JSON.stringify(doc.security)})` : ''}`);

  // idempotency-header: an optional Idempotency-Key header parameter, on the operation or its path.
  const params = [...asList(paths['/imports']?.parameters), ...asList(post?.parameters)].map((p) => deref(doc, p));
  const key = params.find((p) => p?.in === 'header' && String(p.name).toLowerCase() === 'idempotency-key');
  add('idempotency-header', Boolean(key) && key.required !== true, key ? `Idempotency-Key header, required: ${key.required ?? false}` : `parameters: ${JSON.stringify(params.map((p) => `${p?.in}:${p?.name}`))}`);

  // accepted-202: a 202 whose JSON body is the ImportJob (by $ref or the same shape), and no 201.
  const r202 = deref(doc, responses['202']);
  const body = r202?.content?.['application/json']?.schema;
  const job = deref(doc, body);
  const isJob = body?.$ref === IMPORT_JOB || (job?.type === 'object' && ['id', 'status'].every((p) => job.properties?.[p]));
  add('accepted-202', Boolean(r202) && isJob && responses['201'] === undefined, `responses: ${Object.keys(responses).join(', ') || 'none'}; 202 body: ${JSON.stringify(body ?? null)}`);
  add('conflict-409', responses['409'] !== undefined, `responses: ${Object.keys(responses).join(', ') || 'none'}`);

  // job-statuses: ImportJob's status lists all four states.
  const status = deref(doc, deref(doc, doc?.components?.schemas?.ImportJob)?.properties?.status);
  const states = asList(status?.enum).map(String);
  add('job-statuses', ['pending', 'running', 'failed', 'done'].every((s) => states.includes(s)), `ImportJob.status enum: ${JSON.stringify(states)}`);

  const env = read(projectDir, 'apps/api/.env.example') ?? '';
  add('env-example', /^\s*(?:export\s+)?IMPORT_MAX_BYTES\s*=/m.test(env), /IMPORT_MAX_BYTES/.test(env) ? 'listed' : 'apps/api/.env.example does not list IMPORT_MAX_BYTES');
  const apiReadme = read(projectDir, 'apps/api/README.md') ?? '';
  const commands = ['tests/unit', 'tests/integration'].filter((t) => new RegExp(String.raw`uv run pytest[^\n\x60]*${t.replace('/', '\\/')}\b`).test(apiReadme));
  add('api-test-commands', commands.length === 2, `apps/api/README.md gives uv run pytest for: ${commands.join(', ') || 'neither folder'}`);
  const webReadme = read(projectDir, 'apps/web/README.md') ?? '';
  add('web-e2e-command', /pnpm (?:run )?test:e2e\b/.test(webReadme), /test:e2e/.test(webReadme) ? 'pnpm test:e2e given' : 'apps/web/README.md does not give pnpm test:e2e');

  // Reference checks.
  add('importjob-ref', body?.$ref === IMPORT_JOB && doc?.components?.schemas?.ImportJob !== undefined, `202 body: ${JSON.stringify(body ?? null)}`);
  add('operation-id', post?.operationId === 'createImport', `operationId: ${post?.operationId ?? 'none'}`);
  const rootDocs = readdirSync(projectDir).filter((f) => /\.(md|markdown|rst|txt|adoc)$/i.test(f));
  const added = rootDocs.filter((f) => !ROOT_DOCS.has(f));
  add('no-root-doc', added.length === 0, added.length ? `new at the root: ${added.join(', ')}` : 'no new document at the root');

  // Control: the contract still parses and keeps what it had.
  const kept = doc?.openapi === '3.1.0' && post !== undefined && paths['/imports/{import_id}']?.get !== undefined;
  add('contract-intact', !parseError && kept, parseError ? `does not parse: ${parseError}` : `openapi ${doc?.openapi}; POST /imports ${post ? 'kept' : 'missing'}; GET /imports/{import_id} ${paths['/imports/{import_id}']?.get ? 'kept' : 'missing'}`);
  return { checks };
}
