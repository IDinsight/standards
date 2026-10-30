// Parse INI-style text into an object of sections, each an object of
// key/value strings. Keys that appear before the first section header are
// kept under the empty section name ''.

export class ParseError extends Error {
  constructor(message, line) {
    super(`line ${line}: ${message}`);
    this.name = 'ParseError';
    this.line = line;
  }
}

const ESCAPES = { '"': '"', '\\': '\\', n: '\n', t: '\t' };

// A value in double quotes keeps its inner whitespace and may use the escapes
// above; any other value is returned as written.
function parseValue(raw, line) {
  if (!raw.startsWith('"')) return raw;
  let value = '';
  for (let i = 1; i < raw.length; i += 1) {
    const ch = raw[i];
    if (ch === '\\') {
      const next = raw[i + 1];
      if (next === undefined) break;
      if (!Object.hasOwn(ESCAPES, next)) throw new ParseError(`unknown escape \\${next}`, line);
      value += ESCAPES[next];
      i += 1;
    } else if (ch === '"') {
      if (i !== raw.length - 1) throw new ParseError('unexpected text after closing quote', line);
      return value;
    } else {
      value += ch;
    }
  }
  throw new ParseError('unterminated quoted value', line);
}

export function parse(text) {
  const result = { '': {} };
  let section = '';
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = index + 1;
    const content = lines[index].trim();
    if (content === '' || content.startsWith('#') || content.startsWith(';')) continue;
    if (content.startsWith('[')) {
      if (!content.endsWith(']')) throw new ParseError('unterminated section header', line);
      section = content.slice(1, -1).trim();
      if (section === '') throw new ParseError('empty section name', line);
      result[section] ??= {};
      continue;
    }
    const eq = content.indexOf('=');
    if (eq === -1) throw new ParseError('expected key = value', line);
    const key = content.slice(0, eq).trim();
    if (key === '') throw new ParseError('missing key', line);
    result[section][key] = parseValue(content.slice(eq + 1).trim(), line);
  }
  if (Object.keys(result['']).length === 0) delete result[''];
  return result;
}
