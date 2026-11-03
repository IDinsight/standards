// Parse dotenv-style text into a plain object.
const KEY = /^[A-Za-z_][A-Za-z0-9_]*$/;

export class ParseError extends Error {
  constructor(message, line) {
    super(`line ${line}: ${message}`);
    this.name = 'ParseError';
    this.line = line;
  }
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
    result[key] = plainValue(body.slice(eq + 1).trim());
  });
  return result;
}
