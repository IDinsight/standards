#!/usr/bin/env node
// Read a fixture's workflow state and run its turn-end and full checks with
// the pinned framework's pristine runtime (never the project's own
// .standards/bin, which a role may have edited), in a fresh process:
//
//   node inspect-runtime.mjs <project-root> <runtime-dir>
//     -> JSON { state, checkTurnEnd, check }
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = realpathSync(path.resolve(process.argv[2]));
const runtimeDir = path.resolve(process.argv[3] ?? '');
if (!existsSync(path.join(runtimeDir, 'check.mjs'))) throw new Error(`no pristine runtime at ${runtimeDir}`);
const lib = path.join(runtimeDir, 'lib');

// Flatten STATE.md into "Section.Field" -> value with the runtime's own field
// reader, e.g. "WorkflowState", "ActiveWork.BlockedOn", "Handoff.Kind".
async function readState() {
  const file = path.join(root, '.standards/STATE.md');
  if (!existsSync(file) || !existsSync(path.join(root, '.standards/bin'))) return null;
  const flat = {};
  try {
    const core = await import(pathToFileURL(path.join(lib, 'core.mjs')));
    const state = await import(pathToFileURL(path.join(lib, 'state.mjs')));
    const text = readFileSync(file, 'utf8');
    const head = text.slice(0, text.indexOf('## Active Work'));
    for (const [k, v] of core.fieldPairs(head)) flat[k] = v;
    for (const [section, prefix] of [['Active Work', 'ActiveWork'], ['Handoff', 'Handoff']]) {
      // BaselineReconciliation list entries repeat "Request"; keep the first value.
      for (const [k, v] of core.fieldPairs(state.stateSection(text, section))) flat[`${prefix}.${k}`] ??= v;
    }
    const parsed = state.parseState(text);
    // BaselineReconciliation is `NONE` or a list of SourceCycle/Request
    // entries; the generic field pass above sees no value for a list and
    // leaks its first entry's SourceCycle as an Active Work field. Use the
    // runtime's own parse: "NONE", or the source cycles joined with "; ",
    // plus a count and Entry<N>.SourceCycle/Request.
    delete flat['ActiveWork.SourceCycle'];
    const baseline = parsed.active.baseline ?? {};
    if (baseline.error) flat['ActiveWork.BaselineReconciliation'] = `INVALID: ${baseline.error}`;
    else if (baseline.entries) {
      flat['ActiveWork.BaselineReconciliation'] = baseline.entries.length ? baseline.entries.map((e) => e.sourceCycle).join('; ') : 'NONE';
      flat['ActiveWork.BaselineReconciliation.Count'] = String(baseline.entries.length);
      baseline.entries.forEach((e, n) => {
        flat[`ActiveWork.BaselineReconciliation.Entry${n + 1}.SourceCycle`] = e.sourceCycle;
        flat[`ActiveWork.BaselineReconciliation.Entry${n + 1}.Request`] = e.request;
      });
    }
    flat['Recovery.Active'] = String(parsed.recovery.active);
    flat['Recovery.Frames'] = parsed.recovery.frames;
    // Frames as plain fields for `state` checks: FrameCount, Frame<N>.<Field>
    // in file order, and Top.<Field> for the last (active) frame.
    flat['Recovery.FrameCount'] = String(parsed.recovery.frames.length);
    parsed.recovery.frames.forEach((f, n) => { for (const [k, v] of Object.entries(f.fields)) flat[`Recovery.Frame${n + 1}.${k}`] = v; });
    for (const [k, v] of Object.entries(parsed.recovery.frames.at(-1)?.fields ?? {})) flat[`Recovery.Top.${k}`] = v;
    flat['Obligations.Active'] = String(parsed.obligations.active);
    flat['Obligations.Count'] = String(parsed.obligations.items.length);
    parsed.obligations.items.forEach((o, n) => { for (const [k, v] of Object.entries(o.fields)) flat[`Obligations.Item${n + 1}.${k}`] = v; });
  } catch (error) {
    // A deliberately broken fixture may not parse; record why instead of failing.
    flat.parseError = error.message;
  }
  const mode = path.join(root, '.standards/MODE.md');
  if (existsSync(mode)) flat.ProjectMode = (readFileSync(mode, 'utf8').match(/`ProjectMode`:\s*`(\w+)`/) ?? [])[1];
  return flat;
}

// The stop hook's turn-end check (runCheck with atTurnEnd), and the full
// check that `check.mjs --json` runs (an unexpected failure is a problem, as
// check.mjs reports it). A project without an installed runtime has neither.
async function checks() {
  const none = (what) => ({ ok: false, problems: [{ message: `${what} did not run: no installed STANDARDS runtime` }], notes: [] });
  if (!existsSync(path.join(root, '.standards/PROTOCOL.md'))) return { checkTurnEnd: none('turn-end check'), check: none('check.mjs') };
  const { runCheck } = await import(pathToFileURL(path.join(runtimeDir, 'check.mjs')));
  let turnEnd;
  try {
    const { problems } = await runCheck(root, { atTurnEnd: true });
    turnEnd = { ok: problems.length === 0, problems };
  } catch (error) {
    turnEnd = { ok: false, problems: [{ message: `turn-end check did not run: ${error.message}` }] };
  }
  let full;
  try {
    const { problems, notes } = await runCheck(root);
    full = { ok: problems.length === 0, problems, notes };
  } catch (error) {
    full = { ok: false, problems: [{ file: '.standards/bin/check.mjs', message: `could not finish: ${error.message}` }], notes: [] };
  }
  return { checkTurnEnd: turnEnd, check: full };
}

console.log(JSON.stringify({ state: await readState(), ...(await checks()) }));
