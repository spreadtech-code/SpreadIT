// What SpreadIT itself charges (PRD I1, I2). Stored as data so the price
// chosen after the pilot (OQ-16) can replace it without touching the engine.

export interface Pricing {
  name: string;
  /** Monthly subscription, in kobo. */
  subscriptionKoboPerMonth: number;
}

/** I1: all features are free for pilot users. */
export const pilotPricing: Pricing = {
  name: 'Free during the pilot',
  subscriptionKoboPerMonth: 0,
};

/** The pricing in force. */
export const pricing: Pricing = pilotPricing;
