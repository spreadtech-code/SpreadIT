// Pure changes to a plan, used by the app store. Each returns a new plan.
import type { Destination, Plan, Rule, RuleId } from '../engine/types';

export const emptyPlan: Plan = { rules: [], remainder: null };

/** Adds a new rule at the bottom of the priority order, or replaces one with the same id. */
export function upsertRule(plan: Plan, rule: Rule): Plan {
  const i = plan.rules.findIndex((r) => r.id === rule.id);
  const rules = i === -1 ? [...plan.rules, rule] : plan.rules.map((r) => (r.id === rule.id ? rule : r));
  return { ...plan, rules };
}

export function removeRule(plan: Plan, id: RuleId): Plan {
  return { ...plan, rules: plan.rules.filter((r) => r.id !== id) };
}

/** B6: the new priority order after a drag. Ids not in the plan are ignored. */
export function setOrder(plan: Plan, ids: RuleId[]): Plan {
  const byId = new Map(plan.rules.map((r) => [r.id, r]));
  const ordered = ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
  const missing = plan.rules.filter((r) => !ids.includes(r.id));
  return { ...plan, rules: [...ordered, ...missing] };
}

/** Move one rule up (-1) or down (+1). Used by screen-reader actions. */
export function moveRule(plan: Plan, id: RuleId, delta: -1 | 1): Plan {
  const i = plan.rules.findIndex((r) => r.id === id);
  const j = i + delta;
  if (i === -1 || j < 0 || j >= plan.rules.length) return plan;
  const rules = [...plan.rules];
  [rules[i], rules[j]] = [rules[j], rules[i]];
  return { ...plan, rules };
}

export function setSkipNext(plan: Plan, id: RuleId, skip: boolean): Plan {
  return { ...plan, rules: plan.rules.map((r) => (r.id === id ? { ...r, skipNextPayday: skip } : r)) };
}

export function setRemainder(plan: Plan, name: string, destination: Destination): Plan {
  return { ...plan, remainder: { name, destination } };
}

let counter = 0;
export function newRuleId(): RuleId {
  counter += 1;
  return `rule-${Date.now().toString(36)}-${counter}`;
}
