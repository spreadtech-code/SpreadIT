# SpreadIT design system (v4, Blue colours)

> Values here match `src/theme/tokens.ts`. The visual source is the Figma file "SpreadIT — App designs" (https://www.figma.com/design/RDclWHQYxigUF1xz6zQFuk): page "v4 Screens" for every screen, page "v4 Design system" for the components, variable collection "SpreadIT v4", mode "Blue". Layout approved by the founder on 25 Nov 2026 (it replaces v3: black hero, black nav, Source Sans 3); colours switched from Teal to Blue the same day. The Teal and Lime modes stay in Figma as alternatives.

SpreadIT splits a user's pay across their commitments the moment it lands. The app should feel calm, friendly and exact: a white page, white cards lifted by a soft navy shadow, deep-blue actions, sky blue as the brand colour, and Host Grotesk set light.

**Light mode only.** Wording follows `docs/copy.md` (app words for PRD terms).

## Principles

1. **White page, white cards.** Every screen is `canvas` (white). Content sits on white `surface` cards with `radius.lg` (24) and `shadow.card`. Grey wells (`surfaceSunken`) hold inputs and read-only facts.
2. **Deep blue is the action colour.** The primary button, active nav icon, toggles, slider and icons are `primary` (#1846B8). At most one primary button on screen at a time.
3. **Sky blue is the brand.** `brand` (#7CC4FF) fills big moments: the Welcome page tint, the accent button ("Send extra"), avatars, the simulator's "If this lands" card, the account-number card and the monthly recap. Text on sky blue is `onBrand` (#0B2A5B), never white.
4. **The amount leads.** Big numbers are Host Grotesk Regular, large, with kobo faint on the baseline.
5. **The split is a donut.** Where money went is a donut plus a legend of coloured dots with exact naira; the chart is decorative, the legend carries the numbers.
6. **State in words.** Every status is a word plus an icon; colour only backs it up.

## Content fundamentals

- Plain Nigerian English, sentence case, short sentences, app-style words (see `docs/copy.md`): "Send it now", "Pause everything", "Is this pay?", "Sent", "Autopilot".
- "You" for the user; "we" for SpreadIT ("We’ll keep trying.").
- Naira: `₦850,000`, never `N850,000` or `NGN`. Kobo only when non-zero, or faint on the Home balance.
- People and banks as the user names them: "Mum", "GTBank ••4821". Last 4 digits only.
- No judgement about family support, tithe or spending. No exclamation marks, no emoji. Curly apostrophes.

## Colour (light only)

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Page | `canvas` | #FFFFFF | Behind every screen |
| Cards | `surface` | #FFFFFF | Cards and panels, with `shadow.card` |
| Raised | `raised` | #FFFFFF | Sheets, alerts, the selected segment |
| Wells | `surfaceSunken` | #F2F5F9 | Inputs, code boxes, info panels, segmented track, back button |
| Lines | `line` | #E3E8F0 | Hairlines, secondary button borders, unselected option rows |
| Text | `ink` / `inkMuted` | #0F1623 / #5A6577 | Main and secondary text |
| Faint | `inkFaint` | #98A2B3 | Kobo, placeholders, inactive nav icons, chevrons. Never body text |
| Brand | `brand` | #7CC4FF | Sky-blue fills (see principle 3) |
| Brand tints | `brandMid` / `brandSoft` | #C7E3FF / #EAF4FF | Chart, slider track on sky blue / icon bubbles, chips, notices, selected option |
| On sky blue | `onBrand` | #0B2A5B | Text and icons on `brand` and `brandSoft` |
| Primary | `primary` / `primaryDeep` | #1846B8 / #0B2A5B | Primary button, icons, active nav, toggles / darkest chart slice |
| On primary | `onPrimary` | #FFFFFF | Text on `primary` |
| States | `success`, `warning`, `critical` + `-soft` | | Tags, money in, notices, Pause everything |

**Chart scale** (`chartColors`, in priority order, navy to light blue): #0B2A5B, #1846B8, #3F7BE0, #7CC4FF, #C7E3FF for rules; #CDD5E0 (`leftoverColour`) for leftovers; #8E99AA (`feeColour`) for bank fees. Every text pair passes 4.5:1.

## Type: Host Grotesk

From `@expo-google-fonts/host-grotesk` (Regular 400, Medium 500, SemiBold 600), loaded with `useFonts` before the first screen.

| Style | Size / line | Weight | Use |
| --- | --- | --- | --- |
| `display` | 40 / 46 | Regular | Welcome headline |
| `amountXl` | 40 / 48 | Regular | Home balance, payday amount, receipt amount |
| `amountLg` | 28 / 34 | Regular | Plan summary, card amounts, countdown |
| `amountMd` | 16 / 22 | Medium | Row amounts (tabular figures) |
| `title` | 28 / 34 | Medium | Screen titles |
| `titleSm` | 20 / 26 | Medium | Greeting, wordmark |
| `headline` | 17 / 24 | Medium | Card and section titles |
| `body` / `bodyStrong` | 16 / 24 | Regular / Medium | Text (16 is the floor for anything to read) / names, buttons |
| `label` / `labelStrong` | 14 / 20 | Regular / Medium | Meta lines, field labels, group titles |
| `caption` | 12 / 16 | Medium | Status tags only |

## Space, shape and depth

- 4px base, `space[1]` to `space[12]`. Screen side margin `layout.screenPadding` = 16. Card padding 16 (20 on sky blue cards). Gaps between sections 20 to 24.
- Corners: `radius.sm` 12, `radius.md` 16 (inputs, option rows, notices, account cards), `radius.lg` 24 (cards, wells, sky-blue cards), `radius.xl` 32 (sheets), `radius.pill` (buttons, chips, tags, bubbles).
- `shadow.card` (navy-tinted, soft) on white cards and the nav bar; `shadow.float` for sheets and a dragged rule card. Wells and sky-blue cards have no shadow.

## Layout patterns

- **Home (S15):** greeting + bell, the balance with faint kobo, the Autopilot chip, actions (Simulate / Send extra / round "+"), waiting payday cards, "Where it went" donut card, Unsplit money + Next payday card, Recent activity, Pause everything. NavBar at the bottom.
- **Flows (Screen component):** round Back button and a segmented step bar, title + subtitle, content, footer buttons pinned at the bottom.
- **Profile (S22):** profile card, then SettingsGroups of SettingsRows; choices open in a Sheet.
- **Payday (S16):** full screen, no nav: arrow bubble, amount, pale-blue countdown, split bar, dot list, three buttons.
- **Lists:** ActivityList rows on white (no box), grouped by month on Activity with chips to filter.

## Iconography

Lucide (`lucide-react-native`), `strokeWidth={1.75}`, round caps. Icons are `primary` inside pale-blue bubbles (`brandSoft`), `onBrand` on sky blue, `critical` in red rows. The wordmark is three stacked bars plus "SpreadIT" in Host Grotesk Medium, `onBrand`. No filled or coloured icons, no emoji.

## Accessibility (PRD 4.1)

Body text 16 minimum; touch targets 44 × 44 or larger; text contrast 4.5:1; every status in words (screen readers hear the same word as the tag); icon-only buttons have labels ("Simulate a payday", "Notifications", "Change the amount"); decorative charts are hidden from screen readers and the legend reads every amount; focus is a 1.5px `primary` border.

## Component specs

All in `src/components/`, all on show in the hidden Components screen (hold the "Profile" title for 1 second).

### BalanceHero
The top of Home on the white page (no card). Greeting (`titleSm`) with a status line and a round bell; label ("Last payday · 25 November"); amount `amountXl` with kobo in `inkFaint`; Autopilot chip (pale blue, dot `primary` when on, red on `criticalSoft` when paused, grey when off); actions: primary button, accent button, round 56px pale-blue "+". Holding the greeting for 1 second opens Demo controls (prototype only).

### SplitDonut and SplitLegend
`react-native-svg` ring, 168px, thickness 26% of the radius, small gaps between slices, rule slices from the chart scale in priority order, `leftoverColour` and `feeColour` for leftovers and fees. Centre: total (`headline`) and "split N ways" (only slices above ₦0 count). The legend: 10px dot, name, exact amount.

### Button
56px pill, label `bodyStrong`, optional leading icon (20px). Variants: `primary` (deep blue, white), `accent` (sky blue, `onBrand`), `secondary` (white with `line` border), `quiet` (blue text), `critical` (`criticalSoft`, red text), `quietCritical`. `compact` narrows the side padding for two or three in a row.

### NavBar (FloatingNav)
White bar at the bottom with rounded top corners and `shadow.card`. Icons only, each with a spoken label: Home, Plan, (raised 52px pale-blue Simulate button in the centre, opens S10), Activity, Profile. Active icon `primary` with a 4px dot, others `inkFaint`.

### ActivityList
Optional title (`headline`, or a muted month label with `small`), then rows: 44px pale-blue bubble with a `primary` icon, name `bodyStrong`, meta `label`, amount on the right (`+₦` in `success` for money in) with a StatusTag for money out.

### RuleCard
White card: pale-blue bubble, name, meta ("Fixed · #1 · GTBank ••4821"), amount, optional funding tag and note, drag grip on the plan.

### StatusBadge (StatusTag)
Small pill, icon 12px + `caption` word. Tones: success (Sent, Fully paid), brand (Sending), neutral (Queued, Skipped, Sent to backup, Paused), warning (Trying again, Part paid, Returned), critical (Didn’t go). Words come from `badgeWords`.

### Notice
Rounded `radius.md` box with an icon and a one-line message. Tones: info (pale blue, deep blue), warning (amber), critical (red).

### SectionHeader
`headline` title with an optional quiet "See all" / "Details" link and chevron.

### Chip
36px pill: pale blue with blue text, or deep blue with white text when selected.

### InfoRow
Muted label left, value right (`bodyStrong`, or `headline` when `strong`). Used in wells and receipts.

### AccountCard
White card: bank bubble, account name, "tag · Bank ••1234", optional "Change" link.

### SettingsGroup and SettingsRow
Optional muted group title, then a white card of 56px rows split by inset hairlines: 36px pale-blue bubble, label, optional value, chevron when it opens something, or a switch (`switchValue`). `tone="critical"` for Pause everything and Log out.

### PaydayCountdown
See Layout patterns: Payday (S16). Buttons: Send it now (primary, with icon), Hold for review (secondary), Stop this payday (critical).

### Fields: TextField, AmountField, PinField
Label `labelStrong` in `inkMuted`; well `surfaceSunken`, `radius.md`, 1.5px `primary` border on focus, red on error. AmountField: faint ₦, large amount. PinField: six 48 × 56 code boxes with blue dots.

### Toggle, Slider, SegmentedControl, OptionList
Toggle: deep-blue switch with label and description. Slider: deep blue on white, `tone="onBrand"` (dark blue with `brandMid` track) on sky blue. SegmentedControl: grey track, white selected segment with blue text. OptionList: separate rounded rows with a radio circle; selected row pale blue with a blue border and filled check.

### InsightCard, CostEstimate, Sheet, AlertBanner
InsightCard: pale-blue card, `onBrand` text. CostEstimate: an info Notice, or a warning with "Ways to lower your costs" when above 1%. Sheet: white bottom sheet, `radius.xl` top, over a scrim. AlertBanner: white pop-down with a pale-blue bell bubble.

## Building it in the Expo app

- Every colour, size, radius, shadow and font comes from `src/theme/tokens.ts`. Never type a hex value, pixel size or font name in a screen.
- Build screens from these components; ask before inventing a new one or a new colour.
- When Figma and this file disagree on look, Figma wins and this file is updated. When the PRD and this file disagree, the PRD wins on behaviour; wording follows `docs/copy.md`.
