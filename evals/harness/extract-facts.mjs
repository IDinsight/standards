#!/usr/bin/env node
// Pull explicit, machine-checkable workflow facts out of a case prompt with
// regular expressions (no model). validate-fixture.mjs compares these facts with
// the fixture's STATE.md, MODE.md, and records, so a fixture that contradicts
// its prompt on any stated fact fails before a model ever runs.
//
//   node extract-facts.mjs                # coverage report over all cases
//   node extract-facts.mjs developer-1    # facts for one case
import { findCase, loadAll } from './lib/cases.mjs';

const STATES = 'SCOPING|ARCHITECTING|AUDITING|DEVELOPING|TESTING|REVIEWING_IMPLEMENTATION|DOCUMENTING|REVIEWING_FINAL|SYNCHRONIZING|AWAITING_USER_SIGNOFF|SIGNED_OFF|CANCELLED';

// Each pattern accepts the prose forms the cases use: "X is Y", "X=Y", "X: Y".
const SCALARS = {
  ProjectMode: /ProjectMode\s*(?:is|=|:)\s*`?(GREENFIELD|BROWNFIELD)\b/,
  CycleMode: /(?<!Pending)CycleMode\s*(?:is|=|:)\s*`?(STANDARD|EXPEDITED|UNSET)\b/,
  PendingCycleMode: /PendingCycleMode\s*(?:is|=|:)\s*`?(STANDARD|EXPEDITED|UNSET)\b/,
  WorkflowState: new RegExp(`WorkflowState\\s*(?:is|=|:)\\s*\`?(${STATES})\\b`),
  'ActiveWork.Id': /Active Work\.Id\s*(?:is|=|:)\s*['`"]?([A-Za-z0-9][A-Za-z0-9._-]*[A-Za-z0-9])/,
  'ActiveWork.Development': /Active Work\.Development\s*(?:is|=|:)\s*`?(NONE)\b/,
  'ActiveWork.BlockedOn': /Active Work\.BlockedOn\s*(?:is|=|:)\s*`?(NONE)\b/,
  // "Recovery is inactive unless specified" is a default the prompt may then
  // override by describing a frame; see extractFacts.
  'Recovery.Active': /\brecovery (?:is )?(inactive|active)\b(\s+unless\b)?/i,
};

// Identifiers a fixture must define when the prompt names them.
const ID_LISTS = {
  AC: /\bAC-\d{3}\b/g,
  DEV: /\bDEV-\d{3}\b/g,
  F: /\bF-\d{3}\b/g,
  D: /\bD-\d{3}\b/g,
  DOC: /\bDOC-\d{3}\b/g,
};

// Record statuses stated next to an identifier, e.g. "DEV-001 is PENDING".
const ID_STATUS = /\b((?:DEV|F|D|DOC)-\d{3})\b[^.;,]{0,40}?\b(PENDING|IN_PROGRESS|DONE|BLOCKED|OPEN|RESOLVED|CLOSED|ACCEPTED)\b/g;

// Git working-tree conditions a fixture must reproduce.
const GIT = {
  // Not "a staged rollout" or "staged compatibility behavior".
  // Not "a staged rollout", "staged compatibility behavior", or "staged and
  // working-tree diffs are empty" (which says nothing is staged).
  staged: /\bstaged\b(?!\s+(?:rollout|roll-out|compatib\w*|migration|release|deploy\w*|behaviou?r|plan|upgrade)|[^.;]{0,40}\bdiffs? (?:is|are) empty)/i,
  unstaged: /\bunstaged\b/i,
  untracked: /\buntracked\b/i,
  // A deleted file, not "a deleted CLI option" or field.
  deleted: /\bdeleted\b(?!\s+(?:\w+\s+)?(?:option|flag|field|parameter|argument|function|method|endpoint|column|key|setting|section|line|entry|step|value|variable|command)s?\b)/i,
  cleanDiff: /git diff is empty|working tree is clean|all work is committed/i,
  conflict: /merge conflict|conflict markers|unmerged/i,
  branch: /\bbranch\b/i,
};

export function extractFacts(prompt) {
  const facts = { scalars: {}, ids: {}, idStatus: {}, git: [] };
  for (const [name, re] of Object.entries(SCALARS)) {
    const m = prompt.match(re);
    if (!m) continue;
    if (name === 'Recovery.Active') {
      // A default ("inactive unless specified") gives way to a frame the prompt describes.
      if (m[2] && /\bOwner=|\bframe\b/i.test(prompt)) continue;
      // "No Tester assignment or recovery is active": a negation earlier in
      // the same sentence means inactive.
      const sentence = prompt.slice(0, m.index).split(/[.;!?]\s/).at(-1);
      const negated = /\b(?:no|neither|nor|not|without)\b/i.test(sentence);
      facts.scalars[name] = String(m[1].toLowerCase() === 'active' && !negated);
    } else facts.scalars[name] = m[1];
  }
  for (const [prefix, re] of Object.entries(ID_LISTS)) {
    const found = [...new Set(prompt.match(re) ?? [])].sort();
    if (found.length) facts.ids[prefix] = found;
  }
  for (const m of prompt.matchAll(ID_STATUS)) facts.idStatus[m[1]] = m[2];
  facts.git = Object.entries(GIT).filter(([, re]) => re.test(prompt)).map(([k]) => k);
  return facts;
}

const countFacts = (f) => Object.keys(f.scalars).length + Object.keys(f.ids).length
  + Object.keys(f.idStatus).length + f.git.length;

if (import.meta.url === `file://${process.argv[1]}`) {
  const key = process.argv[2];
  if (key) {
    console.log(JSON.stringify(extractFacts(findCase(key).prompt), null, 2));
  } else {
    // Coverage: how many cases state at least one checkable fact, per role.
    const byRole = {};
    for (const c of loadAll()) {
      const f = extractFacts(c.prompt);
      const r = (byRole[c.role] ??= { cases: 0, withFacts: 0, withState: 0, facts: 0 });
      r.cases += 1;
      r.facts += countFacts(f);
      if (countFacts(f)) r.withFacts += 1;
      if (f.scalars.WorkflowState) r.withState += 1;
    }
    const total = Object.values(byRole).reduce((a, r) => ({
      cases: a.cases + r.cases, withFacts: a.withFacts + r.withFacts,
      withState: a.withState + r.withState, facts: a.facts + r.facts,
    }), { cases: 0, withFacts: 0, withState: 0, facts: 0 });
    console.log('role          cases  >=1 fact  WorkflowState  facts');
    for (const [role, r] of [...Object.entries(byRole), ['TOTAL', total]]) {
      console.log(`${role.padEnd(13)} ${String(r.cases).padStart(5)} ${String(r.withFacts).padStart(9)} ${String(r.withState).padStart(14)} ${String(r.facts).padStart(6)}`);
    }
  }
}
