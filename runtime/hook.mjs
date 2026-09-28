#!/usr/bin/env node
// Hook entry point for Claude Code and Codex. The client sends the event as
// JSON on stdin; exit code 2 with a message on stderr blocks the action (both
// clients support this), and exit code 0 lets it through.
//
//   node .standards/bin/hook.mjs stop            (Stop event)
//   node .standards/bin/hook.mjs pre-tool-use    (PreToolUse event)
//
// stop:         when workflow files changed, run the STANDARDS check and, if
//               it finds problems, send the agent back once per turn with them.
// pre-tool-use: refuse direct agent edits to .standards/CYCLE_IDS.md, so cycle
//               IDs are only reserved through `cycle.mjs new`.
import { createHash } from 'node:crypto';
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { runCheck } from './check.mjs';
import { git, isMain, projectRootFor, resolveReal } from './lib/core.mjs';

const BLOCK = 2;
const MARKER_DIR = path.join(os.tmpdir(), 'standards-hooks');
const SHOWN_PROBLEMS = 15;

async function readInput() {
  let text = '';
  for await (const chunk of process.stdin) text += chunk;
  if (!text.trim()) return {};
  try {
    const value = JSON.parse(text);
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

// Only check when the agent may have changed workflow files: uncommitted
// changes under `.standards/` or in any Markdown file. Outside git there is no
// way to tell, so always check.
async function workflowFilesChanged(root) {
  const status = await git(root, ['status', '--porcelain', '-z', '--untracked-files=all', '--', '.standards', '*.md']);
  return status === null || status.length > 0;
}

// Fallback for clients without `stop_hook_active`: record that this turn was
// already sent back, so the next stop goes through. Returns 'new' the first
// time, 'seen' after that, and 'unavailable' when the marker cannot be written
// (the caller then does not block, to avoid a loop).
async function markTurn(root, input) {
  const turn = input.turn_id ?? input.prompt_id ?? 'session';
  const key = createHash('sha256').update(`${root}\0${input.session_id ?? ''}\0${turn}`).digest('hex').slice(0, 32);
  try {
    await mkdir(MARKER_DIR, { recursive: true });
    await removeOldMarkers();
    await writeFile(path.join(MARKER_DIR, key), '', { flag: 'wx' });
    return 'new';
  } catch (error) {
    return error.code === 'EEXIST' ? 'seen' : 'unavailable';
  }
}

async function removeOldMarkers() {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const name of await readdir(MARKER_DIR)) {
    const file = path.join(MARKER_DIR, name);
    try {
      if ((await stat(file)).mtimeMs < cutoff) await rm(file, { force: true });
    } catch {
      // Another hook may have removed it already.
    }
  }
}

export function stopMessage(problems) {
  const shown = problems.slice(0, SHOWN_PROBLEMS).map(({ file, message }) => `- ${file}: ${message}`);
  const more = problems.length - shown.length;
  return [
    'STANDARDS check found problems in the workflow files:',
    ...shown,
    ...(more > 0 ? [`- ...and ${more} more. Run \`node .standards/bin/check.mjs\` to see them all.`] : []),
    '',
    'Do not guess a repair. If a problem is in work your current role owns, fix it now. If another role '
      + 'owns it, route it as .standards/PROTOCOL.md describes. If you are not sure, or you are Navigator, '
      + 'report the problems to the user and stop.',
  ].join('\n');
}

async function onStop(root, input) {
  // Claude Code and Codex both send `stop_hook_active`, which is true when the
  // agent is already continuing because a Stop hook sent it back. That flag is
  // the once-per-turn guard; the marker file is only a fallback for clients
  // that do not send it.
  if (input.stop_hook_active === true) return 0;
  if (!(await workflowFilesChanged(root))) return 0;
  const { problems } = await runCheck(root);
  if (problems.length === 0) return 0;
  if (typeof input.stop_hook_active !== 'boolean' && await markTurn(root, input) !== 'new') return 0;
  process.stderr.write(`${stopMessage(problems)}\n`);
  return BLOCK;
}

// Files an edit tool call would write. Claude Code sends `file_path` or
// `notebook_path`; Codex sends `apply_patch` text in `command`.
function editedFiles(input) {
  const toolInput = input.tool_input ?? {};
  const files = [toolInput.file_path, toolInput.notebook_path, toolInput.path].filter((value) => typeof value === 'string');
  if (input.tool_name === 'apply_patch' || /^\*\*\* Begin Patch/m.test(String(toolInput.command ?? ''))) {
    const patch = Array.isArray(toolInput.command) ? toolInput.command.join('\n') : String(toolInput.command ?? toolInput.patch ?? '');
    for (const match of patch.matchAll(/^\*\*\* (?:(?:Add|Update|Delete) File|Move to): (.+?)\s*$/gm)) files.push(match[1]);
  }
  return files;
}

// Shell commands that write to the registry. This is a best-effort guard for
// obvious cases; `check` still reports any registry entry that is malformed.
export function shellWritesRegistry(command) {
  if (!/CYCLE_IDS\.md/.test(command)) return false;
  return />>?\s*["']?[^\s"'|;&]*CYCLE_IDS\.md/.test(command)
    || /\b(tee|truncate|mv|cp|rm|ln|dd)\b/.test(command)
    || /\b(sed|perl)\s+(-[a-zA-Z]*i\b|--in-place)/.test(command)
    || /\b(writeFile|appendFile|writeFileSync|appendFileSync|open)\s*\(/.test(command);
}

async function onPreToolUse(root, input) {
  const registry = await resolveReal(path.join(root, '.standards', 'CYCLE_IDS.md'));
  const cwd = typeof input.cwd === 'string' ? input.cwd : process.cwd();
  // Compare real paths: the client may send a path through a symlink.
  const targets = await Promise.all(editedFiles(input).map((file) => resolveReal(path.resolve(cwd, file))));
  const writesRegistry = targets.includes(registry);
  const command = input.tool_input?.command;
  const shell = input.tool_name === 'Bash' && shellWritesRegistry(Array.isArray(command) ? command.join(' ') : String(command ?? ''));
  if (!writesRegistry && !shell) return 0;
  process.stderr.write('Do not edit .standards/CYCLE_IDS.md directly. Reserve a cycle ID with '
    + '`node .standards/bin/cycle.mjs new --request "<request>"`. If the file has a merge conflict, '
    + 'ask the user to resolve it.\n');
  return BLOCK;
}

async function main(args) {
  const [event] = args;
  if (!['stop', 'pre-tool-use'].includes(event) || args.length !== 1) {
    process.stderr.write('Usage: node .standards/bin/hook.mjs <stop|pre-tool-use>\n');
    return 1;
  }
  const input = await readInput();
  const root = await projectRootFor(import.meta.url);
  return event === 'stop' ? onStop(root, input) : onPreToolUse(root, input);
}

if (isMain(import.meta.url)) {
  // A failing hook must never trap the agent: report the error without blocking.
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (error) => {
    process.stderr.write(`STANDARDS hook error: ${error.message}\n`);
    process.exitCode = 1;
  });
}
