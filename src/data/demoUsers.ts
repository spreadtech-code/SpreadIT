// The four demo users from PRD 2.2, with their plans. Pretend data only:
// account numbers and names are made up.
//
// Notes where the PRD is silent:
// - Priority order follows the order the PRD lists each persona's commitments
//   (Chiamaka: parents and siblings first, as Journey 2 says).
// - Fixed rules are "Once per month" (B5 default). Percentages are basis points.
// - Chiamaka: persona numbers are used (founder decision, 23 Nov 2026); PRD
//   Journey 2's "remainder of ₦90,000" is a typo.
// - Emeka is paid ₦150,000 to ₦900,000 per payment with no single expected
//   amount; ₦400,000 is a demo choice, with the ₦100,000 qualifying minimum
//   from Journey 3.
import type { Plan } from '../engine/types';

export interface DemoUser {
  id: 'tunde' | 'chiamaka' | 'emeka' | 'folake';
  firstName: string;
  lastName: string;
  initials: string;
  city: string;
  incomeType: 'regular' | 'varies';
  expectedKobo: number;
  qualifyingMinimumKobo: number;
  payDay: string;
  plan: Plan;
}

const acct = (bankName: string, accountNumber: string, accountName: string) => ({
  bankName,
  accountNumber,
  accountName,
});

export const tunde: DemoUser = {
  id: 'tunde',
  firstName: 'Tunde',
  lastName: 'Adeyemi',
  initials: 'TA',
  city: 'Lagos',
  incomeType: 'regular',
  expectedKobo: 85_000_000,
  qualifyingMinimumKobo: 42_500_000, // A8 default: 50% of expected
  payDay: 'Monthly on the 25th',
  plan: {
    rules: [
      { id: 'tunde-mum', name: 'Mum', kind: 'fixed', amountKobo: 8_000_000, frequency: 'oncePerMonth', destination: acct('GTBank', '0123454821', 'Folasade Adeyemi') },
      { id: 'tunde-rent', name: 'Rent', kind: 'fixed', amountKobo: 15_000_000, frequency: 'oncePerMonth', destination: acct('Access Bank', '0987651190', 'Tunde Adeyemi') },
      { id: 'tunde-tithe', name: 'Tithe', kind: 'percent', basisPoints: 1_000, destination: acct('Zenith Bank', '2210337765', 'Church Tithe Account') },
      { id: 'tunde-savings', name: 'Savings', kind: 'percent', basisPoints: 1_500, destination: acct('Kuda', '2004118832', 'Tunde Adeyemi') },
      { id: 'tunde-investment', name: 'Investment', kind: 'fixed', amountKobo: 5_000_000, frequency: 'oncePerMonth', destination: acct('Opay', '8061234410', 'Tunde Adeyemi') },
    ],
    remainder: { name: 'Everyday account', destination: acct('GTBank', '0123459902', 'Tunde Adeyemi') },
  },
};

export const chiamaka: DemoUser = {
  id: 'chiamaka',
  firstName: 'Chiamaka',
  lastName: 'Okafor',
  initials: 'CO',
  city: 'Abuja',
  incomeType: 'regular',
  expectedKobo: 42_000_000,
  qualifyingMinimumKobo: 21_000_000,
  payDay: 'Monthly on the 28th',
  plan: {
    rules: [
      { id: 'chiamaka-parents', name: 'Parents', kind: 'fixed', amountKobo: 4_000_000, frequency: 'oncePerMonth', destination: acct('First Bank', '3012267743', 'Ngozi Okafor') },
      { id: 'chiamaka-siblings', name: "Siblings' school fees", kind: 'fixed', amountKobo: 6_000_000, frequency: 'oncePerMonth', destination: acct('UBA', '2087719054', 'Obinna Okafor') },
      { id: 'chiamaka-tithe', name: 'Tithe', kind: 'percent', basisPoints: 1_000, destination: acct('Zenith Bank', '1014452209', 'Parish Tithe Account') },
      { id: 'chiamaka-transport', name: 'Transport', kind: 'fixed', amountKobo: 6_000_000, frequency: 'oncePerMonth', destination: acct('Moniepoint', '6609813327', 'Chiamaka Okafor') },
      { id: 'chiamaka-savings', name: 'Savings', kind: 'fixed', amountKobo: 3_000_000, frequency: 'oncePerMonth', destination: acct('Kuda', '2009934416', 'Chiamaka Okafor') },
    ],
    remainder: { name: 'Everyday account', destination: acct('Access Bank', '0712290385', 'Chiamaka Okafor') },
  },
};

export const emeka: DemoUser = {
  id: 'emeka',
  firstName: 'Emeka',
  lastName: 'Nwosu',
  initials: 'EN',
  city: 'Port Harcourt',
  incomeType: 'varies',
  expectedKobo: 40_000_000,
  qualifyingMinimumKobo: 10_000_000,
  payDay: '2 to 4 client payments a month',
  plan: {
    rules: [
      { id: 'emeka-tax', name: 'Tax reserve', kind: 'percent', basisPoints: 1_000, destination: acct('Wema Bank', '0236671180', 'Emeka Nwosu') },
      { id: 'emeka-savings', name: 'Savings', kind: 'percent', basisPoints: 2_000, destination: acct('Kuda', '2011457736', 'Emeka Nwosu') },
      { id: 'emeka-investment', name: 'Investment', kind: 'percent', basisPoints: 1_000, destination: acct('Opay', '8139920045', 'Emeka Nwosu') },
      { id: 'emeka-mum', name: 'Mum', kind: 'fixed', amountKobo: 3_000_000, frequency: 'oncePerMonth', destination: acct('First Bank', '3088214470', 'Adaeze Nwosu') },
      { id: 'emeka-rent', name: 'Rent', kind: 'fixed', amountKobo: 8_000_000, frequency: 'oncePerMonth', destination: acct('GTBank', '0451187723', 'Emeka Nwosu') },
    ],
    remainder: { name: 'Everyday account', destination: acct('GTBank', '0451187799', 'Emeka Nwosu') },
  },
};

export const folake: DemoUser = {
  id: 'folake',
  firstName: 'Folake',
  lastName: 'Bello',
  initials: 'FB',
  city: 'Ibadan',
  incomeType: 'regular',
  expectedKobo: 31_000_000,
  qualifyingMinimumKobo: 15_500_000,
  payDay: 'Monthly, usually 24th to 30th',
  plan: {
    rules: [
      { id: 'folake-tithe', name: 'Tithe', kind: 'percent', basisPoints: 1_000, destination: acct('Zenith Bank', '1015563318', 'Church Building Fund') },
      { id: 'folake-school', name: "Children's school fees", kind: 'fixed', amountKobo: 7_000_000, frequency: 'oncePerMonth', destination: acct('First Bank', '3055102296', 'Folake Bello') },
      { id: 'folake-coop', name: 'Cooperative', kind: 'fixed', amountKobo: 3_000_000, frequency: 'oncePerMonth', destination: acct('Polaris Bank', '1772043381', 'Staff Cooperative Ibadan') },
      { id: 'folake-mother', name: 'Mother', kind: 'fixed', amountKobo: 2_000_000, frequency: 'oncePerMonth', destination: acct('UBA', '2066318847', 'Abike Bello') },
    ],
    remainder: { name: 'Everyday account', destination: acct('First Bank', '3055102207', 'Folake Bello') },
  },
};

export const demoUsers: DemoUser[] = [tunde, chiamaka, emeka, folake];
