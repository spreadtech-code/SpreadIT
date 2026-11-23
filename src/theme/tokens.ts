// SpreadIT design tokens — generated from the SpreadIT design system (light mode only).
// Never type a colour, size or font name in a screen: import from here.

export const colors = {
  canvas: '#EEF2F3',
  surface: '#FFFFFF',
  surfaceSunken: '#E4EAEC',
  line: '#DCE3E5',
  ink: '#12191B',
  inkMuted: '#5A6669',
  brand: '#6EE2E6',
  brandMid: '#B8EEF0',
  brandSoft: '#E3F8F9',
  brandStrong: '#0A6E73',
  onBrand: '#12191B',
  success: '#127A3E',
  successSoft: '#E8F6EE',
  warning: '#8F5200',
  warningSoft: '#FFF4E0',
  critical: '#B4232B',
  criticalSoft: '#FDECEC',
  scrim: 'rgba(18, 25, 27, 0.40)',
  focusRing: '#0A6E73',
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
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const size = {
  touchMin: 44,
  buttonHeight: 56,
  roundButton: 56,
  navHeight: 64,
  icon: 22,
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
export const type = {
  amountXl: { fontFamily: fonts.extrabold, fontSize: 44, lineHeight: 48, letterSpacing: -1.0 },
  amountLg: { fontFamily: fonts.extrabold, fontSize: 30, lineHeight: 36, letterSpacing: -0.5 },
  amountMd: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 24 },
  title: { fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  titleSm: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28 },
  headline: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18 },
} as const;

// Shadows: iOS uses the shadow* values, Android uses elevation.
export const shadow = {
  card: { shadowColor: '#12191B', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  float: { shadowColor: '#12191B', shadowOpacity: 0.14, shadowRadius: 16, shadowOffset: { width: 0, height: 12 }, elevation: 6 }, // Android elevation lowered 12 -> 6 (founder, stage 1b): 12 drew a hard grey slab under the nav
} as const;

// Added in stage 1b (new entries only; the only value above changed is shadow.float.elevation).
// Sizes the design system's component specs name, plus two marked "proposed"
// that the specs leave open. Confirm or correct with the founder.
export const component = {
  koboText: { fontFamily: fonts.extrabold, fontSize: 18, lineHeight: 24 }, // BalanceHero kobo, "18px on the baseline"
  focusRingWidth: 2, // "a 2px brand-strong ring"
  focusHaloWidth: 3, // AmountField "3px brand-soft halo"
  badgeIcon: 14, // proposed: icon inside a 13px StatusBadge
  splitBarHeight: 12, // proposed: PaydayCountdown split bar
  disabledOpacity: 0.45, // Button "Disabled buttons drop to 45% opacity"
} as const;

export const theme = { colors, space, radius, size, fonts, type, shadow, component };
export type Theme = typeof theme;
