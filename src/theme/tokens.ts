// SpreadIT design tokens — design system v3 (light mode only), from the founder's
// "home" reference (docs/references/home.jpg), approved 25 Nov 2026.
// A white page, a black glossy hero, black actions, light grey rounded rows.
// Never type a colour, size or font name in a screen: import from here.

export const colors = {
  /** The page: white. */
  canvas: '#FFFFFF',
  /** Cards and list rows: light grey on the white page, no shadow. */
  surface: '#F4F4F5',
  /** White panels that sit above everything: sheets, alerts, the selected segment. */
  raised: '#FFFFFF',
  /** Wells inside cards: inputs, icon circles, secondary buttons, tracks. */
  surfaceSunken: '#E8E8EB',
  line: '#DFDFE3',
  ink: '#111113',
  inkMuted: '#5E5F66',

  /** Black: the Home hero, the nav and the primary button. */
  inverse: '#0D0D0F',
  /** Pills and the round button on the black hero. */
  inverseRaised: '#1C1C20',
  /** The thin glossy edge on pills and buttons on black. */
  inverseLine: 'rgba(255, 255, 255, 0.16)',
  onInverse: '#FFFFFF',
  onInverseMuted: '#A9A9B2',

  /** SpreadIT aqua: a small accent only (status dot, selected row tint). Never text. */
  brand: '#6EE2E6',
  brandMid: '#B8EEF0',
  brandSoft: '#E3F8F9',
  /** Deep teal for the rare brand-coloured text: insight titles, text on brand-soft. */
  brandStrong: '#0A6E73',
  onBrand: '#111113',

  success: '#127A3E',
  successSoft: '#E8F6EE',
  warning: '#8F5200',
  warningSoft: '#FFF4E0',
  critical: '#B4232B',
  criticalSoft: '#FDECEC',
  scrim: 'rgba(13, 13, 15, 0.45)',
  focusRing: '#111113',
} as const;

/** expo-linear-gradient stops, top to bottom: the sheen on black. */
export const gradients = {
  hero: ['#2C2C31', '#0D0D0F'],
  pill: ['#303036', '#17171A'],
} as const;

export const space = {
  1: 4, // space-1
  2: 8, // space-2
  3: 12, // space-3
  4: 16, // space-4
  5: 20, // space-5
  6: 24, // space-6
  8: 32, // space-8
  12: 48, // space-12
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 32,
  pill: 999,
} as const;

export const size = {
  touchMin: 44,
  buttonHeight: 56,
  roundButton: 56,
  /** The dark pills on the hero (Simulate, Send extra) and the status pill. */
  heroPill: 44,
  navHeight: 64,
  icon: 22,
  /** The "+" in the hero's round button. */
  iconLarge: 28,
  iconCircle: 40,
} as const;

// Font files come from @expo-google-fonts/source-sans-3; load these names with useFonts().
export const fonts = {
  regular: 'SourceSans3_400Regular',
  semibold: 'SourceSans3_600SemiBold',
  bold: 'SourceSans3_700Bold',
  extrabold: 'SourceSans3_800ExtraBold',
} as const;

// Text styles. In React Native, each weight is its own font file, so fontFamily carries the weight.
// v3: lighter weights, as in the reference: amounts SemiBold, titles Bold.
export const type = {
  amountXl: { fontFamily: fonts.semibold, fontSize: 48, lineHeight: 56, letterSpacing: -1.2 },
  amountLg: { fontFamily: fonts.semibold, fontSize: 32, lineHeight: 38, letterSpacing: -0.6 },
  amountMd: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  titleSm: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26 },
  headline: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
} as const;

// Shadows: iOS uses the shadow* values, Android uses elevation.
// v3: cards have no shadow (grey on white is enough); float is for sheets, alerts and the nav.
export const shadow = {
  card: { shadowColor: '#0D0D0F', shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 0 },
  float: { shadowColor: '#0D0D0F', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
} as const;

// Sizes the component specs name.
export const component = {
  koboText: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26 }, // BalanceHero kobo, on the baseline
  focusRingWidth: 2,
  focusHaloWidth: 3,
  badgeIcon: 14,
  splitBarHeight: 12,
  disabledOpacity: 0.45,
} as const;

export const theme = { colors, gradients, space, radius, size, fonts, type, shadow, component };
export type Theme = typeof theme;
