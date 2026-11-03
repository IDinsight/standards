const MODE_FLAGS = {
  '-l': 'lines',
  '--lines': 'lines',
  '-w': 'words',
  '--words': 'words',
  '-c': 'chars',
  '--chars': 'chars',
};

// Parse command-line arguments. `-` names standard input; any other argument
// starting with `-` must be a known option.
export function parseArgs(argv) {
  const options = { mode: 'lines', json: false, help: false, files: [] };
  let modeSet = false;
  for (const arg of argv) {
    if (Object.hasOwn(MODE_FLAGS, arg)) {
      if (modeSet && options.mode !== MODE_FLAGS[arg]) {
        throw new Error('choose only one of -l, -w, -c');
      }
      options.mode = MODE_FLAGS[arg];
      modeSet = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '-h' || arg === '--help') {
      options.help = true;
    } else if (arg !== '-' && arg.startsWith('-')) {
      throw new Error(`unknown option ${arg}`);
    } else {
      options.files.push(arg);
    }
  }
  return options;
}
