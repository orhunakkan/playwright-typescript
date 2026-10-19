// npm run stlc:gate -- <feature> <phase>
// May STLC phase <phase> start? Exit 0 = open, 1 = closed (with reasons), 2 = usage error.
// A gate opens only when every earlier artifact is approved/complete AND stlc:lint is clean.
import { join } from 'node:path';
import { readFeature, type Phase } from './artifacts.ts';
import { lintFeature, STLC_ROOT } from './lint.ts';

/** STLC phases (SPEC.md) and the artifacts that must be approved or complete before each starts. */
export const PHASES: Record<number, { name: string; needs: Phase[] }> = {
  1: { name: 'analyze', needs: [] },
  2: { name: 'plan', needs: ['requirements'] },
  3: { name: 'design', needs: ['requirements', 'test-plan'] },
  4: { name: 'env', needs: ['requirements', 'test-plan', 'test-cases'] },
  5: { name: 'build', needs: ['requirements', 'test-plan', 'test-cases'] },
  6: { name: 'run', needs: ['requirements', 'test-plan', 'test-cases'] },
  7: { name: 'triage', needs: ['requirements', 'test-plan', 'test-cases'] },
  8: { name: 'report', needs: ['requirements', 'test-plan', 'test-cases', 'execution'] },
};

export function resolvePhase(arg: string): number | undefined {
  const n = Number(arg);
  if (PHASES[n]) return n;
  const byName = Object.entries(PHASES).find(([, p]) => p.name === arg);
  return byName ? Number(byName[0]) : undefined;
}

export function checkGate(root: string, feature: string, phase: number): string[] {
  const gate = PHASES[phase];
  if (!gate) return [`unknown phase ${phase}`];
  const reasons: string[] = [];
  const { docs } = readFeature(root, feature);
  for (const needed of gate.needs) {
    const doc = docs[needed];
    const status = doc?.meta['status'];
    if (!doc) reasons.push(`${needed} artifact is missing`);
    else if (status !== 'approved' && status !== 'complete') reasons.push(`${needed} is "${status}"; it must be approved or complete`);
  }
  if (phase === 7 && !docs.execution) reasons.push('execution artifact is missing; run phase 6 (stlc:run-summary) first');
  const issues = lintFeature(root, feature);
  if (issues.length) reasons.push(`stlc:lint reports ${issues.length} issue(s); run npm run stlc:lint -- ${feature}`);
  return reasons;
}

if (import.meta.main) {
  const [feature, phaseArg] = process.argv.slice(2);
  const phase = phaseArg ? resolvePhase(phaseArg) : undefined;
  if (!feature || phase === undefined) {
    const names = Object.entries(PHASES).map(([n, p]) => `${n}|${p.name}`);
    console.error(`usage: npm run stlc:gate -- <feature> <phase>   phases: ${names.join(', ')}`);
    process.exit(2);
  }
  const reasons = checkGate(STLC_ROOT, feature, phase);
  const label = `phase ${phase} (${PHASES[phase]?.name}) for ${feature}`;
  if (reasons.length) {
    console.log(`CLOSED: ${label}`);
    for (const r of reasons) console.log(`  - ${r}`);
  } else {
    console.log(`OPEN: ${label}`);
  }
  console.log(`  (${join('stlc', feature)})`);
  process.exitCode = reasons.length ? 1 : 0;
}
