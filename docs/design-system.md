# SpreadIT design system (v3)

> Values here match `src/theme/tokens.ts`. Visual reference: `docs/references/home.jpg` (founder decision, 25 November 2026). Look, don't copy: no other brand's logo, name or content.

SpreadIT splits a user's income across their commitments the moment it arrives. The interface should feel calm, exact and a little premium: a white page, one black glossy card at the top of Home with the amount in white, light grey rounded rows below, and a black floating nav.

Version 3 replaces v2's mist background, white cards and aqua buttons with the look of the "home" reference. It keeps **light mode only**, the **Source Sans 3** typeface (lighter weights now) and **Lucide** icons. Aqua stays as a small accent only.

## Principles

1. **White page, grey rows.** Every screen is `canvas` (white). Content sits in light grey `surface` cards and rows with rounded corners and no shadow.
2. **Black is the action colour.** The Home hero, the floating nav and the primary button are `inverse` (near-black) with white text. At most one primary button on screen at a time.
3. **The amount leads.** On Home it is white on the black hero, large, SemiBold, centred, with kobo smaller on the baseline.
4. **Aqua is an accent, never a button.** `brand` appears only as small touches: the status dot on the hero, the selected row tint, insight cards. Never text, never a fill for a button or the nav.
5. **State in words.** Every status is a word plus an icon; colour supports it.

## Content fundamentals

- Plain Nigerian English, sentence case, 20 words or fewer per sentence.
- "You" for the user; "we" only in errors ("We couldn't reach GTBank. We'll try again at 9:46am.").
- Naira: `₦850,000`, never `N850,000` or `NGN`. Kobo only when non-zero, or on the hero.
- People and banks as the user names them: "Mum", "GTBank ••4821". Last 4 digits only.
- The PRD's exact words for system terms: "Is this income?", "Execute now", "Send to my account", "Fully funded".
- No judgement about family support, tithe or spending. No exclamation marks, no emoji.

## Colour (light only)

| Role | Token | Use |
| --- | --- | --- |
| Page | `canvas` | White, behind every screen |
| Cards and rows | `surface` | Light grey cards, list rows, rule cards |
| Raised | `raised` | White: sheets, alerts, the selected segment, icon circles on grey, secondary buttons |
| Wells | `surfaceSunken` | Inputs, PIN boxes, segmented track, neutral badges |
| Text | `ink`, `inkMuted` | Primary and secondary text; quiet buttons are `ink` |
| Black | `inverse`, `inverseRaised`, `inverseLine` | Home hero, nav, primary button; pills and edges on black |
| Text on black | `onInverse`, `onInverseMuted` | White and light grey text and icons on black |
| Accent | `brand`, `brandMid`, `brandSoft`, `brandStrong` | Hero status dot, selected rows, insight cards, Processing badges |
| States | `success`, `warning`, `critical` + `-soft` | Badges, money in, hints, failures |

Gradients (`gradients.hero`, `gradients.pill`) give the black hero and its pills a soft top-to-bottom sheen, using `expo-linear-gradient` (approved 25 November 2026). Every text pair here passes 4.5:1.

## Type: Source Sans 3

Free under the SIL Open Font License, loaded with `useFonts`. v3 uses lighter weights to match the reference's clean look: SemiBold (600) for amounts, headings, buttons and row names; Bold (700) for screen titles and the wordmark; Regular (400) for text. ExtraBold is no longer used.

- Amounts: `amountXl` 48px, `amountLg` 32px, `amountMd` 17px, tabular figures.
- Headings: `title` 28px, `titleSm` 20px, `headline` 17px.
- Text: `body` and `bodyStrong` 16px (the floor for anything a user must read); `label` 14px; `caption` 13px for badges, nav labels and times only.

## Space, shape and depth

- 4px base, `space[1]` to `space[12]`. Screen margin and card padding `space[5]` (20px); the Home hero sits 8px from the screen edges.
- Corners: `radius.sm` 12 (PIN boxes), `radius.md` 16 (inputs), `radius.lg` 20 (cards, rows, alerts), `radius.xl` 32 (the hero, sheets); `radius.pill` for buttons, badges, the status pill and the nav.
- No shadow on cards. `shadow.float` only for the nav, sheets, alerts and a rule card being dragged.

## Layout patterns

