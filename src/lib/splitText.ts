// Words for a split's lines, shared by the simulator (S10) and the short payday review (S17).
import { formatNaira } from '../engine/format';
import type { Rule, RuleLine } from '../engine/types';
import { percentText } from '../engine/validate';

/** B4: "10% of ₦500,000 = ₦50,000" for percentage rules; "Fixed" otherwise. */
export function ruleTypeText(rule: Rule | undefined, incomeKobo: number, line: RuleLine): string {
  if (rule?.kind === 'percent') {
    return `${percentText(rule.basisPoints)} of ${formatNaira(incomeKobo)} = ${formatNaira(line.targetKobo)}`;
  }
  return rule?.kind === 'fixed' && rule.frequency === 'oncePerMonth' ? 'Fixed, once a month' : 'Fixed';
}

/** C3: the shortfall in naira, or why a rule was skipped. */
export function lineNote(line: RuleLine): string | undefined {
  if (line.funding === 'Fully funded') return undefined;
  if (line.amountKobo === 0 && line.targetKobo > 0) return `Needed ${formatNaira(line.targetKobo)}`;
  if (line.shortfallKobo > 0) return `${formatNaira(line.shortfallKobo)} short of ${formatNaira(line.targetKobo)}`;
  return line.reason;
}

/** "10:42am" */
export function timeText(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h % 12 === 0 ? 12 : h % 12}:${m}${h < 12 ? 'am' : 'pm'}`;
}
