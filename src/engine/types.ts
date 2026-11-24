// The shape of a plan and of a split. Money is whole kobo; percentages are
// basis points (1% = 100, 0.5% = 50) so no fraction ever touches money.

export type RuleId = string;

/** B5. "Spread across the month" waits for weekly batching (D14). */
export type Frequency = 'everyIncome' | 'oncePerMonth';

export interface Destination {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

/**
 * F3: a new or changed account becomes active 24 hours after the change.
 * Until then, paydays pay the previous account (or the fallback if there was none).
 */
export interface DestinationCooldown {
  destination?: Destination;
  destinationActiveFrom?: number;
  previousDestination?: Destination;
}

interface RuleBase extends DestinationCooldown {
  id: RuleId;
  name: string;
  /** Which B1 category it came from, or 'custom' (B2). */
  categoryKey?: string;
  /** B15: keep retrying a temporary failure for up to 72 hours. */
  keepTrying?: boolean;
  /** B13: skip this rule on the next payday only. */
  skipNextPayday?: boolean;
}

export interface FixedRule extends RuleBase {
  kind: 'fixed';
  amountKobo: number;
  frequency: Frequency;
}

export interface PercentRule extends RuleBase {
  kind: 'percent';
  /** Share of gross income (B4). 1000 = 10%. */
  basisPoints: number;
}

export type Rule = FixedRule | PercentRule;

export interface Plan {
  /** In the user's priority order: index 0 is priority 1 (B6). */
  rules: Rule[];
  /** Where leftover money goes (B8). null = not chosen yet. */
  remainder: ({ name: string } & DestinationCooldown) | null;
}

export type Funding = 'Fully funded' | 'Partly funded' | 'Skipped';
export type SkipReason = 'Already paid this month' | 'Skipped by you' | 'Not enough money';

export interface RuleLine {
  ruleId: RuleId;
  name: string;
  priority: number;
  /** What the rule asks for this time. */
  targetKobo: number;
  /** What is actually sent (0 when skipped). */
  amountKobo: number;
  /** Transfer fee plus stamp duty for this line (0 when nothing is sent). */
  feeKobo: number;
  funding: Funding;
  reason?: SkipReason;
  /** How much less than the target was sent because money ran out (C3). */
  shortfallKobo: number;
}

/**
 * ready: run as normal.
 * needsApproval: income is below 50% of expected; pause until "Run in priority order" (D4).
 * tooSmall: nothing can be sent; "This payment is too small to split" (PRD 5.2).
 */
export type SplitStatus = 'ready' | 'needsApproval' | 'tooSmall';

export interface SplitResult {
  incomeKobo: number;
  expectedKobo: number;
  status: SplitStatus;
  inflowFeeKobo: number;
  lines: RuleLine[];
  /** null when the plan has no remainder destination or nothing was left to send. */
  remainder: { name: string; amountKobo: number; feeKobo: number } | null;
  /** Money that stays in the SpreadIT account because it would cost more to send than is left. */
  unsplitKobo: number;
  /** Inflow fee plus every transfer fee. */
  totalFeesKobo: number;
}
