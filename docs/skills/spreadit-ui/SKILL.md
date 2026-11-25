---
name: "spreadit-ui"
description: "SpreadIT app visual style, design system v4 in Blue (white page and white cards with a soft navy shadow, deep-blue actions, sky-blue brand fills, split donut, white nav with a raised Simulate button, Host Grotesk, app-style wording from docs/copy.md). Use when building, restyling or reviewing any SpreadIT screen or component, in code or in Figma."
---

# SpreadIT UI (design system v4, Blue colours)

SpreadIT is a mobile fintech app for Nigerian earners (Expo, React Native, TypeScript). When pay lands it splits it across family, rent, tithe, savings and more. The look was set by the founder on 25 November 2026 in the Figma file "SpreadIT — App designs" (https://www.figma.com/design/RDclWHQYxigUF1xz6zQFuk, page "v4 Screens", variables "SpreadIT v4", mode "Blue"; colours switched from Teal to Blue the same day). Calm, friendly, exact. If a screen could belong to any template app, it is wrong.

## Before you build anything

1. In the project, read `CLAUDE.md`, the relevant part of `docs/PRD.md`, `docs/design-system.md` (v4) and `docs/copy.md` (app wording).
2. Look at the screen's Figma frame. Match it; when code and Figma disagree on look, Figma wins.
3. All values come from `src/theme/tokens.ts`. Never type a hex colour, pixel size or font name in a screen. Compose screens from `src/components/`.

## The look

- **Page:** white (`colors.canvas`), 16px side margins (`layout.screenPadding`).
- **Cards:** white (`colors.surface`), `radius.lg` (24), soft navy-tinted `shadow.card`, 16px padding. Read-only facts and inputs sit in grey wells (`colors.surfaceSunken`, #F2F5F9) with no shadow.
- **Action colour:** deep blue `colors.primary` (#1846B8): the primary button (one showing at a time), icons, the active nav icon, toggles, the slider.
- **Brand:** sky blue `colors.brand` (#7CC4FF) fills big moments: the Welcome page tint, the accent button ("Send extra"), avatars, the simulator's "If this lands" card, the account-number card, the monthly recap. Text on sky blue is `colors.onBrand` (#0B2A5B), never white. Pale blue `colors.brandSoft` (#EAF4FF) for icon bubbles, chips, notices and the selected option.
- **Home (S15):** no hero card. "Hi, Tunde" with a status line and a bell; the balance large and regular weight with faint kobo; the Autopilot chip; actions: Simulate (primary), Send extra (accent), round "+". Then "Where it went" as a donut with a dot legend, Unsplit money and Next payday, Recent activity, Pause everything.
- **Split chart:** `SplitDonut` + `SplitLegend` (react-native-svg). Rules in the blue scale in priority order, leftovers light grey, bank fees mid grey. The donut is decorative; the legend reads every amount.
- **Buttons:** 56px pills, label Medium 16. Primary deep blue; accent sky blue; secondary white with a thin line border; quiet blue text; critical red on light red.
- **Lists:** rows on white, a 44px pale-blue bubble with a blue icon, name Medium, muted meta, amount right ("+₦" green for money in), status tags with a word.
- **Nav:** white bar at the bottom with rounded top corners and a soft shadow; icons only (each with a spoken label); active icon blue with a small dot; a raised pale-blue Simulate button in the middle. Hidden on full-screen flows.
- **Settings (Profile):** a profile card, then groups of rows (pale-blue bubble, label, value, chevron or switch) in white cards; choices open in bottom sheets.
- **Inputs:** grey wells, `radius.md`, 1.5px blue border on focus. Choice lists are separate rounded rows with a radio circle; the selected row is pale blue with a blue border.
- **Type:** Host Grotesk. Regular for big numbers and the Welcome headline, Medium for titles, names and buttons. Body never below 16.
- **Icons:** Lucide at strokeWidth 1.75.

## Copy

Follow `docs/copy.md`. App words, not PRD words: "Send it now", "Hold for review", "Stop this payday", "Pause everything", "Is this pay?", "Autopilot", "Sent", "Fully paid", "Part paid", "Didn’t go", "Leftovers", "Backup account", "Move to your account", "Log in", "Profile". The PRD is never rewritten. `₦850,000` (never N or NGN); account numbers last 4 digits only; plain Nigerian English, sentence case, curly apostrophes, no exclamation marks or emoji.

## Building in React Native

Pressable targets at least 44x44 with accessibility labels on icon-only buttons; safe areas via react-native-safe-area-context; status words read out the same as shown (`badgeWords`). Fonts from `@expo-google-fonts/host-grotesk`; charts with `react-native-svg`; no gradient library.

## Reviewing a screen

Compare with its Figma frame and `docs/design-system.md` section by section (header, cards, lists, buttons, nav, wording against `docs/copy.md`). List each difference as "what's wrong -> what it should be" and change nothing until the user picks which to fix.

## Never

No new colours, fonts or theme files without asking; no UI kits (Tamagui, NativeBase, Paper, NativeWind); no black hero or black nav (that was v3); no white text on sky blue; no teal or lime unless the founder switches back; no gradient text, per-category coloured cards or emoji. CLAUDE.md, the PRD and `docs/design-system.md` win over this skill.
