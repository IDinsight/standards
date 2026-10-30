#!/usr/bin/env node
// Mid-run edits (runtime.midRunEdits): a Claude Code PostToolUse hook, passed
// with --settings from /opt/eval (outside the project, so the role cannot see
// or edit it). After each tool call it checks the pending edits in
// /opt/eval/midrun.json; the first call that matches an edit's trigger copies
// that edit's files into the project, once. It prints nothing and always exits
// 0, so the role gets no hint that anything happened.
//
// A trigger is { tool: "<regex on the tool name>", path?: "<project-relative
// glob>", command?: "<regex on a Bash command>" }; file tools match `path`
// against tool_input.file_path (or path/notebook_path), Bash matches `command`.
// Each applied edit is logged to ~/.claude/projects/eval-midrun.json, which
// the runner keeps with the run's session files (graders read it).
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CONFIG = process.env.EVAL_MIDRUN_CONFIG ?? '/opt/eval/midrun.json';
const LOG = process.env.EVAL_MIDRUN_LOG ?? path.join(os.homedir(), '.claude/projects/eval-midrun.json');

// "src/**/*.js" -> regex; ** spans directories (zero or more), * stays in one segment.
export function globRegex(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i += 1) {
    const ch = glob[i];
    if (ch === '*' && glob[i + 1] === '*') { re += glob[i + 2] === '/' ? '(?:.*/)?' : '.*'; i += glob[i + 2] === '/' ? 2 : 1; }
    else if (ch === '*') re += '[^/]*';
    else if (ch === '?') re += '[^/]';
    else re += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

// Does this tool call match the trigger? `root` is the project root.
export function matches(trigger, event, root) {
  if (!new RegExp(`^(?:${trigger.tool})$`).test(event.tool_name ?? '')) return false;
  const input = event.tool_input ?? {};
  if (trigger.command && !new RegExp(trigger.command).test(String(input.command ?? ''))) return false;
  if (trigger.path) {
    const target = input.file_path ?? input.path ?? input.notebook_path;
    if (!target) return false;
    const rel = path.relative(root, path.resolve(event.cwd ?? root, String(target)));
    if (rel.startsWith('..') || !globRegex(trigger.path).test(rel)) return false;
  }
  return true;
}

// Apply every pending edit this event triggers; returns the log entries added.
export function handle(event, { config = CONFIG, log = LOG } = {}) {
  if (!existsSync(config)) return [];
  const { projectRoot, edits } = JSON.parse(readFileSync(config, 'utf8'));
  const done = existsSync(log) ? JSON.parse(readFileSync(log, 'utf8')) : [];
  const added = [];
  edits.forEach((edit, n) => {
    if (done.some((d) => d.edit === n) || !matches(edit.after, event, projectRoot)) return;
    for (const f of edit.files) {
      const dest = path.join(projectRoot, f.target);
      mkdirSync(path.dirname(dest), { recursive: true });
      copyFileSync(f.source, dest);
    }
    added.push({ edit: n, at: new Date().toISOString(), tool: event.tool_name, input: event.tool_input ?? null, files: edit.files.map((f) => f.target) });
  });
  if (added.length) {
    mkdirSync(path.dirname(log), { recursive: true });
    writeFileSync(log, JSON.stringify([...done, ...added], null, 2));
  }
  return added;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let input = '';
  process.stdin.on('data', (d) => { input += d; });
  process.stdin.on('end', () => {
    try { handle(JSON.parse(input || '{}')); } catch (error) {
      // Never disturb the role; leave a trace for the graders instead.
      try { writeFileSync(`${LOG}.error`, String(error?.stack ?? error)); } catch { /* nothing more to do */ }
    }
    process.exit(0);
  });
}
