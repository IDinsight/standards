import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import * as clack from '@clack/prompts';

import { installProject } from './install.js';
import { inspectInstallTarget, planInstallProject } from './installer.js';
import { resetProject } from './reset.js';
import { uninstallProject } from './uninstaller.js';

const MODE_OPTIONS = [
  { value: 'GREENFIELD', label: 'Greenfield', hint: 'New project without implementation' },
  { value: 'BROWNFIELD', label: 'Brownfield', hint: 'Existing project work to preserve' },
];

// Options each command accepts.
const COMMAND_OPTIONS = {
  install: ['--project', '--client', '--mode', '--hooks', '--no-hooks', '--yes'],
  reset: ['--project', '--mode', '--dry-run', '--yes'],
  uninstall: ['--project', '--dry-run', '--yes'],
};

const CLIENTS = new Map([
  ['codex', 'codex'],
  ['claude', 'claude'],
  ['claude-code', 'claude'],
]);

const HELP = `Usage:
  standards install [--project <path>] [--client codex|claude] [--mode greenfield|brownfield] [--hooks|--no-hooks] [--yes]
  standards reset [--project <path>] [--mode greenfield|brownfield] [--dry-run] [--yes]
  standards uninstall [--project <path>] [--dry-run] [--yes]
  standards --version
  standards --help

Commands target the current directory unless --project is given.
A first install sets up Codex and Claude Code with hooks unless options say
otherwise; a reinstall keeps the clients and hook choice already installed.
Reset starts the workflow over: it deletes the saved workflow state, Auditor
context, and every cycle record, and keeps everything else installed.
Uninstall removes all project-local STANDARDS clients, saved workflow history,
every cycle record, and user styles.
In a terminal, commands guide you through a preview and confirmation.
Use --yes to skip prompts; piped and automated runs also use the defaults.
`;

const INSTALL_HELP = `Usage:
  standards install [--project <path>] [--client codex|claude] [--mode greenfield|brownfield] [--hooks|--no-hooks] [--yes]

--project <path>  Existing project directory (default: current directory)
--client <name>   Add codex or claude (default: both on a first install,
                  the installed clients on a reinstall)
--mode <mode>     greenfield or brownfield (default: infer on first install)
--hooks           Install the STANDARDS hooks (default on a first install)
--no-hooks        Leave the hooks out, or remove them on a reinstall
--yes             Skip interactive questions and confirmation

The hooks check the workflow files when an agent finishes a turn and send it
back once with any problems. Codex runs them only after you trust them with
/hooks.
`;

const RESET_HELP = `Usage:
  standards reset [--project <path>] [--mode greenfield|brownfield] [--dry-run] [--yes]

--project <path>  Existing project directory (default: current directory)
--mode <mode>     greenfield or brownfield (default: infer from the project)
--dry-run         Preview the reset without changing any files
--yes             Skip interactive questions and confirmation

Deletes .standards/STATE.md, the Auditor's .standards/CONTEXT.md, and every
cycle record in .standards/docs/, then writes a fresh STATE.md and MODE.md, as a
first install would. The protocol, runtime tools, skills, hooks, client
settings, and user styles in .standards/user-styles/ stay as they are. The CLI
must be the installed version.
`;

