// Parse dotenv-style text into a plain object.
const KEY = /^[A-Za-z_][A-Za-z0-9_]*$/;
const ESCAPES = { n: '\n', t: '\t', '"': '"', '\\': '\\' };

export class ParseError extends Error {
  constructor(message, line) {
    super(`line ${line}: ${message}`);
    this.name = 'ParseError';
    this.line = line;
  }
}

// A double-quoted value: everything up to the closing quote, with escapes
// decoded. Only a comment may follow the closing quote.
function unquote(raw, line) {
  let out = '';
  for (let i = 1; i < raw.length; i += 1) {
    const ch = raw[i];
    if (ch === '"') {
      const rest = raw.slice(i + 1).trim();
      if (rest && !rest.startsWith('#')) throw new ParseError('unexpected text after closing quote', line);
      return out;
    }
    if (ch === '\\') {
      const next = raw[i + 1];
      if (next === undefined || !Object.hasOwn(ESCAPES, next)) {
        throw new ParseError(`unknown escape "\\${next ?? ''}"`, line);
      }
      out += ESCAPES[next];
      i += 1;
      continue;
    }
    out += ch;
  }
  throw new ParseError('unterminated quoted value', line);
}

// An unquoted value ends at an inline comment: a `#` after whitespace.
function plainValue(raw) {
  const hash = raw.search(/\s#/);
  return (hash === -1 ? raw : raw.slice(0, hash)).trim();
}

export function parse(text) {
  const result = {};
  text.split(/\r?\n/).forEach((source, index) => {
    const line = index + 1;
    let body = source.trim();
    if (!body || body.startsWith('#')) return;
    if (body.startsWith('export ')) body = body.slice('export '.length).trimStart();
    const eq = body.indexOf('=');
    if (eq === -1) throw new ParseError('expected KEY=value', line);
    const key = body.slice(0, eq).trim();
    if (!KEY.test(key)) throw new ParseError(`invalid key "${key}"`, line);
    const raw = body.slice(eq + 1).trim();
    result[key] = raw.startsWith('"') ? unquote(raw, line) : plainValue(raw);
  });
  return result;
}
