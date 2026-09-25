import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

import { installProject } from './install.js';
import { uninstallProject } from './uninstaller.js';

const CLIENTS = new Map([
  ['codex', 'codex'],
  ['claude', 'claude'],
  ['claude-code', 'claude'],
]);

const HELP = `Usage:
  standards install [--project <path>] [--client codex|claude] [--mode greenfield|brownfield]
  standards uninstall [--project <path>] [--dry-run]
  standards --version
  standards --help

Install and uninstall target the current directory unless --project is given.
Both Codex and Claude Code are selected unless --client limits the install.
Uninstall removes all project-local STANDARDS clients and saved workflow history.
`;

const INSTALL_HELP = `Usage:
  standards install [--project <path>] [--client codex|claude] [--mode greenfield|brownfield]

--project <path>  Existing project directory (default: current directory)
--client <name>  codex or claude (default: both)
--mode <mode>   greenfield or brownfield (default: infer on first install)
`;

const UNINSTALL_HELP = `Usage:
  standards uninstall [--project <path>] [--dry-run]

--project <path>  Existing project directory (default: current directory)
--dry-run         Preview removals and edits without changing any files

Removes the entire .standards/ runtime, including saved workflow state, context,
and cycle-ID history, plus all verified STANDARDS skills for Codex and Claude.
Preserves project work and instructions outside managed blocks. Removes only
recorded client settings whose current values still match the installed values.
The global CLI stays installed. There is no client-only or force removal option.
`;

export function parseArguments(args) {
  if (args.length === 0 || (args.length === 1 && ['--help', '-h'].includes(args[0]))) {
    return { command: 'help' };
  }
  if (args.length === 1 && ['--version', '-v'].includes(args[0])) {
    return { command: 'version' };
  }
  if (!['install', 'uninstall'].includes(args[0])) {
    throw new Error(`Unknown command or option: ${args[0]}`);
  }

  const options = args[0] === 'install'
    ? { command: 'install', project: '.', clients: ['codex', 'claude'], mode: null }
    : { command: 'uninstall', project: '.', dryRun: false };
  const allowedOptions = options.command === 'install'
    ? ['--project', '--client', '--mode'] : ['--project', '--dry-run'];
  const seen = new Set();
  for (let index = 1; index < args.length; index += 1) {
    const argument = args[index];
    if (['--help', '-h'].includes(argument) && args.length === 2) {
      return { command: options.command + '-help' };
    }

    const equals = argument.indexOf('=');
    const name = equals === -1 ? argument : argument.slice(0, equals);
    if (!allowedOptions.includes(name)) {
      throw new Error(`Unknown ${options.command} option: ${argument}`);
    }
    if (seen.has(name)) {
      throw new Error(`Option ${name} was provided more than once`);
    }
    seen.add(name);

    if (name === '--dry-run') {
      if (equals !== -1) throw new Error('Option --dry-run does not take a value');
      options.dryRun = true;
      continue;
    }

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

  const help = { help: HELP, 'install-help': INSTALL_HELP, 'uninstall-help': UNINSTALL_HELP };
  if (help[options.command]) {
    stdout.write(help[options.command]);
    return 0;
  }
  if (options.command === 'version') {
    const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
    stdout.write(`${packageJson.version}\n`);
    return 0;
  }

  try {
    const projectRoot = await resolveProject(options.project, cwd);
    if (options.command === 'uninstall') {
      const result = await uninstallProject({ projectRoot, dryRun: options.dryRun });
      if (result.paths.length === 0) {
        stdout.write(`No STANDARDS installation found in ${projectRoot}\n`);
        return 0;
      }
      stdout.write(`${options.dryRun ? 'Would uninstall' : 'Uninstalled'} STANDARDS from ${projectRoot}\n`);
      stdout.write(`${options.dryRun ? 'Planned' : 'Changed'} paths: ${result.paths.length}; clients: ${result.clients.join(', ') || 'none remaining'}\n`);
      for (const entry of result.paths) {
        const label = entry.action === 'remove' ? 'Remove' : 'Update';
        stdout.write(`${label}${options.dryRun ? '' : 'd'}: ${entry.path}\n`);
      }
      stdout.write(options.dryRun
        ? 'Preview only; no files changed. Removing .standards/ deletes saved workflow state, context, and cycle-ID history.\n'
        : 'Removed saved workflow state, context, and cycle-ID history with .standards/. Project work outside it was preserved.\n');
      for (const warning of result.warnings) stdout.write(`Warning: ${warning}\n`);
      return 0;
    }
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
