// A9 Forward mode: how to set up a standing order at the user's current bank,
// for the 10 largest Nigerian banks.
// [ASSUMPTION: the list and each bank's exact steps are supplied by the partner.]
// Until then every bank shows the same general steps, and S26 says so.
export const standingOrderBanks: readonly string[] = [
  'Access Bank',
  'Zenith Bank',
  'GTBank',
  'First Bank',
  'UBA',
  'Fidelity Bank',
  'FCMB',
  'Union Bank',
  'Stanbic IBTC',
  'Sterling Bank',
];

export function standingOrderSteps(bankName: string, account: { bankName: string; accountNumber: string; accountName: string }): string[] {
  return [
    `Open the ${bankName} app or internet banking.`,
    'Find standing orders. Some banks call them scheduled or recurring transfers.',
    `Add your SpreadIT account: ${account.bankName}, ${account.accountNumber}, ${account.accountName}.`,
    'Set the amount to your salary, and the date to the day after your payday.',
    'Confirm with your PIN or token.',
  ];
}
