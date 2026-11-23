// Nigerian banks for picking a destination (B7). Pretend list: a real partner
// supplies its own list with bank codes.
export interface Bank {
  id: string;
  name: string;
}

export const banks: Bank[] = [
  { id: 'access', name: 'Access Bank' },
  { id: 'ecobank', name: 'Ecobank' },
  { id: 'fidelity', name: 'Fidelity Bank' },
  { id: 'firstbank', name: 'First Bank' },
  { id: 'fcmb', name: 'FCMB' },
  { id: 'gtbank', name: 'GTBank' },
  { id: 'keystone', name: 'Keystone Bank' },
  { id: 'kuda', name: 'Kuda' },
  { id: 'moniepoint', name: 'Moniepoint' },
  { id: 'opay', name: 'Opay' },
  { id: 'palmpay', name: 'PalmPay' },
  { id: 'polaris', name: 'Polaris Bank' },
  { id: 'providus', name: 'Providus Bank' },
  { id: 'stanbic', name: 'Stanbic IBTC' },
  { id: 'sterling', name: 'Sterling Bank' },
  { id: 'uba', name: 'UBA' },
  { id: 'union', name: 'Union Bank' },
  { id: 'unity', name: 'Unity Bank' },
  { id: 'wema', name: 'Wema Bank' },
  { id: 'zenith', name: 'Zenith Bank' },
];

export function bankById(id: string): Bank | undefined {
  return banks.find((b) => b.id === id);
}
