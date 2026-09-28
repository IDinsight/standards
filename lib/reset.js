import path from 'node:path';

import {
  applyOperations, assertNoInterruptedTransaction, countMarkdownFiles, inspectPath, readProjectFile,
  verifyNormalDirectory,
} from './install-files.js';
import { inferMode, loadAssets, sourceText, validateVersion } from './installer.js';
import { MARKER } from './ownership.js';
import { MODES } from '../runtime/lib/core.mjs';

// Workflow data a reset deletes. The rest of `.standards/` (protocol, tools,
// version, installation record, and user styles) stays, and so do the skills,
// hooks, client settings, and managed blocks outside it.
const WORKFLOW_DATA = ['.standards/docs', '.standards/CONTEXT.md'];

// Return an installed project to the workflow state of a fresh install: no
// cycle, no Auditor context, no cycle records, and the project mode chosen
// again from the project's current contents unless `mode` is given.
export async function resetProject({ projectRoot, mode = null, dryRun = false, expectedPlan = null }) {
  if (mode !== null && !MODES.has(mode)) throw new Error(`Unsupported mode: ${mode}`);
  await assertNoInterruptedTransaction(projectRoot);
  const runtime = await inspectPath(projectRoot, '.standards');
  if (!runtime) {
    throw new Error(`No STANDARDS installation found in ${projectRoot}; run reset from the project's root folder `
      + 'or pass --project <path>');
  }
  if (!runtime.isDirectory()) throw new Error('Path collision: .standards is not a directory');
  const protocol = await readProjectFile(projectRoot, '.standards/PROTOCOL.md');
  if (!protocol?.includes(MARKER)) throw new Error('Path collision: .standards is not framework-owned');
  const versionText = await readProjectFile(projectRoot, '.standards/VERSION.json');
  if (versionText === null) {
    throw new Error('Incomplete runtime: missing .standards/VERSION.json; restore it, for example from version control');
  }
  const installed = validateVersion(versionText);
  const { version } = await loadAssets();
  // The fresh STATE.md and MODE.md come from this CLI's templates, so the CLI
  // must be the installed version.
  if (installed !== version) {
    throw new Error(`STANDARDS ${installed} is installed, but this CLI is ${version}. Reset with the matching CLI `
      + `(npx @idinsight/standards@${installed} reset), or run standards install with this CLI to upgrade first`);
  }

  const projectMode = mode ?? await inferMode(projectRoot);
  const operations = [];
  const warnings = [];
  for (const relative of WORKFLOW_DATA) {
    const entry = await inspectPath(projectRoot, relative);
    if (!entry) continue;
    if (entry.isDirectory()) await verifyNormalDirectory(path.join(projectRoot, relative));
    operations.push({ kind: 'remove', relative });
  }
  const records = await countMarkdownFiles(projectRoot, '.standards/docs');
  if (records > 0) {
    warnings.push(`Deletes ${records} cycle record${records === 1 ? '' : 's'} in .standards/docs/ (scope, design, `
      + 'development, verification, review, documentation, and synchronization records).');
  }
  for (const name of ['MODE.md', 'STATE.md']) {
    const relative = `.standards/${name}`;
    const contents = await sourceText(`templates/${projectMode.toLowerCase()}/${relative}`);
    if (await readProjectFile(projectRoot, relative) !== contents) {
      operations.push({ kind: 'file', relative, contents });
    }
  }

  const paths = operations.map(({ kind, relative }) => ({ action: kind === 'remove' ? 'remove' : 'write', path: relative }));
  if (expectedPlan && (JSON.stringify(operations) !== JSON.stringify(expectedPlan.operations)
      || JSON.stringify(warnings) !== JSON.stringify(expectedPlan.warnings))) {
    throw new Error('Project changed after the reset preview; review the new plan and try again');
  }
  const changed = dryRun ? 0 : await applyOperations(projectRoot, operations, { scratchPrefix: '.standards-reset-' });
  return { mode: projectMode, version, paths, warnings, changed, operations };
}
