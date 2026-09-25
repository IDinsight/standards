import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

import { installProject } from './install.js';

const CLIENTS = new Map([
  ['codex', 'codex'],
  ['claude', 'claude'],
  ['claude-code', 'claude'],
]);

const HELP = `Usage:
  standards install [--project <path>] [--client codex|claude] [--mode greenfield|brownfield]
  standards --version
  standards --help

The install command targets the current directory unless --project is given.
Both Codex and Claude Code are selected unless --client limits the install.
`;

const INSTALL_HELP = `Usage:
  standards install [--project <path>] [--client codex|claude] [--mode greenfield|brownfield]

--project <path>  Existing project directory (default: current directory)
--client <name>  codex or claude (default: both)
--mode <mode>   greenfield or brownfield (default: infer on first install)
`;

export function parseArguments(args) {
  if (args.length === 0 || (args.length === 1 && ['--help', '-h'].includes(args[0]))) {
    return { command: 'help' };
  }
  if (args.length === 1 && ['--version', '-v'].includes(args[0])) {
    return { command: 'version' };
  }
  if (args[0] !== 'install') {
    throw new Error(`Unknown command or option: ${args[0]}`);
  }

  const options = { command: 'install', project: '.', clients: ['codex', 'claude'], mode: null };
  const seen = new Set();
  for (let index = 1; index < args.length; index += 1) {
    const argument = args[index];
    if (['--help', '-h'].includes(argument) && args.length === 2) {
      return { command: 'install-help' };
    }

    const equals = argument.indexOf('=');
    const name = equals === -1 ? argument : argument.slice(0, equals);
    if (!['--project', '--client', '--mode'].includes(name)) {
      throw new Error(`Unknown install option: ${argument}`);
    }
    if (seen.has(name)) {
      throw new Error(`Option ${name} was provided more than once`);
    }
    seen.add(name);

    let value;
    if (equals !== -1) {
      value = argument.slice(equals + 1);
    } else {
      value = args[index + 1];
      index += 1;
    }
    if (!value || value.startsWith('--')) {
      throw new Error(`Option ${name} requires a value`);
    }

    if (name === '--project') {
      options.project = value;
    } else if (name === '--client') {
      const client = CLIENTS.get(value.toLowerCase());
      if (!client) {
        throw new Error(`Unsupported client: ${value}. Choose codex or claude.`);
      }
      options.clients = [client];
    } else {
      const mode = value.toUpperCase();
      if (!['GREENFIELD', 'BROWNFIELD'].includes(mode)) {
        throw new Error(`Unsupported mode: ${value}. Choose greenfield or brownfield.`);
      }
      options.mode = mode;
    }
  }
  return options;
}

async function resolveProject(project, cwd) {
  const target = path.resolve(cwd, project);
  let entry;
  try {
    entry = await stat(target);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Project directory does not exist: ${target}`);
    }
    throw error;
  }
  if (!entry.isDirectory()) {
    throw new Error(`Project path is not a directory: ${target}`);
  }
  return realpath(target);
}

export async function runCli(
  args,
  { cwd = process.cwd(), stdout = process.stdout, stderr = process.stderr } = {},
) {
  let options;
  try {
    options = parseArguments(args);
  } catch (error) {
    stderr.write(`Error: ${error.message}\nRun standards --help for usage.\n`);
    return 2;
  }

  if (options.command === 'help' || options.command === 'install-help') {
    stdout.write(options.command === 'help' ? HELP : INSTALL_HELP);
    return 0;
  }
  if (options.command === 'version') {
    const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
    stdout.write(`${packageJson.version}\n`);
    return 0;
  }

  try {
    const projectRoot = await resolveProject(options.project, cwd);
    const result = await installProject({ projectRoot, clients: options.clients, mode: options.mode });
    stdout.write(`${result.action} STANDARDS ${result.version} in ${projectRoot}\n`);
    stdout.write(`Mode: ${result.mode}; clients: ${result.clients.join(', ')}; changed paths: ${result.changed}\n`);
    for (const warning of result.warnings) stdout.write(`Warning: ${warning}\n`);
    return 0;
  } catch (error) {
    stderr.write(`Error: ${error.message}\n`);
    return 1;
  }
}
