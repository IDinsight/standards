import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import * as clack from '@clack/prompts';

import { installProject } from './install.js';
import { inspectInstallTarget, planInstallProject } from './installer.js';
import { uninstallProject } from './uninstaller.js';

const CLIENTS = new Map([
  ['codex', 'codex'],
  ['claude', 'claude'],
  ['claude-code', 'claude'],
]);

const HELP = `Usage:
  standards install [--project <path>] [--client codex|claude] [--mode greenfield|brownfield] [--yes]
  standards uninstall [--project <path>] [--dry-run] [--yes]
  standards --version
  standards --help

Install and uninstall target the current directory unless --project is given.
Both Codex and Claude Code are selected unless --client limits the install.
Uninstall removes all project-local STANDARDS clients and saved workflow history.
In a terminal, commands guide you through a preview and confirmation.
Use --yes to skip prompts; piped and automated runs also use flag defaults.
`;

const INSTALL_HELP = `Usage:
  standards install [--project <path>] [--client codex|claude] [--mode greenfield|brownfield] [--yes]

--project <path>  Existing project directory (default: current directory)
--client <name>  codex or claude (default: both)
--mode <mode>   greenfield or brownfield (default: infer on first install)
--yes           Skip interactive questions and confirmation
`;

const UNINSTALL_HELP = `Usage:
  standards uninstall [--project <path>] [--dry-run] [--yes]

--project <path>  Existing project directory (default: current directory)
--dry-run         Preview removals and edits without changing any files
--yes             Skip interactive questions and confirmation

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
    ? ['--project', '--client', '--mode', '--yes'] : ['--project', '--dry-run', '--yes'];
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

    if (name === '--dry-run' || name === '--yes') {
      if (equals !== -1) throw new Error(`Option ${name} does not take a value`);
      if (name === '--dry-run') options.dryRun = true;
      else options.yes = true;
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

function supplied(args, name) {
  return args.some((value) => value === name || value.startsWith(`${name}=`));
}

function cancelled(prompts) {
  prompts.cancel('No project files were changed.');
  return 0;
}

async function chooseProject(cwd, prompts) {
  const answer = await prompts.text({
    message: 'Project directory',
    initialValue: cwd,
    validate: async (value) => {
      try { await resolveProject(value || '.', cwd); return undefined; }
      catch (error) { return error.message; }
    },
  });
  return answer;
}

function previewLines(paths) {
  return paths.map(({ action, path: relative }) => `${action}: ${relative}`).join('\n');
}

export async function runCli(
  args,
  { cwd = process.cwd(), stdin = process.stdin, stdout = process.stdout,
    stderr = process.stderr, prompts = clack } = {},
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
    const interactive = Boolean(stdin.isTTY && stdout.isTTY && !options.yes && !options.dryRun);
    if (interactive) {
      prompts.intro(`STANDARDS ${options.command}`);
      if (!supplied(args, '--project')) {
        const project = await chooseProject(cwd, prompts);
        if (prompts.isCancel(project)) return cancelled(prompts);
        options.project = project;
      }
    }
    const projectRoot = await resolveProject(options.project, cwd);
    if (options.command === 'uninstall') {
      let expectedPlan = null;
      if (interactive) {
        expectedPlan = await uninstallProject({ projectRoot, dryRun: true });
        if (expectedPlan.paths.length > 0) {
          prompts.note(`Project: ${projectRoot}\nClients: ${expectedPlan.clients.join(', ')}\n\n${previewLines(expectedPlan.paths)}${expectedPlan.warnings.length ? `\n\nWarnings:\n${expectedPlan.warnings.join('\n')}` : ''}\n\nThis deletes all .standards/ workflow state, context, and cycle-ID history.`,
            'Uninstall preview');
          const approved = await prompts.confirm({
            message: 'Remove all STANDARDS files shown above?', initialValue: false,
          });
          if (prompts.isCancel(approved) || !approved) return cancelled(prompts);
        }
      }
      const result = await uninstallProject({ projectRoot, dryRun: options.dryRun, expectedPlan });
      if (result.paths.length === 0) {
        stdout.write(`No STANDARDS installation found in ${projectRoot}\n`);
        if (interactive) prompts.outro('Nothing to remove.');
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
      if (interactive) prompts.outro('Uninstall complete.');
      return 0;
    }
    let expectedPlan = null;
    if (interactive) {
      const target = await inspectInstallTarget(projectRoot);
      if (!supplied(args, '--mode')) {
        if (target.installed) {
          prompts.note(`This project keeps its installed ${target.mode.toLowerCase()} mode.`, 'Project mode');
        } else {
          const mode = await prompts.select({
            message: 'Project mode',
            initialValue: target.mode,
            options: [
              { value: 'GREENFIELD', label: 'Greenfield', hint: 'New project without implementation' },
              { value: 'BROWNFIELD', label: 'Brownfield', hint: 'Existing project work to preserve' },
            ],
          });
          if (prompts.isCancel(mode)) return cancelled(prompts);
          options.mode = mode;
        }
      }
      if (!supplied(args, '--client')) {
        const clients = await prompts.multiselect({
          message: 'Coding agents to install',
          options: [
            { value: 'codex', label: 'Codex' },
            { value: 'claude', label: 'Claude Code' },
          ],
          initialValues: ['codex', 'claude'],
          required: true,
        });
        if (prompts.isCancel(clients)) return cancelled(prompts);
        options.clients = clients;
      }
      expectedPlan = await planInstallProject({
        projectRoot, clients: options.clients, mode: options.mode,
      });
      prompts.note(`Project: ${projectRoot}\nVersion: ${expectedPlan.version}\nMode: ${expectedPlan.mode}\nClients: ${expectedPlan.clients.join(', ')}\nChanges: ${expectedPlan.paths.length}${expectedPlan.paths.length ? `\n\n${previewLines(expectedPlan.paths)}` : ''}${expectedPlan.warnings.length ? `\n\nWarnings:\n${expectedPlan.warnings.join('\n')}` : ''}`,
        'Install preview');
      if (expectedPlan.paths.length > 0) {
        const approved = await prompts.confirm({
          message: 'Apply these changes?', initialValue: true,
        });
        if (prompts.isCancel(approved) || !approved) return cancelled(prompts);
      }
    }
    const result = await installProject({ projectRoot, clients: options.clients, mode: options.mode,
      expectedPlan });
    stdout.write(`${result.action} STANDARDS ${result.version} in ${projectRoot}\n`);
    stdout.write(`Mode: ${result.mode}; clients: ${result.clients.join(', ')}; changed paths: ${result.changed}\n`);
    for (const warning of result.warnings) stdout.write(`Warning: ${warning}\n`);
    if (interactive) prompts.outro('Install complete.');
    return 0;
  } catch (error) {
    stderr.write(`Error: ${error.message}\n`);
    return 1;
  }
}