const UNINSTALL_HELP = `Usage:
  standards uninstall [--project <path>] [--dry-run] [--yes]

--project <path>  Existing project directory (default: current directory)
--dry-run         Preview removals and edits without changing any files
--yes             Skip interactive questions and confirmation

Removes the entire .standards/ runtime, including saved workflow state, context,
user styles, and every cycle record in .standards/docs/ (scopes, designs, plans,
verification, reviews, documentation, and synchronization records), plus all
verified STANDARDS skills for Codex and Claude.
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
  if (!Object.hasOwn(COMMAND_OPTIONS, args[0])) {
    throw new Error(`Unknown command or option: ${args[0]}`);
  }

  const options = {
    install: { command: 'install', project: '.', clients: null, mode: null, hooks: null },
    reset: { command: 'reset', project: '.', mode: null, dryRun: false },
    uninstall: { command: 'uninstall', project: '.', dryRun: false },
  }[args[0]];
  const allowedOptions = COMMAND_OPTIONS[options.command];
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

    if (['--dry-run', '--yes', '--hooks', '--no-hooks'].includes(name)) {
      if (equals !== -1) throw new Error(`Option ${name} does not take a value`);
      if (name === '--dry-run') options.dryRun = true;
      else if (name === '--yes') options.yes = true;
      else if (options.hooks !== null) throw new Error('Choose either --hooks or --no-hooks');
      else options.hooks = name === '--hooks';
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
      throw new Error(`Project directory does not exist: ${target}`, { cause: error });
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

// Extra preview sections: settings being put back, warnings, and follow-up steps.
function planDetails(plan) {
  return [
    plan.restored?.length ? `\n\nRestores (changed or removed since install):\n${plan.restored.join('\n')}` : '',
    plan.warnings.length ? `\n\nWarnings:\n${plan.warnings.join('\n')}` : '',
    plan.notices?.length ? `\n\nNext:\n${plan.notices.join('\n')}` : '',
  ].join('');
}

async function runReset({ args, options, projectRoot, interactive, stdout, prompts }) {
  let expectedPlan = null;
  if (interactive) {
    if (!supplied(args, '--mode')) {
      const inferred = (await resetProject({ projectRoot, dryRun: true })).mode;
      const mode = await prompts.select({ message: 'Project mode after the reset', initialValue: inferred, options: MODE_OPTIONS });
      if (prompts.isCancel(mode)) return cancelled(prompts);
      options.mode = mode;
    }
    expectedPlan = await resetProject({ projectRoot, mode: options.mode, dryRun: true });
    if (expectedPlan.paths.length > 0) {
      prompts.note(`Project: ${projectRoot}\nMode: ${expectedPlan.mode}\n\n${previewLines(expectedPlan.paths)}${expectedPlan.warnings.length ? `\n\nWarnings:\n${expectedPlan.warnings.join('\n')}` : ''}\n\nThis deletes the saved workflow state, Auditor context, and cycle records. Skills, hooks, settings, and user styles stay.`,
        'Reset preview');
      const approved = await prompts.confirm({ message: 'Reset the STANDARDS workflow as shown above?', initialValue: false });
      if (prompts.isCancel(approved) || !approved) return cancelled(prompts);
    }
  }
  const result = await resetProject({ projectRoot, mode: options.mode, dryRun: options.dryRun, expectedPlan });
  if (result.paths.length === 0) {
    stdout.write(`STANDARDS in ${projectRoot} is already a fresh ${result.mode.toLowerCase()} workflow; nothing to reset\n`);
    if (interactive) prompts.outro('Nothing to reset.');
    return 0;
  }
  stdout.write(`${options.dryRun ? 'Would reset' : 'Reset'} STANDARDS in ${projectRoot}\n`);
  stdout.write(`Mode: ${result.mode}; ${options.dryRun ? 'planned' : 'changed'} paths: ${result.paths.length}\n`);
  for (const entry of result.paths) {
    const [planned, done] = entry.action === 'remove' ? ['Remove', 'Removed'] : ['Write', 'Wrote'];
    stdout.write(`${options.dryRun ? planned : done}: ${entry.path}\n`);
  }
  stdout.write(options.dryRun
    ? 'Preview only; no files changed.\n'
    : 'The workflow starts fresh. Skills, hooks, client settings, and user styles were kept.\n');
  for (const warning of result.warnings) stdout.write(`Warning: ${warning}\n`);
  if (interactive) prompts.outro('Reset complete.');
  return 0;
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

  const help = { help: HELP, 'install-help': INSTALL_HELP, 'reset-help': RESET_HELP, 'uninstall-help': UNINSTALL_HELP };
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
          prompts.note(`Project: ${projectRoot}\nClients: ${expectedPlan.clients.join(', ')}\n\n${previewLines(expectedPlan.paths)}${expectedPlan.warnings.length ? `\n\nWarnings:\n${expectedPlan.warnings.join('\n')}` : ''}\n\nThis deletes all .standards/ workflow state, context, cycle records, and user styles.`,
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
        ? 'Preview only; no files changed. Removing .standards/ deletes saved workflow state, context, cycle records, and user styles.\n'
        : 'Removed saved workflow state, context, cycle records, and user styles with .standards/. Project work outside it was preserved.\n');
      for (const warning of result.warnings) stdout.write(`Warning: ${warning}\n`);
      if (interactive) prompts.outro('Uninstall complete.');
      return 0;
    }
    if (options.command === 'reset') return await runReset({ args, options, projectRoot, interactive, stdout, prompts });
    let expectedPlan = null;
    if (interactive) {
      const target = await inspectInstallTarget(projectRoot);
      if (!supplied(args, '--mode')) {
        if (target.installed) {
          prompts.note(`This project keeps its installed ${target.mode.toLowerCase()} mode.`, 'Project mode');
        } else {
          const mode = await prompts.select({ message: 'Project mode', initialValue: target.mode, options: MODE_OPTIONS });
          if (prompts.isCancel(mode)) return cancelled(prompts);
          options.mode = mode;
        }
      }
      if (!supplied(args, '--client')) {
        const clients = await prompts.multiselect({
          message: target.installed ? 'Coding agents to install (installed ones stay installed)' : 'Coding agents to install',
          options: [
            { value: 'codex', label: 'Codex' },
            { value: 'claude', label: 'Claude Code' },
          ],
          initialValues: target.installed ? target.clients : ['codex', 'claude'],
          required: true,
        });
        if (prompts.isCancel(clients)) return cancelled(prompts);
        options.clients = clients;
      }
      if (!supplied(args, '--hooks') && !supplied(args, '--no-hooks')) {
        const hooks = await prompts.confirm({
          message: 'Install the STANDARDS hooks? They check the workflow files when an agent finishes a turn '
            + 'and send it back once with any problems.',
          initialValue: target.hooks,
        });
        if (prompts.isCancel(hooks)) return cancelled(prompts);
        options.hooks = hooks;
      }
      expectedPlan = await planInstallProject({
        projectRoot, clients: options.clients, mode: options.mode, hooks: options.hooks,
      });
      prompts.note(`Project: ${projectRoot}\nVersion: ${expectedPlan.version}\nMode: ${expectedPlan.mode}\nClients: ${expectedPlan.clients.join(', ')}\nHooks: ${expectedPlan.hooks ? 'on' : 'off'}\nChanges: ${expectedPlan.paths.length}${expectedPlan.paths.length ? `\n\n${previewLines(expectedPlan.paths)}` : ''}${planDetails(expectedPlan)}`,
        'Install preview');
      if (expectedPlan.paths.length > 0) {
        const approved = await prompts.confirm({
          message: 'Apply these changes?', initialValue: true,
        });
        if (prompts.isCancel(approved) || !approved) return cancelled(prompts);
      }
    }
    const result = await installProject({ projectRoot, clients: options.clients, mode: options.mode,
      hooks: options.hooks, expectedPlan });
    stdout.write(`${result.action} STANDARDS ${result.version} in ${projectRoot}\n`);
    stdout.write(`Mode: ${result.mode}; clients: ${result.clients.join(', ')}; hooks: ${result.hooks ? 'on' : 'off'}; changed paths: ${result.changed ? result.paths.length : 0}\n`);
    for (const item of result.restored) stdout.write(`Restored: ${item}\n`);
    for (const warning of result.warnings) stdout.write(`Warning: ${warning}\n`);
    for (const notice of result.notices) stdout.write(`Next: ${notice}\n`);
    stdout.write(`Global CLI: If you use a globally installed standards command, run standards --version in your terminal and check that it matches this project's version (${result.version}).\n`);
    stdout.write(`If it differs or the command is unavailable, use npx @idinsight/standards@${result.version} <command> (for example, reset). Different projects may need different versions.\n`);
    if (interactive) prompts.outro('Install complete.');
    return 0;
  } catch (error) {
    stderr.write(`Error: ${error.message}\n`);
    return 1;
  }
}
