// B1: the 7 ready-made categories, all off by default.
// B15: keep trying is on by default for Black Tax / Family Support only.
export type CategoryKey =
  | 'family'
  | 'rent'
  | 'tithe'
  | 'savings'
  | 'investment'
  | 'everyday'
  | 'other'
  | 'custom';

export interface Category {
  key: Exclude<CategoryKey, 'custom'>;
  name: string;
  keepTryingByDefault: boolean;
}

export const defaultCategories: Category[] = [
  { key: 'family', name: 'Black Tax / Family Support', keepTryingByDefault: true },
  { key: 'rent', name: 'Rent', keepTryingByDefault: false },
  { key: 'tithe', name: 'Tithe', keepTryingByDefault: false },
  { key: 'savings', name: 'Savings', keepTryingByDefault: false },
  { key: 'investment', name: 'Investment', keepTryingByDefault: false },
  { key: 'everyday', name: 'Transport & Everyday', keepTryingByDefault: false },
  { key: 'other', name: 'Other', keepTryingByDefault: false },
];

export function categoryByKey(key: string): Category | undefined {
  return defaultCategories.find((c) => c.key === key);
}
