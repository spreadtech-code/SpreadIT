// A10 Salary-switch kit: the letter asking HR to pay the salary into the
// SpreadIT account. Shared as text for now (founder decision, 24 Nov 2026: PDF later).
import type { SpreaditAccount } from '../fakebank/identity';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "25 December 2026" */
export const longDate = (d: Date): string => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export function hrLetter(input: { fullName: string; account: SpreaditAccount; effectiveFrom: Date; today: Date }): string {
  const { fullName, account } = input;
  return [
    longDate(input.today),
    '',
    'To: Human Resources / Payroll',
    '',
    'Change of salary account',
    '',
    `Please pay my salary into the account below, starting from ${longDate(input.effectiveFrom)}.`,
    '',
    `Full name: ${fullName}`,
    `Account name: ${account.accountName}`,
    `Account number: ${account.accountNumber}`,
    `Bank: ${account.bankName}`,
    '',
    'The account is in my own name.',
    '',
    'Yours faithfully,',
    '',
    '',
    fullName,
  ].join('\n');
}
