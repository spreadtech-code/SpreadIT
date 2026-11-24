// F6 demo data: another phone signed in to the account, so "Sign out" on a
// phone can be tried. Pretend only.
export interface SignedInDevice {
  id: string;
  model: string;
  lastUsedAt: number;
}

export const otherDemoDevices: readonly SignedInDevice[] = [
  { id: 'demo-phone-2', model: 'Tecno Camon 20', lastUsedAt: new Date(2026, 10, 12, 19, 40).getTime() },
];
