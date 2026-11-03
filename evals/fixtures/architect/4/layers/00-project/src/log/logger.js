// JSON-lines logger. child(fields) returns a logger that adds fields to every line.
export function createLogger({ service, sink = (line) => process.stdout.write(`${line}\n`), base = {} } = {}) {
  function write(level, msg, fields = {}) {
    sink(JSON.stringify({ time: new Date().toISOString(), level, service, msg, ...base, ...fields }));
  }
  return {
    info: (msg, fields) => write('info', msg, fields),
    warn: (msg, fields) => write('warn', msg, fields),
    error: (msg, fields) => write('error', msg, fields),
    child: (fields) => createLogger({ service, sink, base: { ...base, ...fields } }),
  };
}
