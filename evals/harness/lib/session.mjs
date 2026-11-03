// Seeded Claude Code sessions for cases that need earlier conversation turns. The spec's `history.turns` are written as a Claude Code
// session file in the container's ~/.claude/projects/<dir>/, and the run
// starts with `--resume <id> --fork-session`, so the role sees those turns as
// its own conversation while the seeded file stays unchanged.
//
// The file format is Claude Code's own and undocumented. The shape used here
// was read from session files Claude Code 2.1.281 wrote on this machine (keys
// only): one JSON object per line, user and assistant messages linked by
// parentUuid, each with sessionId, cwd, version, and timestamp. Stage 1 tests
// it on tester-18 and navigator-51 before anything relies on it; the run
// records whether the forked session really contains the seeded turns.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

// Claude Code keys a project's sessions by its cwd with every character other
// than a letter or digit replaced by "-": /work -> -work.
export const projectDirName = (cwd) => cwd.replace(/[^A-Za-z0-9]/g, '-');

// Deterministic UUID-shaped ids from a seed string, so reruns write the same file.
const uuidFrom = (s) => {
  const h = createHash('sha256').update(s).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

// turns: [{ role: 'user' | 'assistant', text }], alternating, starting with
// user and ending with assistant (the run's message is the next user turn).
export function seedSession({ turns, cwd, version, gitBranch = 'main', model = 'claude-sonnet-5-5', key }) {
  if (!turns?.length) throw new Error('history.turns is empty');
  if (turns[0].role !== 'user' || turns.at(-1).role !== 'assistant') throw new Error('history must start with a user turn and end with an assistant turn');
  turns.forEach((t, i) => { if (i && t.role === turns[i - 1].role) throw new Error(`history turns ${i - 1} and ${i} have the same role`); });
  const sessionId = uuidFrom(`session:${key}`);
  const lines = [];
  let parent = null;
  const t0 = Date.parse('2026-09-24T09:00:00Z');
  turns.forEach((t, i) => {
    const uuid = uuidFrom(`${key}:${i}`);
    const common = { parentUuid: parent, isSidechain: false, userType: 'external', cwd, sessionId, version, gitBranch, uuid, timestamp: new Date(t0 + i * 60_000).toISOString() };
    if (t.role === 'user') {
      lines.push({ ...common, type: 'user', message: { role: 'user', content: t.text } });
    } else {
      lines.push({
        ...common, type: 'assistant',
        message: {
          id: `msg_seed_${uuid.replace(/-/g, '').slice(0, 24)}`, type: 'message', role: 'assistant', model,
          content: [{ type: 'text', text: t.text }], stop_reason: 'end_turn', stop_sequence: null,
          usage: { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
        },
      });
    }
    parent = uuid;
  });
  return { sessionId, dir: projectDirName(cwd), file: `${sessionId}.jsonl`, jsonl: `${lines.map((l) => JSON.stringify(l)).join('\n')}\n`, texts: turns.map((t) => t.text) };
}

// After the run: did Claude Code load the seeded turns? A forked session is a
// new file in the same project dir; it must contain every seeded text, in
// order, before the run's own message. The seeded file must be unchanged.
export function verifySeeding(claudeHome, seed, originalJsonl) {
  const dir = path.join(claudeHome, 'projects', seed.dir);
  if (!existsSync(dir)) return { ok: false, reason: `no session dir ${seed.dir}` };
  const seededFile = path.join(dir, seed.file);
  const seededUnchanged = existsSync(seededFile) && readFileSync(seededFile, 'utf8') === originalJsonl;
  const others = readdirSync(dir).filter((f) => f.endsWith('.jsonl') && f !== seed.file);
  if (!others.length) return { ok: false, seededUnchanged, reason: 'no new session file: the run did not resume or fork the seeded session' };
  const found = others.map((f) => {
    const texts = [];
    for (const line of readFileSync(path.join(dir, f), 'utf8').split('\n')) {
      if (!line.trim()) continue;
      let o; try { o = JSON.parse(line); } catch { continue; }
      const c = o.message?.content;
      if (typeof c === 'string') texts.push(c);
      else if (Array.isArray(c)) for (const b of c) if (b.type === 'text' && b.text) texts.push(b.text);
    }
    // Every seeded text appears, in order.
    let k = 0;
    for (const t of texts) if (k < seed.texts.length && t === seed.texts[k]) k += 1;
    return { file: f, matched: k, of: seed.texts.length };
  });
  const best = found.sort((a, b) => b.matched - a.matched)[0];
  return { ok: best.matched === seed.texts.length && seededUnchanged, seededUnchanged, forked: best.file, matched: best.matched, of: best.of };
}
