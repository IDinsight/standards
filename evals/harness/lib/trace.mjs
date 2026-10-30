// Normalize a Claude Code `--output-format stream-json` transcript into exact
// facts: ordered tool calls with their full inputs and outputs, shell commands,
// skill invocations, hook events, every assistant text block, and usage. Paths
// in write tools are made relative to the project root the run used (for
// example /work inside the container).
//
// Deliberately absent: guesses about which files a role "read". Those depend
// on how a role searched, listed, or read, so they are left to the judge, who
// sees every tool call with its output.
//
// Subagents: messages from a subagent the role starts carry a non-null
// `parent_tool_use_id`. Their text is not something the user saw, so it never
// enters `reply`/`replyAll`; their tool calls stay in `events` (marked
// `subagent`) so git checks still see them, and the judge timeline labels them.
//
// Event shapes (Claude Code stream-json):
//   {type:"assistant", parent_tool_use_id, message:{content:[{type:"tool_use", id, name, input}, {type:"text", text}]}}
//   {type:"user", parent_tool_use_id, message:{content:[{type:"tool_result", tool_use_id, content, is_error}]}}
//   {type:"system", subtype:"hook_..."}   (with --include-hook-events)
//   {type:"result", result, total_cost_usd, usage, num_turns, duration_ms, subtype, is_error}
// Unknown events are kept in `other` and never fail parsing.
import { readFileSync } from 'node:fs';

const WRITE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);

// Text of a tool_result block, whose content is a string or a list of blocks.
const resultText = (content) => (typeof content === 'string' ? content
  : Array.isArray(content) ? content.map((b) => (b.type === 'text' ? b.text : `[${b.type}]`)).join('\n') : '');

export function parseTranscript(file, projectRoot) {
  const root = `${projectRoot.replace(/\/$/, '')}/`;
  const rel = (p) => (typeof p === 'string' ? p.replace(root, '') : p);
  const events = [];
  const byId = new Map();
  const texts = []; // assistant text blocks, each with a sequence number
  const hooks = [];
  const other = [];
  let seq = 0; // one counter across texts, tool calls, and hooks keeps true order
  let result = null;
  let init = null;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let ev;
    try { ev = JSON.parse(line); } catch { other.push({ unparsable: line.slice(0, 200) }); continue; }
    const subagent = Boolean(ev.parent_tool_use_id);
    if (ev.type === 'assistant') {
      for (const block of ev.message?.content ?? []) {
        if (block.type === 'text' && block.text) texts.push({ seq: seq++, subagent, text: block.text });
        if (block.type !== 'tool_use') continue;
        const input = block.input ?? {};
        const e = { seq: seq++, i: events.length, tool: block.name, input, subagent };
        if (WRITE_TOOLS.has(block.name)) e.writes = [rel(input.file_path ?? input.notebook_path)];
        if (block.name === 'Bash') e.command = input.command;
        if (block.name === 'Skill') e.skill = input.skill ?? input.name ?? input.command;
        events.push(e);
        if (block.id) byId.set(block.id, e);
      }
    } else if (ev.type === 'user') {
      for (const block of ev.message?.content ?? []) {
        if (block.type !== 'tool_result') continue;
        const e = byId.get(block.tool_use_id);
        if (e) { e.output = resultText(block.content); e.isError = Boolean(block.is_error); }
      }
    } else if (ev.type === 'system') {
      if (/hook/i.test(ev.subtype ?? '')) hooks.push({ seq: seq++, ...ev });
      // The session's start: the model that runs and the slash commands it can resolve.
      else if (ev.subtype === 'init' && !init) init = { model: ev.model, permissionMode: ev.permissionMode, cwd: ev.cwd, slashCommands: ev.slash_commands ?? null, skills: ev.skills ?? null };
    } else if (ev.type === 'result') {
      result = ev;
    } else {
      other.push({ type: ev.type });
    }
  }
  // Everything the user saw the role write during the run, in order (not
  // subagent text). When the stop hook sends the agent back, the result event
  // holds only the text after that, so reply graders and the judge use all of it.
  const mainTexts = texts.filter((t) => !t.subagent).map((t) => t.text);
  const reply = typeof result?.result === 'string' && result.result ? result.result : (mainTexts.at(-1) ?? '');
  // The result text normally repeats the last text block; include it when it doesn't.
  if (reply && !mainTexts.includes(reply)) mainTexts.push(reply);
  return {
    events,
    texts,
    reply,
    replyAll: mainTexts.join('\n\n'),
    hooks,
    init,
    usage: result && {
      costUsd: result.total_cost_usd, usage: result.usage, modelUsage: result.modelUsage,
      turns: result.num_turns, durationMs: result.duration_ms, subtype: result.subtype, isError: result.is_error,
    },
    other,
  };
}

