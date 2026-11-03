// Which framework files a run read, from its transcript alone, with no model
// (evals/README.md, "How runs are graded": reads). For each file:
//   full      every line reached the role: a Read with no offset or limit, or
//             shell output that holds all of the file's lines
//   partial   some lines did (a Read with offset or limit, sed -n, head, tail,
//             grep in the file's skill folder), kept as line ranges
//   seen      the role was shown its name but none of its lines: in a line of
//             framework text it saw that points to it (its own SKILL.md, which
//             the skill invocation loads at the start, a style, another
//             reference), or in a listing of its references folder; or some of
//             its lines came up in a search of the whole project ("hits")
//   not-seen  none of these. A name inside a whole-project listing (git
//             ls-files, find ., ls -R .) does not count.
// How lines are attributed: Read output carries the file's own line numbers;
// a grep line carries its file's path; any other line belongs to a file a
// printing command in the call names (cat, sed, head, grep, ...: by path, by
// a glob such as references/*.md or {a,b}.md, by a for loop's list, or
// relative to the folder a `cd` changed into, which Claude Code keeps between
// calls), and when two such files share the line, to the one its neighbors
// belong to, or else to the one the ==> path <== heading above it names. A
// file a command only names (wc, test, ls, find) is no candidate. Unnumbered
// lines count as read only where the output holds them as the file does (cat,
// sed, head) or under a heading; a stray line is only a hit, because a file
// the call reached some other way may share it. A grep is judged by its own
// command segment: a grep of the whole project stays a search, whatever else
// the command reads.
// Output too large for the transcript is saved to a file; a later read of that
// file counts for the files the first call named.
// Subagents' reads count (their events carry parent_tool_use_id). Rule
// exposure counts read lines and hits alike: either way, the role saw the line
// that states the rule. Calls that target a references/ path are also listed
// as searches: in version B, which has no references, each one is an attempt
// to find one. frameworkCalls lists the calls that printed lines of a
// framework file on purpose (not as hits), looked for a references/ path, or
// ran a command inside a skills folder, where a cd (of this call or an earlier
// one) left the shell (judge.mjs leaves these out of documenter-38's timeline).
//
//   node reads.mjs <run-dir> [...]       writes reads.json into each run dir
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { frameworkAt } from '../lib/framework.mjs';
import { parseTranscript } from '../lib/trace.mjs';
import { BASE_COMMIT } from './build-b.mjs';