- **Home (S15):** the black BalanceHero, then waiting paydays, "Where it went" as grey rows, facts, links and Emergency pause. FloatingNav over the bottom.
- **Plan (S6):** `title`, then RuleCards in priority order, `space[3]` apart.
- **Payday (S16):** full-screen PaydayCountdown, centred, no nav.
- **Lists (history, settings):** ActivityList rows.
- **Forms:** one question per screen; the primary button pinned at the bottom.

## Iconography

Lucide (`lucide-react-native`), 1.75 stroke, round caps. `ink` on light, white on black. Icon circles are white on grey rows. No filled, coloured or 3D icons; no emoji. No logo yet: the wordmark is "SpreadIT" in Source Sans 3 Bold.

## Accessibility (PRD 4.1)

Body text 16px minimum; layouts hold at 200% text size; touch targets 44 × 44 or larger; text contrast 4.5:1; every status in words; icon-only buttons labelled (the hero's "+" and Settings buttons); focus is a 2px `ink` ring.

## Token values

| Colour token | Hex | Use |
| --- | --- | --- |
| `canvas` | #FFFFFF | The page. |
| `surface` | #F4F4F5 | Cards and list rows. |
| `raised` | #FFFFFF | Sheets, alerts, selected segment, icon circles on grey, secondary buttons. |
| `surfaceSunken` | #E8E8EB | Inputs, PIN boxes, segmented track, neutral badges. |
| `line` | #DFDFE3 | Secondary button border, hairlines, empty slider track. |
| `ink` | #111113 | Primary text and amounts; quiet buttons. |
| `inkMuted` | #5E5F66 | Labels and meta. 5.3:1 or more on every light surface. |
| `inverse` | #0D0D0F | Hero (bottom of its sheen), nav, primary button, toggles and slider. |
| `inverseRaised` | #1C1C20 | Avatar, Settings button and status pill on the hero. |
| `inverseLine` | rgba(255,255,255,0.16) | The thin glossy edge on things on black. |
| `onInverse` | #FFFFFF | Text and icons on black. |
| `onInverseMuted` | #A9A9B2 | Muted text on black: the hero label, kobo, inactive nav items. |
| `brand` | #6EE2E6 | Aqua accent: the hero's "on" dot, the split bar. Never text, never a button. |
| `brandMid` | #B8EEF0 | Split bar segment. |
| `brandSoft` | #E3F8F9 | Insight cards, the selected option row, Processing badges. |
| `brandStrong` | #0A6E73 | Text on `brandSoft` only (insight titles, Processing). |
| `onBrand` | #111113 | Text on aqua. |
| `success` / `successSoft` | #127A3E / #E8F6EE | Money in, Successful, Fully funded. |
| `warning` / `warningSoft` | #8F5200 / #FFF4E0 | Retrying, Partly funded, Reversed, hints. |
| `critical` / `criticalSoft` | #B4232B / #FDECEC | Failed, Paused, Emergency pause, destructive actions. |
| `scrim` | rgba(13,13,15,0.45) | Behind sheets. |
| `focusRing` | #111113 | Focused inputs and PIN boxes. |

| Text style | Size / line | Weight |
| --- | --- | --- |
| `amountXl` | 48 / 56 | 600 |
| `amountLg` | 32 / 38 | 600 |
| `amountMd` | 17 / 24 | 600 |
| `title` | 28 / 34 | 700 |
| `titleSm` | 20 / 26 | 600 |
| `headline` | 17 / 24 | 600 |
| `body` | 16 / 24 | 400 |
| `bodyStrong` | 16 / 24 | 600 |
| `label` | 14 / 20 | 400 |
| `caption` | 13 / 18 | 600 |

Sizes: touch 44, button 56, round button 56, hero pill 44, nav 64, icon 22, large icon 28, icon circle 40.

## Component specs

Each is a React Native component in `src/components/`, shown on the hidden Components screen (hold the Settings title for 1 second).

### BalanceHero

The top of Home, from the reference: a black card (`radius.xl`) with the `gradients.hero` sheen, everything centred.

- Top row: initials in a dark circle (left), the "SpreadIT" wordmark (centre; holding it opens Demo controls), a round Settings button (right).
- A muted label ("Last payday · 25 November"), then the amount in `amountXl` white, kobo in `onInverseMuted` on the baseline.
- Actions: two dark glossy pills (Simulate, Send extra) either side of a round "+" (Add rule).
- The status pill at the bottom: a dot and "Automation on · next payday in 30 days". Dot aqua when on, `critical` with "Automation paused", grey when off.

### RoundAction

The round "+" in the hero: a 56px dark glossy circle (`gradients.pill`) with a thin `inverseLine` edge and a white icon. No visible caption, as in the reference; it has an accessibility label.

### Button

Pills, 56px tall, sentence case, verb first.

- **Primary:** `inverse` black fill, white text. At most one showing at a time.
- **Secondary:** white (`raised`) fill, 1px `line` border, `ink` text. Shows on the white page and on grey cards.
- **Quiet:** `ink` text, no fill.
- **Critical:** `criticalSoft` fill, `critical` text. Emergency pause and destructive actions only.
- **Quiet critical:** `critical` text, no fill (Emergency cancel).
- Disabled: 45% opacity, and the screen says why.

### FloatingNav

A black (`inverse`) pill floating 16px above the safe-area bottom, 20px from each side, with `shadow.float`. Home, Plan, Activity, Profile: icon over a 13px label. The active tab is a white tile with `ink` icon and label; the rest are `onInverseMuted`. Labels stay (the reference has icons only) so every tab is named. Hidden on full-screen flows.

### ActivityList

A `titleSm` header, then each row as its own grey (`surface`) tile, `radius.lg`, `space[2]` apart, like the reference's portfolio list.

- Row: a 40px white icon circle, a SemiBold name, a muted meta line, the amount on the right.
- Money in: down-left arrow, `+₦` in `success`. Money out: up-right arrow, amount in `ink`, a status badge.

### RuleCard

One rule in the plan builder and simulator: grey tile, white icon circle, name, meta (rule type · priority · bank and last 4 digits), amount, funding badge (simulator and payday only), drag handle. Lifts with `shadow.float` while dragged.

### InsightCard

A calm fact on a `brandSoft` card: title in `brandStrong`, one sentence in `ink`. Facts only, one at a time.

### PaydayCountdown

The review window (S16), full screen: amount received, the countdown in `amountLg`, the split bar (ink, ink-muted, aqua, light aqua; decorative), each transfer, fees. Buttons: Execute now (primary), Pause for review (secondary), Emergency cancel (quiet critical).

### StatusBadge

A pill with an icon and a word. Successful/Fully funded: success. Processing: `brandSoft` + `brandStrong`. Pending, Sent to fallback, Skipped: neutral (`surfaceSunken`). Retrying, Reversed, Partly funded: warning. Failed, Paused: critical.

### SegmentedControl

`surfaceSunken` track; the selected option is a white (`raised`) pill. Each option 44px or taller.

### AmountField, TextField, PinField

`surfaceSunken` wells (`radius.md`; PIN boxes `radius.sm`, 44 × 56). Focus: a 2px `ink` border with a `line` halo. Errors: `critical` border plus an icon and words. AmountField shows the real transfer cost; ₦10,000–₦10,999 shows the stamp-duty hint in warning style.

### Toggle

An on/off row: `headline` label, optional description, switch on the right. On is black (`inverse`); thumb white. Disabled at 45% with the reason.

### OptionList

A grey card of rows 56px or taller with hairlines. The selected row is `brandSoft` with an `ink` check.

### Slider

What-if slider (C5), `@react-native-community/slider`. Track and thumb black; empty track `line`. The value is always written out.

### CostEstimate

The monthly cost line (C6). Normal: receipt icon and the sentence in muted text. Above 1%: warning-hint style, then a quiet "Ways to lower your costs" that opens a Sheet.

### Sheet

A white (`raised`) panel with `radius.xl` top corners over the `scrim`, at most 85% of the screen tall.

### AlertBanner

The prototype's pretend push: a white (`raised`) card, `radius.lg`, `shadow.float`, sliding down under the status bar. Icon circle, `headline` title, `label` line, close button. Tapping opens the screen it names.

## Building it in the Expo app

1. `src/theme/tokens.ts` holds every value. Screens never type a colour, size or font name.
2. `@expo-google-fonts/source-sans-3` loaded with `useFonts` before the first screen.
3. `expo-linear-gradient` for the hero and pill sheen (runs in Expo Go).
4. Light mode only: `"userInterfaceStyle": "light"`.
5. FloatingNav is a custom `tabBar` for Expo Router's `Tabs`.
6. Shadows: iOS takes the shadow values; Android uses `elevation` (0 for cards, 6 for float).
