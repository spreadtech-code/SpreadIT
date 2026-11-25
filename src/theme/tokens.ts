// SpreadIT design tokens — design system v4 in the "Blue" colours (light mode only).
// Layout and type approved by the founder on 25 Nov 2026; colours switched from teal to
// blue the same day ("stick to the Blue for now"). Taken from the Figma file
// "SpreadIT — App designs" (variable collection "SpreadIT v4", mode "Blue").
// A white page, white cards with a soft navy-tinted shadow, deep-blue actions, sky blue
// as the brand fill, Host Grotesk in light-to-regular weights.
// Never type a colour, size or font name in a screen: import from here.

export const colors = {
  /** The page. */
  canvas: '#FFFFFF',
  /** Cards and panels: white, lifted by shadow.card. */
  surface: '#FFFFFF',
  /** Sheets, alerts, the selected segment: white above everything. */
  raised: '#FFFFFF',
  /** Wells: inputs, code boxes, info panels, segmented tracks, neutral tags. */
  surfaceSunken: '#F2F5F9',
  line: '#E3E8F0',
  ink: '#0F1623',
  inkMuted: '#5A6577',
  /** Decoration only (kobo, empty states, inactive nav icons). Never body text. */
  inkFaint: '#98A2B3',

  /** SpreadIT sky blue: the brand fill (Welcome, accent buttons, avatars, big cards). */
  brand: '#7CC4FF',
  /** Light blue: chart slices, the slider track on the brand card. */
  brandMid: '#C7E3FF',
  /** Pale blue: icon bubbles, chips, notices, the selected option. */
  brandSoft: '#EAF4FF',
  /** Deep blue text on brandSoft (same as primary). */
  brandStrong: '#1846B8',
  /** Text and icons on sky blue and pale blue (navy). */
  onBrand: '#0B2A5B',

  /** Deep blue: the main action (primary button), icons, active nav, toggles, slider. */
  primary: '#1846B8',
  /** Navy: the darkest chart slice. */
  primaryDeep: '#0B2A5B',
  onPrimary: '#FFFFFF',

  success: '#1E7B34',
  successSoft: '#E7F6EA',
  warning: '#8A5300',
  warningSoft: '#FFF3DE',
  critical: '#B42330',
  criticalSoft: '#FDECEC',
  scrim: 'rgba(15, 22, 35, 0.45)',
  focusRing: '#1846B8',
} as const;

/** Split slices in priority order (donut, split bar, legend dots): navy to light blue, then greys. */
export const chartColors = ['#0B2A5B', '#1846B8', '#3F7BE0', '#7CC4FF', '#C7E3FF', '#CDD5E0', '#8E99AA'] as const;

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

/** Page layout. v4: 16px side margins (founder decision). */
export const layout = {
  screenPadding: 16,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const size = {
  touchMin: 44,
  buttonHeight: 56,
  /** Round icon bubbles (list rows, back button). */
  bubble: 44,
  /** Small bubbles in settings rows. */
  bubbleSm: 36,
  /** The raised centre Simulate button in the nav. */
  navCentre: 52,
  navHeight: 64,
  icon: 22,
  iconSm: 18,
  iconLarge: 28,
  /** One box of a PIN or SMS code. */
  codeBoxWidth: 48,
  codeBoxHeight: 56,
  donut: 168,
} as const;

// Font files come from @expo-google-fonts/host-grotesk; load these names with useFonts().
export const fonts = {
  regular: 'HostGrotesk_400Regular',
  medium: 'HostGrotesk_500Medium',
  semibold: 'HostGrotesk_600SemiBold',
} as const;

// Text styles (Figma "v4/…" text styles). Light-to-regular weights: big numbers and
// headlines stay Regular, names and buttons Medium.
export const type = {
  display: { fontFamily: fonts.regular, fontSize: 40, lineHeight: 46, letterSpacing: -1.2 },
  amountXl: { fontFamily: fonts.regular, fontSize: 40, lineHeight: 48, letterSpacing: -1.2 },
  amountLg: { fontFamily: fonts.regular, fontSize: 28, lineHeight: 34, letterSpacing: -0.8 },
  amountMd: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, letterSpacing: -0.1 },
  title: { fontFamily: fonts.medium, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  titleSm: { fontFamily: fonts.medium, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  headline: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 24, letterSpacing: -0.1 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  labelStrong: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },
} as const;

// Shadows (Figma "v4/card" and "v4/float"): navy-tinted. iOS uses shadow*, Android elevation.
export const shadow = {
  card: { shadowColor: '#0B1A3A', shadowOpacity: 0.1, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  float: { shadowColor: '#0B1A3A', shadowOpacity: 0.16, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
} as const;

export const component = {
  koboText: { fontFamily: fonts.regular, fontSize: 22, lineHeight: 28, letterSpacing: -0.4 },
  focusRingWidth: 1.5,
  badgeIcon: 12,
  splitBarHeight: 12,
  donutThickness: 0.26,
  disabledOpacity: 0.45,
} as const;

export const theme = { colors, chartColors, space, layout, radius, size, fonts, type, shadow, component };
export type Theme = typeof theme;
