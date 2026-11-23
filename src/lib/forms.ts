// Checks for sign-up and sign-in fields (A1, A2). Pure functions.

/** "+234 803 123 4567" or "0803-123-4567" -> "08031234567". */
export function normalisePhone(input: string): string {
  const digits = input.replace(/[^\d+]/g, '');
  if (digits.startsWith('+234')) return `0${digits.slice(4)}`;
  if (digits.startsWith('234') && digits.length === 13) return `0${digits.slice(3)}`;
  return digits;
}

/** Nigerian mobile number: 11 digits starting 070, 080, 081, 090 or 091. */
export function isNigerianPhone(input: string): boolean {
  return /^0[789][01]\d{8}$/.test(normalisePhone(input));
}

export function isEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.trim());
}

export const PASSWORD_MIN = 8;

/** null when the password is fine, otherwise what is wrong. */
export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  return null;
}

/** Day, month and year as typed -> "YYYY-MM-DD", or null if it is not a real date. */
export function parseDateOfBirth(day: string, month: string, year: string, today: Date): string | null {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year)) return null;
  if (y < 1900 || m < 1 || m > 12 || d < 1) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCDate() !== d) return null; // e.g. 30 February
  const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  if (iso > isoDate(today)) return null; // in the future
  return iso;
}

/** Whole years between a "YYYY-MM-DD" birthday and today. */
export function ageOn(dateOfBirth: string, today: Date): number {
  const [y, m, d] = dateOfBirth.split('-').map(Number);
  const [ty, tm, td] = isoDate(today).split('-').map(Number);
  let age = ty - y;
  if (tm < m || (tm === m && td < d)) age -= 1;
  return age;
}

/** A2: only users aged 18 or over can sign up. */
export const UNDER_18_MESSAGE = 'You must be 18 or over to use SpreadIT';

function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
