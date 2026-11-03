// A spec's `selfChecks`: commands that show the built fixture behaves as the
// case says (for example "the established test command passes" or "the
// integration command fails with a connection error"). They run in the runner
// image, on a throwaway copy of the fixture, with no network, so the check
// sees exactly the toolchain a run gets and never touches the fixture.
//
//   selfChecks: [{ cmd: "pnpm --filter export test", expect: "pass", why: "existing tests pass" }]
//
// Part of gate 1 when Docker is reachable (generation and review run outside
// the Code tab's sandbox); otherwise reported as not run.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { IMAGE } from './config.mjs';
import { DEFAULT_BLOCK_HOSTS, blockHostArgs, prepareRuntime, imageFor } from './runtime.mjs';

// Docker is reachable and the runner image exists (a missing image would make
// every `docker run` exit 125).
// EVAL_IMAGE names another image (the self-test uses a missing one).
export function dockerAvailable(image = IMAGE) {
  try {
    execFileSync('docker', ['image', 'inspect', '--format', '{{.Id}}', image], { stdio: 'pipe', timeout: 15_000 });
    return true;
  } catch { return false; }
}

// Exit codes that mean the harness, not the command, failed: entry.sh's own
// (95 copy back, 96 copy in, 97 runtime setup), timeout (124), and docker (125).
export const HARNESS_EXITS = new Set([95, 96, 97, 124, 125]);

// One selfCheck's outcome from the command's exit code and output.
export function selfCheckOutcome(check, exit, output) {
  if (exit === null || HARNESS_EXITS.has(exit)) return { ok: false, harness: true, why: `the check could not run (exit ${exit})` };
  const passed = exit === 0;
  if ((check.expect === 'pass') !== passed) return { ok: false, why: `exited ${exit}, expected ${check.expect}` };
  if (check.expectOutput && !new RegExp(check.expectOutput, 'm').test(output)) return { ok: false, why: `output does not match /${check.expectOutput}/` };
  return { ok: true };
}

export function runSelfChecks(fixtureDir, checks = [], { image = IMAGE, runtime = {}, specDir = null, framework = null, timeoutSec = 180 } = {}) {
  const projectPath = runtime.projectPath ?? '/work';
  if (!checks.length) return { ran: true, results: [], problems: [] };
  image = imageFor(runtime, image);
  if (!dockerAvailable(image)) return { ran: false, results: [], problems: [], note: `Docker or ${image} not available; selfChecks not run` };
  const results = [];
  for (const c of checks) {
    const copy = mkdtempSync(path.join(os.tmpdir(), 'selfcheck-'));
    try {
      execFileSync('cp', ['-a', `${fixtureDir}/.`, copy]);
      // The same entry script as a run: the project is copied into the
      // container's own Linux filesystem (modes and case sensitivity hold).
      const evalDir = `${copy}-eval`;
      // Outside directories need host mounts in a run; selfChecks leave them out.
      const rt = prepareRuntime({ runtime: { ...runtime, outsideDirs: [] }, specDir, evalDir, projectRoot: projectPath, framework });
      // The same network as a run (GitHub and the case's blockHosts unreachable,
      // everything else as in a run), so a missing blockHosts entry shows here.
      const r = spawnSync('docker', ['run', '--rm', ...blockHostArgs([...DEFAULT_BLOCK_HOSTS, ...(runtime.blockHosts ?? [])]), ...rt.user,
        '-v', `${copy}:/mnt/project`, '-v', `${evalDir}:/opt/eval:ro`, ...rt.mounts, image,
        'sh', '/opt/eval/entry.sh', String(Math.ceil(timeoutSec / 60)), 'sh', '-c', c.cmd], { encoding: 'utf8', maxBuffer: 1 << 26 });
      rmSync(evalDir, { recursive: true, force: true });
      const output = `${r.stdout ?? ''}${r.stderr ?? ''}`;
      const o = selfCheckOutcome(c, r.status, output);
      results.push({ cmd: c.cmd, expect: c.expect, exit: r.status, ok: o.ok, why: o.why ?? null, tail: output.slice(-1500) });
    } finally {
      rmSync(copy, { recursive: true, force: true });
    }
  }
  const problems = results.filter((r) => !r.ok).map((r) => `selfCheck \`${r.cmd}\`: ${r.why}: ${r.tail.slice(-400)}`);
  return { ran: true, results, problems };
}