// Words that can precede a command in a shell segment without being the command.
const PREFIX_WORDS = new Set(['env', 'command', 'sudo', 'exec', 'time', 'nohup', 'xargs', 'then', 'do', 'else', 'elif', '!', '{', '(']);

// Git invocations a shell command makes, found only in command position, as
// { sub, args }. Quoted strings become a placeholder word first (so
// `grep "git commit" f` and `echo "run git add ."` find no git command, while
// `git config user.email "a@b"` still has its value); the command is split on ; & && ||
// | ( ) and newlines; leading VAR=value assignments and prefix words (env,
// time, xargs, then, ...) are skipped; global options such as -C and -c are
// skipped. A command hidden inside `bash -c "..."` or a heredoc body is not
// seen; head_unchanged still catches any commit.
export function gitInvocations(command = '') {
  const unquoted = command.replace(/'[^']*'|"(?:\\.|[^"\\])*"/g, ' QUOTED ');
  const found = [];
  for (const segment of unquoted.split(/;|&&|\|\||\||&|\n|\$\(|`|\(|\)/)) {
    const words = segment.trim().split(/\s+/).filter(Boolean);
    let k = 0;
    while (k < words.length && (/^[A-Za-z_]\w*=/.test(words[k]) || PREFIX_WORDS.has(words[k]))) k += 1;
    if (words[k] !== 'git') continue;
    k += 1;
    while (k < words.length && words[k].startsWith('-')) {
      // Global options that take a separate value.
      if (['-C', '-c', '--git-dir', '--work-tree', '--namespace'].includes(words[k])) k += 1;
      k += 1;
    }
    if (k < words.length) found.push({ sub: words[k], args: words.slice(k + 1) });
  }
  return found;
}

// "stash list", "commit", ... : the subcommand plus its first word argument.
export function gitSubcommands(command = '') {
  return gitInvocations(command).map(({ sub, args }) => (args[0] && /^[a-z][\w-]*$/.test(args[0]) ? `${sub} ${args[0]}` : sub));
}

// Whether a git invocation changes the repository, index, working tree, refs,
// or remote. Read-only forms are allowed: `git status`, `git stash list`, a bare
// `git branch` or `git tag` (which list), `git clean -n`, `git apply --check`.
const ALWAYS_MUTATING = new Set(['commit', 'push', 'pull', 'fetch', 'reset', 'checkout', 'switch', 'restore', 'add', 'rm', 'mv',
  'merge', 'rebase', 'cherry-pick', 'revert', 'am', 'update-ref', 'init', 'clone', 'gc', 'prune', 'bisect', 'read-tree']);
// git config options that take a separate value (not the key or the value being set).
const CONFIG_VALUE_OPTS = new Set(['-f', '--file', '--type', '--default', '--blob', '--comment']);
const LIST_FLAGS = new Set(['-l', '--list', '-a', '--all', '-r', '--remotes', '-v', '-vv', '--verbose', '--show-current',
  '--contains', '--no-contains', '--merged', '--no-merged', '--points-at', '--sort', '--format', '-n', '--column']);
export function isMutatingGit({ sub, args }) {
  const opts = args.filter((a) => a.startsWith('-'));
  const positional = args.filter((a) => !a.startsWith('-'));
  if (sub === 'help' || opts.includes('--help') || opts.includes('-h')) return false; // only prints help
  if (ALWAYS_MUTATING.has(sub)) return true;
  if (sub === 'stash') return !['list', 'show'].includes(args[0]);
  if (sub === 'clean') return !opts.some((o) => o === '-n' || o === '--dry-run' || /^-[a-z]*n/.test(o));
  if (sub === 'apply') return !opts.some((o) => ['--check', '--stat', '--numstat', '--summary'].includes(o));
  if (sub === 'notes') return !['list', 'show'].includes(args[0] ?? 'list');
  // Plumbing and configuration that write: update-index, symbolic-ref with a
  // target, config with a value or a write option, remote/worktree/submodule
  // changes.
  if (sub === 'update-index') return true;
  if (sub === 'symbolic-ref') return positional.length >= 2 || opts.some((o) => o === '-d' || o === '--delete');
  if (sub === 'config') {
    // Newer syntax: `git config get|list|set|unset ...`.
    if (['get', 'list', 'get-regexp', 'get-all', 'get-urlmatch', 'get-color', 'get-colorbool'].includes(args[0])) return false;
    if (['set', 'unset', 'rename-section', 'remove-section', 'edit'].includes(args[0])) return true;
    if (opts.some((o) => /^--(unset|unset-all|add|replace-all|rename-section|remove-section|edit)$/.test(o) || o === '-e')) return true;
    // Count real positionals (key, value), skipping values of options such as -f FILE.
    let n = 0;
    for (let i = 0; i < args.length; i += 1) {
      if (CONFIG_VALUE_OPTS.has(args[i])) { i += 1; continue; }
      if (!args[i].startsWith('-')) n += 1;
    }
    return n >= 2;
  }
  if (sub === 'sparse-checkout') return ['set', 'add', 'init', 'disable', 'reapply'].includes(args[0]);
  if (sub === 'reflog') return ['expire', 'delete'].includes(args[0]);
  if (sub === 'remote') return ['add', 'remove', 'rm', 'rename', 'set-url', 'set-head', 'set-branches', 'prune', 'update'].includes(args[0]);
  if (sub === 'worktree') return ['add', 'remove', 'move', 'prune', 'lock', 'unlock', 'repair'].includes(args[0]);
  if (sub === 'submodule') return ['add', 'init', 'update', 'deinit', 'sync', 'set-branch', 'set-url', 'absorbgitdirs'].includes(args[0]);
  if (sub === 'branch' || sub === 'tag') {
    // Delete, move, copy, force, or upstream options always change refs; a name
    // changes them unless only listing flags are present.
    if (opts.some((o) => /^(-[dDmMcCfu]+|--delete|--move|--copy|--force|--set-upstream-to.*|--unset-upstream|-s|--sign|--annotate|-a)$/.test(o) && !(sub === 'branch' && o === '-a'))) return true;
    return positional.length > 0 && !opts.some((o) => LIST_FLAGS.has(o.split('=')[0]));
  }
  return false; // status, diff, log, show, blame, grep, ls-files, rev-parse, cat-file, ...
}

// Whether a run reached the role under test with the requested model. A run
// whose session never started, ran another model, could not resolve the
// role's slash command (no skill loaded: "Unknown command"), or made no
// model turn is an infrastructure error, never a model result.
export function runReachedRole(trace, { role, model }) {
  const init = trace.init;
  if (!init) return 'the session never started (no init event)';
  if (model && init.model && !String(init.model).startsWith(model)) return `ran ${init.model}, not ${model}`;
  const names = [...(init.slashCommands ?? []), ...(Array.isArray(init.skills) ? init.skills.map((s) => (typeof s === 'string' ? s : s?.name)) : [])].filter(Boolean).map(String);
  if (names.length && !names.some((n) => n === role || n.endsWith(`:${role}`))) return `/${role} was not available to the session (the role's skill did not load)`;
  if (/^Unknown (slash )?command/i.test(trace.reply ?? '')) return `the session could not resolve /${role}: ${trace.reply.slice(0, 120)}`;
  if (trace.usage && trace.usage.turns === 0) return 'the session made no model turn';
  return null;
}
