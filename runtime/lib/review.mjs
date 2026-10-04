// Mechanical checks for Reviewer's separate early-closure assessment. Content
// identities and evidence sufficiency are assessed by Reviewer, not inferred
// from a COMPLETE label or from keywords in narrative findings.
import { fieldPairs } from './core.mjs';
import { FULL_DELIVERABLE_PHASES } from './completion.mjs';
import { recordSections } from './records.mjs';

export function checkClosureAssessment(text, { reviewKind, required, problem }) {
  const sections = recordSections(text.replace(/<!--[\s\S]*?-->/g, ''), 'Implementation-Reviewed Closure');
  if (!sections.length) {
    if (required) problem('IMPLEMENTATION_REVIEWED sign-off readiness requires an Implementation-Reviewed Closure assessment.');
    return;
  }
  if (sections.length !== 1) {
    problem('Keep exactly one current Implementation-Reviewed Closure section; retain superseded conclusions under a different heading.');
    return;
  }
  if (reviewKind !== 'IMPLEMENTATION') {
    problem('Implementation-Reviewed Closure belongs only in the implementation review report.');
    return;
  }
  const pairs = fieldPairs(sections[0]);
  const fields = {};
  for (const name of ['Policy', 'Eligibility', 'User Choice', 'User Reason', 'Assessed Inputs',
    'Evidence', 'Unmet Requirements', 'Omitted Phases', 'Omitted Guarantees']) {
    const values = pairs.filter(([key]) => key === name).map(([, value]) => value.trim());
    if (values.length !== 1 || !values[0] || values[0].includes(' | ') || /^<.*>$/.test(values[0])) {
      problem(`Implementation-Reviewed Closure requires one concrete ${name} field.`);
    } else fields[name] = values[0];
  }
  if (fields.Policy && fields.Policy !== 'IMPLEMENTATION_REVIEWED') {
    problem('The closure assessment Policy must be IMPLEMENTATION_REVIEWED; it records the assessed policy, not a later coordination choice.');
  }
  if (fields.Eligibility && !['NOT_ASSESSED', 'INELIGIBLE', 'ELIGIBLE'].includes(fields.Eligibility)) {
    problem('Closure Eligibility must be NOT_ASSESSED, INELIGIBLE, or ELIGIBLE.');
  }
  if (required && fields.Eligibility !== 'ELIGIBLE') {
    problem('IMPLEMENTATION_REVIEWED sign-off readiness requires Closure Eligibility ELIGIBLE; ordinary review completion is insufficient.');
  }
  if (fields['Omitted Phases'] !== undefined
      && fields['Omitted Phases'].split(/\s*,\s*/).sort().join(',') !== [...FULL_DELIVERABLE_PHASES].sort().join(',')) {
    problem('Closure Omitted Phases must list DOCUMENTING, REVIEWING_FINAL, and SYNCHRONIZING exactly once.');
  }
  if (fields.Eligibility === 'ELIGIBLE') {
    for (const name of ['User Choice', 'Assessed Inputs', 'Evidence', 'Omitted Guarantees']) {
      if (fields[name] === 'NONE') problem(`ELIGIBLE closure requires ${name}, not NONE.`);
    }
    if (fields['Unmet Requirements'] !== undefined && fields['Unmet Requirements'] !== 'NONE') {
      problem('ELIGIBLE closure requires Unmet Requirements NONE; record remaining work as INELIGIBLE and route it to its owner.');
    }
  }
  if (fields.Eligibility === 'INELIGIBLE' && fields['Unmet Requirements'] === 'NONE') {
    problem('INELIGIBLE closure must identify the unmet requirements and their owners.');
  }
}
