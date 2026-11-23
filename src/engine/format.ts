// Display helpers for money and account numbers. Pure functions, no UI.
// Money is always whole kobo integers (CLAUDE.md rule 3); these only format it.

function assertKobo(kobo: number): void {
  if (!Number.isSafeInteger(kobo)) {
    throw new Error(`Money must be a whole number of kobo, got ${kobo}`);
  }
}

/** 1234567 -> "1,234,567". Whole non-negative numbers only. */
export function groupThousands(whole: number): string {
  const digits = String(whole);
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ',';
    out += digits[i];
  }
  return out;
}

/**
 * Splits kobo into the naira part ("₦850,000") and the two kobo digits ("00").
 * Used by the hero, which always shows kobo small on the baseline.
 */
export function nairaParts(kobo: number): { sign: '' | '-'; naira: string; kobo: string } {
  assertKobo(kobo);
  const abs = Math.abs(kobo);
  return {
    sign: kobo < 0 ? '-' : '',
    naira: `₦${groupThousands(Math.floor(abs / 100))}`,
    kobo: String(abs % 100).padStart(2, '0'),
  };
}

/**
 * "₦1,234,567", with ".50" only when there are kobo (CLAUDE.md rule 4).
 * Pass `plus: true` for money in ("+₦85,000").
 */
export function formatNaira(kobo: number, opts: { plus?: boolean } = {}): string {
  const p = nairaParts(kobo);
  const sign = p.sign || (opts.plus && kobo > 0 ? '+' : '');
  return `${sign}${p.naira}${p.kobo === '00' ? '' : `.${p.kobo}`}`;
}

/** "0123454821" -> "••4821". Only the last 4 digits are ever shown. */
export function maskAccount(accountNumber: string): string {
  const digits = accountNumber.replace(/\D/g, '');
  return `••${digits.slice(-4)}`;
}
