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
    result[section][key] = content.slice(eq + 1).trim();
  }
  if (Object.keys(result['']).length === 0) delete result[''];
  return result;
}
