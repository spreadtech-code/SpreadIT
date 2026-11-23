// The banking partner that holds each user's SpreadIT account (PRD A5, A7).
// Not chosen yet (OQ-1): "Demo Partner Bank" until it is (founder decision, 23 Nov 2026).
export const partner = {
  name: 'Demo Partner Bank',
  /** Support contact shown after 3 failed identity checks in 24 hours (A6). */
  supportContact: 'help@spreadit.example · 0700 000 0000',
} as const;
