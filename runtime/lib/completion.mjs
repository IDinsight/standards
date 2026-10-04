// Mechanical completion requirements. These describe required gates, not
// execution order: project mode still determines the standard entry route,
// and recovery can visit owners outside the normal completion boundary.
import { COMPLETION_POLICIES } from './core.mjs';

const STANDARD_UPSTREAM = ['SCOPING', 'ARCHITECTING', 'AUDITING', 'DEVELOPING',
  'TESTING', 'REVIEWING_IMPLEMENTATION'];
export const FULL_DELIVERABLE_PHASES = ['DOCUMENTING', 'REVIEWING_FINAL', 'SYNCHRONIZING'];

// null means an invalid mode/policy combination; there is no inferred default.
// UNSET has no active gates and may retain a finished cycle's policy.
export function requiredCompletionPhases(cycleMode, policy) {
  if (!COMPLETION_POLICIES.includes(policy)) return null;
  if (cycleMode === 'UNSET') return [];
  if (cycleMode === 'EXPEDITED') return policy === 'NONE'
    ? ['DEVELOPING', 'REVIEWING_IMPLEMENTATION'] : null;
  if (cycleMode !== 'STANDARD' || policy === 'NONE') return null;
  return policy === 'FULL_DELIVERABLE'
    ? [...STANDARD_UPSTREAM, ...FULL_DELIVERABLE_PHASES] : [...STANDARD_UPSTREAM];
}

// Only these state-changing policy choices use COMPLETION_CHANGE. A same-state
// choice preserves its previous handoff, including an incremental checkpoint.
export function completionChangeRoute(from, to) {
  if (from === 'DOCUMENTING' && to === 'REVIEWING_IMPLEMENTATION') {
    return { fromPolicy: 'FULL_DELIVERABLE', toPolicy: 'IMPLEMENTATION_REVIEWED' };
  }
  if (from === 'AWAITING_USER_SIGNOFF' && to === 'DOCUMENTING') {
    return { fromPolicy: 'IMPLEMENTATION_REVIEWED', toPolicy: 'FULL_DELIVERABLE' };
  }
  return null;
}