// A framework file as a path names it, wherever the skills folder is
// (.claude/skills, .agents/skills, or the CLI's copy under /opt/standards).
const FILE = /(?<![\w-])skills\/([\w-]+)\/((?:[\w-]+\/)*[\w.-]+\.md)\b/g;
// A shipped reference named without its role, as in `cat references/x.md`
// run from a skill folder. Reference names are unique across roles.
const BARE_REFERENCE = /(?<![\w-])references\/([\w-]+\.md)\b/g;
// A call that targets a references/ path (never .standards/project-references/).
const REFERENCES_PATH = /(?<![\w-])references\/|\/references\b/;
const REFERENCES_WORD = /(?<![\w-])references\b/;
// Read prints "<line number>\t<text>"; cat -n and grep -n print similar prefixes.
const READ_LINE = /^\s*(\d+)\t/;
const NUMBER_PREFIX = /^\s*(\d+)(?:\t|[:→-] ?)/;
// A line grep prints: "<path>:<n>:<text>", "<path>-<n>-<text>", or "<path>:<text>".
// The path may be relative to the folder the command changed into.
const GREP_LINE = /^(\S+?\.md)(?:([:-])(\d+)\2|:)(.*)$/;
// A path token relative to the current folder, such as styles/x.md or ../SKILL.md.
const RELATIVE = /(?<![\w/.$-])(?:\.{1,2}\/)*[\w-][\w.-]*(?:\/[\w.-]+)*\.md\b/g;
// A token with glob characters, such as references/*.md or {a,b}.md.
const GLOB_TOKEN = /(?<![\w$-])[\w.*?{},/-]*[*?{][\w.*?{},/-]*/g;
// Claude Code saves an output too large for the transcript and shows a preview.
const PERSISTED = /Full output saved to: (\S+)/;
// A heading a shell prints before a file's lines: head's "==> path <==", or a
// loop's "=== path", "--- path", "# path".
const HEADING = /^\s*(?:==>|={2,}|-{3,}|#{1,6})\s*(\S+?)\s*(?:<==|={2,}|-{3,})?\s*$/;
// The segments of a shell command: split on ; && || | and newlines outside
// quotes, so grep -E "a|b" stays one segment.
function segmentsOf(command) {
  const out = [];
  let cur = '';
  let quote = null;
  for (let i = 0; i < command.length; i += 1) {
    const c = command[i];
    if (quote) {
      if (c === '\\' && quote === '"') { cur += c + (command[i + 1] ?? ''); i += 1; continue; }
      if (c === quote) quote = null;
      cur += c;
    } else if (c === '"' || c === "'") { quote = c; cur += c; } else if (c === '\\') { cur += c + (command[i + 1] ?? ''); i += 1; } else if (command.startsWith('&&', i) || command.startsWith('||', i)) { out.push(cur); cur = ''; i += 1; } else if (c === ';' || c === '|' || c === '\n') { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}
// The command a segment runs, past variable assignments and words such as
// sudo, xargs (with its options), or a loop's do.
const PREFIXES = new Set(['sudo', 'env', 'time', 'nice', 'nohup', 'command', 'exec', 'xargs', 'do', 'then', 'else', '{', '(']);
function commandOf(seg) {
  let afterPrefix = false;
  for (const w of seg.split(/\s+/)) {
    if (/^\w+=/.test(w)) continue;
    if (PREFIXES.has(w) || /^\(+$/.test(w)) { afterPrefix = true; continue; }
    if (afterPrefix && w.startsWith('-')) continue;
    return path.posix.basename(w.replace(/^\(+/, ''));
  }
  return '';
}
// Commands whose output holds the lines of the files they name. Naming a
// file elsewhere (wc, test, ls, find) prints none of its lines.
const PRINTERS = new Set(['cat', 'sed', 'head', 'tail', 'nl', 'awk', 'less', 'more', 'bat', 'tac', 'cut', 'grep', 'egrep', 'fgrep', 'rg', 'ag', 'ack']);
const GREPS = new Set(['grep', 'egrep', 'fgrep', 'rg', 'ag', 'ack']);

const keyOf = (role, rest) => `skills/${role}/${rest}`;
const roleOf = (key) => key.split('/')[1];
const isReference = (key) => /^skills\/[\w-]+\/references\//.test(key);
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// A shell glob as a regex over file keys: ** any path, * and ? within one
// folder, {a,b} either name.
const globRegex = (glob) => new RegExp(`^${glob.split(/(\*\*|\*|\?|\{[^}]*\})/).map((p) => {
  if (p === '**') return '.*';
  if (p === '*') return '[^/]*';
  if (p === '?') return '[^/]';
  if (/^\{.*\}$/.test(p)) return `(?:${p.slice(1, -1).split(',').map(escape).join('|')})`;
  return escape(p);
}).join('')}$`);
// The folder a `cd` leads to, when it is the skills folder or inside it; null
// otherwise.
const cdTo = (cwd, dir) => {
  const inSkills = dir.match(/(?<![\w-])skills(?:\/[\w.-]+)*\/?$/);
  if (inSkills) return path.posix.normalize(inSkills[0]).replace(/\/$/, '');
  if (!cwd || dir.startsWith('/') || dir.startsWith('~')) return null;
  const next = path.posix.normalize(`${cwd}/${dir}`);
  return next === 'skills' || next.startsWith('skills/') ? next : null;
};
// What a call looks at: the command, path, or pattern, never its description.
// The body of a heredoc that cat or tee only writes out is data, not part of
// the command: `cat > notes.md <<'EOF'` ... `EOF` looks for nothing. The body
// stays wherever it may run: a heredoc fed to a shell or an interpreter (bash
// <<EOF, python3 - <<EOF, cat <<EOF | sh, a line continued into a pipe), one
// inside $( ) or <( ), or inside a group piped on ((cat <<EOF ... EOF) | sh),
// one on a line with another heredoc (their bodies follow one another), and one
// whose written file the same command names again (cat > x.sh <<EOF ... EOF;
// bash x.sh). Read detection and judge.mjs both parse a command without the bodies
// this removes, so a written file that holds a cd never moves the shell.
const HEREDOC = /((?:^|[\n;&|(])[ \t]*(?:cat|tee)\b[^\n|;&$`()]*?)<<-?[ \t]*(['"]?)([\w.-]+)\2([^\n|]*)\n(?:[\s\S]*?\n)??[ \t]*\3[ \t]*(?=\n|$)/g;
export const withoutWrittenHeredocs = (command) => command.replace(HEREDOC, (whole, before, quote, word, after, at, all) => {
  if (all[at] === '(' && /[$<>]/.test(all[at - 1] ?? '')) return whole;
  if (all[at] === '\n' && /[$<>]\(\s*$/.test(all.slice(0, at))) return whole;
  if (/\\$/.test(after) || /^\s*[)}]\s*\|/.test(all.slice(at + whole.length))) return whole;
  const from = all[at] === '\n' ? at + 1 : at;
  const end = all.indexOf('\n', from);
  const line = all.slice(all.lastIndexOf('\n', from - 1) + 1, end === -1 ? undefined : end);
  if ((line.match(/<<(?!<)/g) ?? []).length > 1) return whole;
  // Every file it writes: each redirect's target (stdout's, not 2> or &>; not
  // /dev/null) and each file tee is given.
  const head = `${before} ${after}`;
  const redirect = /(?<![02-9&>])>{1,2}\s*(['"]?)([^\s'";&|<>]+)\1/g;
  const files = [
    ...[...head.matchAll(redirect)].map((m) => m[2]),
    ...(head.match(/\btee\b((?:\s+(?![<>])[^\s<>|;&]+)*)/)?.[1] ?? '').split(/\s+/).filter((w) => w && !w.startsWith('-')).map((w) => w.replace(/^['"]|['"]$/g, '')),
  ].filter((f) => f !== '/dev/null');
  // Where a written file could be named again: the rest of its own line (past
  // its redirects) and everything after the heredoc.
  const rest = `${after.replace(redirect, ' ')}\n${all.slice(at + whole.length)}`;
  const named = files.some((f) => new RegExp(`(?<![\\w.-])${escape(path.posix.basename(f))}(?![\\w.-])`).test(rest));
  return named ? whole : `${before}<<${word}${after}`;
});
const targetOf = (e) => [e.command === undefined ? undefined : withoutWrittenHeredocs(e.command), e.input?.file_path, e.input?.path, e.input?.pattern, e.input?.glob, e.input?.notebook_path]
  .filter((x) => typeof x === 'string').join('\n');

// The framework's skill files at a commit, without the evals folders the
// package never installs: { 'skills/<role>/<path>': text }.
export function frameworkFiles(commit) {
  const root = path.join(frameworkAt(commit).dir, 'skills');
  const files = {};
  const walk = (rel) => {
    for (const name of readdirSync(path.join(root, rel)).sort()) {
      const r = rel ? `${rel}/${name}` : name;
      if (statSync(path.join(root, r)).isDirectory()) { if (!/^[^/]+\/evals$/.test(r)) walk(r); } else if (name.endsWith('.md')) files[`skills/${r}`] = readFileSync(path.join(root, r), 'utf8');
    }
  };
  walk('');
  return files;
}

// Lines a shell output can be matched against: long enough to mean something
// (8 characters or more) and found once in the file.
function lineIndex(text) {
  const lines = text.split('\n');
  if (lines.at(-1) === '') lines.pop();
  const count = new Map();
  for (const l of lines) count.set(l.trim(), (count.get(l.trim()) ?? 0) + 1);
  const index = new Map();
  lines.forEach((l, n) => { const t = l.trim(); if (t.length >= 8 && count.get(t) === 1) index.set(t, n + 1); });
  return { lines, index, matchable: new Set(index.values()), all: new Set(count.keys()) };
}

// Line numbers as ranges. Two ranges join when every line between them is
// one a shell output cannot show (blank, short, or repeated).
function ranges(lines, matchable) {
  const out = [];
  for (const n of [...lines].sort((a, b) => a - b)) {
    const last = out.at(-1);
    if (last && (n === last[1] + 1 || Array.from({ length: n - last[1] - 1 }, (_, k) => last[1] + 1 + k).every((m) => !matchable.has(m)))) last[1] = n;
    else out.push([n, n]);
  }
  return out;
}

const overlaps = (list, [first, last]) => list.some(([a, b]) => a <= last && b >= first);

// A rule's lines in this version of its file: found by its text, so version B,
// whose patched files have other line numbers, still finds it. Null when the
// file or the text is not in this version.
function locate(text, rule) {
  if (text === undefined) return null;
  if (!rule.text) return rule.lines ?? null;
  const at = text.indexOf(rule.text);
  if (at < 0) return null;
  const first = text.slice(0, at).split('\n').length;
  return [first, first + rule.text.split('\n').length - 1];
}

// detectReads(trace, files, { references, rules, role }):
//   trace       parseTranscript() of the run
//   files       framework files of the run's commit (frameworkFiles)
//   references  reference keys to report even when this commit has none
//               (version B): skills/<role>/references/<name>.md
//   rules       [{ check, file, text }]: whether the run saw the lines that
//               state each graded rule (text: an exact passage of the file)
//   role        the skill the run invoked, whose SKILL.md it loaded at the start
export function detectReads(trace, files, { references = [], rules = [], role = null } = {}) {
  const idx = Object.fromEntries(Object.entries(files).map(([k, t]) => [k, lineIndex(t)]));
  const known = new Set([...Object.keys(files), ...references]);
  const byName = new Map([...known].filter(isReference).map((k) => [path.basename(k), k]));
  const state = new Map(); // key -> { lines, hits, seen, chars, events, subagent, start }
  const at = (k) => {
    if (!state.has(k)) state.set(k, { lines: new Set(), hits: new Set(), seen: false, chars: 0, events: new Set(), subagent: false, start: false });
    return state.get(k);
  };
  const touch = (k, e) => { const s = at(k); if (e) { s.events.add(e.i); if (e.subagent) s.subagent = true; } else s.start = true; return s; };
  const named = (text) => {
    const keys = new Set();
    for (const m of text.matchAll(FILE)) if (known.has(keyOf(m[1], m[2]))) keys.add(keyOf(m[1], m[2]));
    for (const m of text.matchAll(BARE_REFERENCE)) if (byName.has(m[1])) keys.add(byName.get(m[1]));
    return keys;
  };
  // A path as a file key: by its skills/ or references/ part, or relative to
  // the skill folder the command changed into.
  const resolve = (p, cwd) => {
    const direct = named(p);
    if (direct.size || !cwd || p.startsWith('/')) return direct;
    const k = path.posix.normalize(`${cwd}/${p}`);
    return known.has(k) ? new Set([k]) : new Set();
  };
  // Files a glob in a segment matches: `cat references/*.md` prints them all,
  // and each printed line is then matched to its own file.
  const globbed = (seg, cwd) => {
    const keys = new Set();
    for (const [t] of seg.matchAll(GLOB_TOKEN)) {
      const at = t.search(/(?<![\w-])skills\//);
      const pattern = at >= 0 ? t.slice(at)
        : cwd && !t.startsWith('/') ? path.posix.normalize(`${cwd}/${t}`)
          : t.startsWith('references/') ? `skills/*/${t}` : null;
      if (!pattern) continue;
      const re = globRegex(pattern);
      for (const k of known) if (re.test(k)) keys.add(k);
    }
    return keys;
  };
  // What a call prints and where it looks. A shell command is read segment by
  // segment: a `cd` sets the folder that later relative paths and globs
  // resolve against (starting from the folder an earlier call left, since
  // Claude Code keeps it between calls); only segments that print a file
  // (cat, sed, head, grep, ...) make it a candidate for the output's lines,
  // and so do the files a for loop lists when its body prints "$f"; a grep is
  // judged by its own segment; an ls prints "<folder>:" headings only for -R
  // or several folders.
  const callOf = (e, target, startCwd) => {
    const keys = new Set();
    const places = [];
    const greps = [];
    const loopFiles = new Set();
    let printsVariable = false;
    const ls = [];
    let inside = false;
    let cwd = e.tool === 'Bash' ? startCwd : null;
    const filesIn = (seg) => new Set([...named(seg), ...globbed(seg, cwd), ...(cwd ? [...seg.matchAll(RELATIVE)].flatMap(([t]) => [...resolve(t, cwd)]) : [])]);
    for (const seg of e.tool === 'Bash' ? segmentsOf(target) : [target]) {
      const cd = e.tool === 'Bash' && seg.match(/^\(?\s*(?:cd|pushd)\s+(\S+)/);
      if (cd) { cwd = cdTo(cwd, cd[1].replace(/^["']|["']$/g, '')); continue; }
      if (cwd) inside = true;
      const place = `${cwd ?? ''} ${seg}`;
      places.push(place);
      const command = commandOf(seg);
      if (e.tool !== 'Bash' || PRINTERS.has(command)) {
        for (const k of filesIn(seg)) keys.add(k);
        if (/\$\{?\w+\}?/.test(seg)) printsVariable = true;
      }
      if (e.tool !== 'Bash' || GREPS.has(command)) greps.push(place);
      if (/^for\s+\w+\s+in\s/.test(seg)) for (const k of filesIn(seg)) loopFiles.add(k);
      if (command === 'ls') {
        // What it lists, past redirections such as 2>&1 or 2>/dev/null.
        const words = seg.replace(/\d*>&\d+/g, ' ').replace(/\d*[<>]{1,2}\s*\S+/g, ' ').trim().split(/\s+/).slice(1);
        ls.push({ args: words.filter((w) => !w.startsWith('-')).map((w) => w.replace(/^["']|["']$/g, '')), recursive: words.some((w) => /^-\w*R/.test(w)) });
      }
    }
    if (printsVariable) for (const k of loopFiles) keys.add(k);
    return { keys, cwd, inside, scope: places.join('\n'), greps, ls };
  };
  // A "<folder>:" line an ls prints before each folder's list (ls -R, ls of
  // several folders, or a glob that matches folders): a folder under what the
  // ls was given. A markdown line such as "Example:" printed by another
  // command is not one.
  const isLsHeading = (line, call) => {
    const m = line.match(/^([\w.~/-]+):$/);
    return Boolean(m) && call.ls.some(({ args, recursive }) => (args.length ? args : ['.']).some((a) => {
      const base = a.replace(/[*?{].*$/, '').replace(/\/+$/, '');
      return !base || m[1] === base || m[1].startsWith(`${base}/`) || (recursive && (m[1] === '.' || m[1].startsWith('./')));
    }));
  };
  // Names in a line of framework file `file` the role saw: paths, and, in a
  // reference, the bare names of the other references beside it.
  const sibling = new Map([...byName].map(([name, k]) => [k, new RegExp(`(?<![\\w-])${escape(name)}(?![\\w-])`)]));
  const pointers = (line, file, e) => {
    for (const k of named(line)) if (k !== file) touch(k, e).seen = true;
    if (!isReference(file)) return;
    for (const [k, re] of sibling) if (k !== file && roleOf(k) === roleOf(file) && re.test(line)) touch(k, e).seen = true;
  };
  const frameworkCalls = new Set();
  const read = (k, n, e, line) => { const s = touch(k, e); s.lines.add(n); s.chars += line.length + 1; pointers(line, k, e); if (e) frameworkCalls.add(e.i); };
  const hit = (k, n, e, line) => { touch(k, e).hits.add(n); pointers(line, k, e); };

  // The skill the run invoked: Claude Code loads its SKILL.md before the first
  // turn, so every line of it, pointers included, reached the role.
  const skill = role && `skills/${role}/SKILL.md`;
  if (skill && files[skill]) idx[skill].lines.forEach((l, n) => read(skill, n + 1, null, l));

  const searches = [];
  const saved = new Map(); // saved output path -> the call that made it
  const shellCwd = { main: null, subagent: null }; // the folder each agent's shell is in
  for (const e of trace.events) {
    const target = targetOf(e);
    const output = e.output ?? '';
    // An output read back from where Claude Code saved it belongs to the call that made it.
    const from = [...saved.entries()].find(([p]) => target.includes(p))?.[1];
    const agent = e.subagent ? 'subagent' : 'main';
    const call = from ?? callOf(e, target, shellCwd[agent]);
    if (!from && e.tool === 'Bash' && call.inside) frameworkCalls.add(e.i);
    // The shell keeps the folder for the next call, unless a cd failed.
    if (!from && e.tool === 'Bash' && !/\bcd: /.test(output)) shellCwd[agent] = call.cwd;
    const { keys, scope } = call;
    const persisted = output.match(PERSISTED);
    if (persisted) saved.set(persisted[1], call);
    if (REFERENCES_PATH.test(target)) { searches.push({ event: e.i, tool: e.tool, subagent: e.subagent, error: Boolean(e.isError), target: target.slice(0, 200) }); frameworkCalls.add(e.i); }
    // A Read that failed read nothing (the file is missing). A shell command
    // that exited non-zero may still have printed the file, so it is kept.
    if (e.tool === 'Read' && e.isError) continue;
    // A saved output read back carries Read's own line numbers: drop them.
    const lines = output.split('\n').map((l) => (from && e.tool === 'Read' ? l.replace(READ_LINE, '') : l));
    if (e.tool === 'Read' && !from) {
      const k = [...keys][0];
      if (k && files[k]) for (const line of lines) { const m = line.match(READ_LINE); if (m) read(k, Number(m[1]), e, line.replace(READ_LINE, '')); }
      continue;
    }

    // A listing of a references folder names its files: a call that looks in
    // one, or a listing of a skill folder that prints its references: heading.
    // A call that names one role's folder counts only that role's files, so
    // an unrelated git ls-files in the same command adds nothing.
    if (REFERENCES_WORD.test(scope) || (/(?<![\w-])skills\b/.test(scope) && lines.some((l) => /(?<![\w-])references:$/.test(l.trim())))) {
      const roles = new Set([...scope.matchAll(/(?<![\w-])skills\/([\w-]+)/g)].map((m) => m[1]));
      const inScope = (k) => !roles.size || roles.has(roleOf(k));
      for (const k of named(output)) if (isReference(k) && inScope(k)) touch(k, e).seen = true;
      // When an ls printed folder headings, only names under a references:
      // heading count.
      const headed = lines.some((l) => isLsHeading(l.trim(), call));
      let under = !headed;
      for (const raw of lines) {
        const t = raw.trim();
        if (headed && isLsHeading(t, call)) { under = /(?<![\w-])references:$/.test(t); continue; }
        if (!t || !under) continue;
        const k = byName.get(t.split(/\s+/).at(-1).split('/').at(-1));
        if (k && inScope(k)) touch(k, e).seen = true;
      }
    }

    // Attribute each output line to a framework file, if any.
    const got = lines.map(() => null);
    let heading = null;
    lines.forEach((raw, i) => {
      // A heading (==> path <==, === path) names the file whose lines follow,
      // until the first line that file does not have.
      const h = raw.match(HEADING)?.[1];
      const hk = h && resolve(h, call.cwd);
      if (hk?.size === 1) { heading = [...hk][0]; return; }
      if (heading && raw.trim() && files[heading] && ![raw.trim(), raw.replace(NUMBER_PREFIX, '').trim()].some((t) => idx[heading].all.has(t))) heading = null;
      const g = raw.match(GREP_LINE);
      const gk = g && [...resolve(g[1].replace(/^\.\//, ''), call.cwd)][0];
      // A line that only looks like grep's (a file's own line that starts
      // with "x.md:") and matches nothing there is matched as content below.
      if (gk && files[gk]) {
        const n = g[3] ? Number(g[3]) : idx[gk].index.get(g[4].trim());
        if (n) { got[i] = { file: gk, n, grep: true, explicit: Boolean(g[3]) }; return; }
      }
      const number = raw.match(NUMBER_PREFIX)?.[1];
      const texts = [raw.trim(), raw.replace(NUMBER_PREFIX, '').trim()];
      const found = new Map();
      for (const k of new Set([...keys, ...(heading ? [heading] : [])])) {
        const n = files[k] && texts.map((t) => idx[k].index.get(t)).find(Boolean);
        if (n) found.set(k, n);
      }
      // A line under a heading that names its file is certain, numbered or not.
      const certain = (file) => file === heading;
      if (found.size === 1) { const [[file, n]] = [...found]; got[i] = { file, n, explicit: Number(number) === n || certain(file) }; } else if (found.size > 1) got[i] = { shared: found, heading };
    });
    // A shared line goes to the file of the nearest attributed lines around
    // it, if exactly one of the files fits their order; else to the file the
    // heading above it names.
    got.forEach((x, i) => {
      if (!x?.shared) return;
      const prev = got.slice(0, i).reverse().find((y) => y?.file);
      const next = got.slice(i + 1).find((y) => y?.file);
      const fits = [...x.shared].filter(([f, n]) => (prev?.file === f && n > prev.n) || (next?.file === f && n < next.n));
      if (fits.length === 1) got[i] = { file: fits[0][0], n: fits[0][1], explicit: false };
      else got[i] = x.heading && x.shared.has(x.heading) ? { file: x.heading, n: x.shared.get(x.heading), explicit: true } : null;
    });
    const perFile = new Map();
    got.forEach((x, i) => { if (x?.file) perFile.set(x.file, [...(perFile.get(x.file) ?? []), { ...x, i, line: lines[i] }]); });
    for (const [file, list] of perFile) {
      // Grep lines are reads when the grep searched the file's skill folder,
      // its references folder, or the file itself; from a search of the whole
      // project, they are hits.
      const deliberate = call.greps.some((g) => named(g).has(file) || new RegExp(`(?<![\\w-])skills/${escape(roleOf(file))}\\b`).test(g)
        || (isReference(file) && REFERENCES_WORD.test(g)));
      for (const x of list.filter((y) => y.grep)) (deliberate ? read : hit)(file, x.n, e, x.line);
      // Other lines are reads when the output holds them as the file does
      // (cat, sed, head: the gap between two lines in the output equals their
      // gap in the file), or when they carry the file's own line number. A
      // line that lines up with no other is a hit: a file the call reached by
      // a relative path may share it.
      const blocks = [];
      for (const x of list.filter((y) => !y.grep)) {
        const block = blocks.find((b) => { const last = b.at(-1); return x.n > last.n && x.i - last.i === x.n - last.n; });
        if (block) block.push(x); else blocks.push([x]);
      }
      for (const b of blocks) for (const x of b) (b.length > 1 || x.explicit ? read : hit)(file, x.n, e, x.line);
    }
  }

  const report = (k) => {
    const s = state.get(k);
    if (!s || (!s.lines.size && !s.hits.size && !s.seen)) return { status: 'not-seen' };
    const m = idx[k]?.matchable ?? new Set();
    const full = s.lines.size > 0 && [...m].every((n) => s.lines.has(n));
    return {
      status: full ? 'full' : s.lines.size ? 'partial' : 'seen',
      ranges: ranges(s.lines, m), hits: ranges(s.hits, m), chars: s.chars,
      events: [...s.events].sort((a, b) => a - b), subagent: s.subagent, ...(s.start ? { atStart: true } : {}),
    };
  };
  const filesSeen = Object.fromEntries([...state.keys()].sort().map((k) => [k, report(k)]));
  return {
    references: Object.fromEntries([...byName.values()].sort().map((k) => [k, filesSeen[k] ?? { status: 'not-seen' }])),
    files: filesSeen,
    searches,
    frameworkCalls: [...frameworkCalls].sort((a, b) => a - b),
    rules: rules.map((r) => {
      const where = locate(files[r.file], r);
      const s = filesSeen[r.file];
      return { check: r.check, file: r.file, lines: where, exposed: Boolean(where && s?.ranges && (overlaps(s.ranges, where) || overlaps(s.hits, where))) };
    }),
  };
}

// The shipped references at release 0.15.0, which version B lacks.
export const baseReferences = () => Object.keys(frameworkFiles(BASE_COMMIT)).filter(isReference);

// reads.json for one run: the run's own framework files (from fixture.json),
// the 0.15.0 reference list, the case's graded rules, and the invoked skill.
export function readsForRun(runDir, { rules = [] } = {}) {
  const run = JSON.parse(readFileSync(path.join(runDir, 'run.json'), 'utf8'));
  const fixture = JSON.parse(readFileSync(path.join(runDir, 'fixture.json'), 'utf8'));
  const trace = parseTranscript(path.join(runDir, 'transcript.jsonl'), run.projectRoot ?? '/work');
  const role = String(run.case).replace(/-\d+$/, '');
  const out = { commit: fixture.framework, ...detectReads(trace, frameworkFiles(fixture.framework), { references: baseReferences(), rules, role }) };
  writeFileSync(path.join(runDir, 'reads.json'), JSON.stringify(out, null, 2));
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const dir of process.argv.slice(2)) {
    if (!existsSync(path.join(dir, 'transcript.jsonl'))) { console.error(`${dir}: no transcript.jsonl`); process.exitCode = 1; continue; }
    const r = readsForRun(dir);
    const seen = Object.entries(r.references).filter(([, v]) => v.status !== 'not-seen').map(([k, v]) => `${path.basename(k)}=${v.status}`);
    console.log(`${dir}: ${seen.join(', ') || 'no reference seen'}${r.searches.length ? `; ${r.searches.length} calls targeted a references/ path` : ''}`);
  }
}
