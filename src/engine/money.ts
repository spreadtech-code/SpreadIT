// Whole-kobo arithmetic. Money never touches a fraction (CLAUDE.md rule 3).

export function assertKobo(value: number, what = 'Amount'): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${what} must be a whole, non-negative number of kobo, got ${value}`);
  }
}

function product(amountKobo: number, basisPoints: number): number {
  const p = amountKobo * basisPoints;
  if (!Number.isSafeInteger(p)) throw new Error('Amount too large to calculate exactly');
  return p;
}

/** a × basisPoints ÷ 10,000, rounded down. 1 basis point = 0.01%. */
export function shareDown(amountKobo: number, basisPoints: number): number {
  return Math.floor(product(amountKobo, basisPoints) / 10_000);
}

/** a × basisPoints ÷ 10,000, rounded up. Used for fees, so a fee is never shown too low. */
export function shareUp(amountKobo: number, basisPoints: number): number {
  return Math.ceil(product(amountKobo, basisPoints) / 10_000);
}
