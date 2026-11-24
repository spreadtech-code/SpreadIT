# SpreadIT design system

> Source of truth: the SpreadIT design system on claude.ai. Values here match `src/theme/tokens.ts`. Visual references: `docs/references/`.

SpreadIT splits a user's income across their commitments the moment it arrives. The interface should feel calm and exact: white cards floating on a cool mist background, one fresh aqua accent, and the amount always at the centre.

Version 2 follows the founder's direction: **light mode only**, the **Source Sans 3** typeface, and an **aqua** brand colour and card language taken from the Glo reference (centred balance, round action buttons, a callout pill hanging off the hero card, grouped lists inside large rounded cards). The white space and restraint of the earlier references carry over, and so does the floating nav.

## Principles

1. **Float on mist.** Every screen is `canvas` (cool grey) with white `surface` cards at `radius-lg` or `radius-xl`. Cards separate content; dividers are only hairlines inside a card.
2. **One aqua thing per screen.** `brand` is a fill, never text: the primary button, the active nav item or the hero's avatar. Text on aqua is always `ink`.
3. **The amount is centred and heavy.** The hero amount is Source Sans 3 at 800 weight, centred, with kobo small on the baseline.
4. **Quiet line, then the point.** A muted label ("Last payday · 25 November") above the thing that matters.
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
| Background | `canvas` | Behind every screen |
| Cards | `surface` | Cards, list groups, sheets, the nav |
| Wells | `surface-sunken` | Round buttons, icon circles, inputs, secondary buttons |
| Text | `ink`, `ink-muted` | Primary and secondary text |
| Brand fill | `brand` (aqua) | One filled element per screen; text on it is `ink` |
| Brand tints | `brand-mid`, `brand-soft` | The hero callout; insight cards and Processing badges |
| Brand text | `brand-strong` (deep teal) | Links, quiet buttons, focus rings, text on tints |
| States | `success`, `warning`, `critical` + `-soft` | Badges, money in, hints, failures |

Aqua is too light to be text or a thin line on white (1.5:1). Anything that must be read in brand colour uses `brand-strong`. Every text pair in this system passes 4.5:1.

## Type: Source Sans 3

Source Sans 3 by Adobe, a clear, open humanist sans. It is free under the SIL Open Font License, which allows embedding in iOS and Android apps, so there is nothing to buy. Its figures are clean and even, which suits a money app.

Weights used: Regular (400) for body and labels, SemiBold (600) where Bold feels heavy in long lists, Bold (700) for names, buttons and section titles, ExtraBold (800) for titles and amounts.

- Amounts: `amount-xl` 44px, `amount-lg` 30px, `amount-md` 17px, tabular figures.
- Headings: `title` 28px, `title-sm` 22px, `headline` 17px.
- Text: `body` and `body-strong` 16px (the floor for anything a user must read); `label` 14px; `caption` 13px for badges, nav labels and times only.

## Space, shape and depth

- 4px base, `space-1` to `space-12`. Screen margin and card padding `space-5` (20px).
- Large, soft radii: cards `radius-lg` (24px), the hero and sheets `radius-xl` (32px), pills for buttons, badges, the callout and the nav.
- `shadow-card` is wide and faint; `shadow-float` only for the nav, sheets and toasts.

## Layout patterns

- **Home (S15):** BalanceHero card with its callout, an InsightCard, then an ActivityList card. FloatingNav over the bottom.
- **Plan (S6):** `title`, then RuleCards in priority order, `space-3` apart; one primary button at the bottom.
- **Payday (S16):** full-screen PaydayCountdown card, centred, no nav.
- **Lists (history, settings):** ActivityList cards.
- **Forms:** one question per screen; AmountField and SegmentedControl; the primary button pinned above the keyboard.

## Iconography

Line icons on a 24px grid, 1.75 stroke, round caps, in `ink` inside `surface-sunken` circles. In the app use **Lucide** (`lucide-react-native`, `strokeWidth={1.75}`). No filled, coloured or 3D icons; no emoji. No logo yet: the wordmark is "SpreadIT" in Source Sans 3 ExtraBold.

## Accessibility (PRD 4.1)

Body text 16px minimum; layouts hold at 200% text size; touch targets 44 × 44 or larger; text contrast 4.5:1; every status in words; icon-only buttons labelled; focus is a 2px `canvas` gap plus a 2px `brand-strong` ring.

## Components

Button, RoundAction, BalanceHero, RuleCard, StatusBadge, ActivityList, InsightCard, PaydayCountdown, SegmentedControl, AmountField, FloatingNav. Added in stage 3 with the founder's approval: TextField, PinField, Toggle, OptionList. Added in stage 4 with the founder's approval: Slider, CostEstimate. Added in stage 5 with the founder's approval: Sheet, AlertBanner. The previews are HTML for review; the app rebuilds them in React Native.

## Building it in the Expo app

1. `src/theme/tokens.ts` holds every value from `tokens.json` as named constants. Screens never type a colour, size or font name.
2. Install `@expo-google-fonts/source-sans-3` and load Regular, SemiBold, Bold and ExtraBold with `useFonts` before the first screen renders.
3. Light mode only: set `"userInterfaceStyle": "light"` in the Expo app config so the phone's dark mode doesn't change the app.
4. FloatingNav: a custom `tabBar` for Expo Router's `Tabs`, 20px from each side, 16px above the safe-area bottom.
5. Shadows: iOS takes the shadow values; on Android use `elevation` 3 for `shadow-card` and 6 for `shadow-float` (lowered from 12 by the founder: 12 drew a hard grey slab on Android).
6. In CLAUDE.md: "Follow docs/design-system.md and src/theme/tokens.ts for every colour, size and font. Light mode only. Ask before adding a new colour."

## Token values

| Colour token | Hex | Use |
| --- | --- | --- |
| `canvas` | #EEF2F3 | Page background behind every screen: a cool mist grey, taken from the Glo reference. White cards float on it. |
| `surface` | #FFFFFF | Cards, sheets, the floating nav, list groups. |
| `surfaceSunken` | #E4EAEC | Round action buttons, icon circles, input wells, the segmented track. |
| `line` | #DCE3E5 | Hairlines between rows inside a card. Decorative only. |
| `ink` | #12191B | Primary text and amounts, on every surface including brand fills (11.6:1 on brand, 15:1 or more elsewhere). |
| `inkMuted` | #5A6669 | Secondary text: labels, metadata, button captions. 4.9:1 or more on every surface here. |
| `brand` | #6EE2E6 | SpreadIT aqua. A fill only, never text: the primary button, the active nav item, the hero callout's dot. Text on it is always ink. At most one filled brand element per screen. |
| `brandMid` | #B8EEF0 | The hero callout pill and the split bar's second segment. Text on it is ink. |
| `brandSoft` | #E3F8F9 | Tinted cards: insights, the selected row, Processing badges. |
| `brandStrong` | #0A6E73 | Deep teal for text and icons that must read as brand: links, quiet buttons, focus rings, text on brand-soft (5.3:1 or more on white, canvas and brand-soft). |
| `onBrand` | #12191B | Text and icons on a brand fill. Aqua is light, so this is always ink, never white. |
| `success` | #127A3E | Money in (+₦), Successful, Fully funded. |
| `successSoft` | #E8F6EE | Fill behind success badges. |
| `warning` | #8F5200 | Retrying, Partly funded, Reversed, the stamp-duty hint. |
| `warningSoft` | #FFF4E0 | Fill behind warning badges and hints. |
| `critical` | #B4232B | Failed, Paused, Emergency pause, destructive actions only. |
| `criticalSoft` | #FDECEC | Fill behind critical badges and the Emergency pause button. |
| `scrim` | rgba(18, 25, 27, 0.40) | Behind bottom sheets and the PIN prompt. |
| `focusRing` | #0A6E73 | Focus: a 2px canvas gap, then a 2px deep-teal ring (aqua is too light to see on white). |

| Text style | Size / line | Weight | Use |
| --- | --- | --- | --- |
| `amountXl` | 44px / 48px | 800 | The hero amount, centred, Source Sans 3 ExtraBold. Kobo follow at 18px on the baseline (Glo style). |
| `amountLg` | 30px / 36px | 800 | Simulator totals and the payday countdown. |
| `amountMd` | 17px / 24px | 700 | Amounts in rows and rule cards. |
| `title` | 28px / 34px | 800 | Screen titles. One per screen. |
| `titleSm` | 22px / 28px | 700 | Card and section titles ("Transactions" in the reference). |
| `headline` | 17px / 24px | 700 | Row titles, rule names. |
| `body` | 16px / 24px | 400 | All running text. 16px is the floor (PRD 4.1). |
| `bodyStrong` | 16px / 24px | 700 | Buttons and emphasis. |
| `label` | 14px / 20px | 400 | Field labels, meta lines, captions under round buttons. |
| `caption` | 13px / 18px | 700 | Badges, nav labels, timestamps only. |

Spacing: `space[1]` 4px, `space[2]` 8px, `space[3]` 12px, `space[4]` 16px, `space[5]` 20px, `space[6]` 24px, `space[8]` 32px, `space[12]` 48px.

Radius: `radius.sm` 12px, `radius.md` 18px, `radius.lg` 24px, `radius.xl` 32px, `radius.pill` 999px.

## Component specs

Build each as a React Native component in `src/components/`, named as below.

### ActivityList

Rows grouped inside one white card with a `title-sm` header and hairlines between rows, from the Glo reference. Used for Activity, income history and settings lists.

- Each row: a 40px `surface-sunken` icon circle, a bold name, a muted meta line, and the amount on the right.
- Money in: down-left arrow, `+₦` in `success`, no badge. Money out: up-right arrow, amount in `ink`, a status badge.
- Hairlines start after the icon, never across it.
- Account numbers show only the last 4 digits.

### AmountField

Naira entry in the rule editor, send extra and the simulator.

- ₦ fixed in `ink-muted`; the amount in 30px heavy with thousands separators.
- The helper always shows the real transfer cost ("Costs ₦100 to send").
- From ₦10,000 to ₦10,999 a `warning` hint replaces it: "Send ₦[n] less to save ₦50 stamp duty".
- Focus: `brand-strong` border plus a 3px `brand-soft` halo.

### BalanceHero

The top of Home: one large white card (`radius-xl`) on the mist canvas, everything centred, as in the Glo reference.

- Top row: the SpreadIT wordmark on the left, the user's initials in an aqua circle on the right.
- A muted label ("Last payday · 25 November"), then the amount in `amount-xl` with kobo at 18px on the baseline.
- RoundActions under the amount.
- The callout: a `brand-mid` pill that hangs half off the card's bottom edge, carrying the automation status ("Automation on · next payday in 30 days"). When paused it reads "Automation paused" with a `critical` dot. Leave 40px under the card for it.

### Button

Buttons are pills, 56px tall, sentence case, verb first ("Execute now", "Send to my account").

- **Primary**: `brand` aqua fill with `ink` text, never white. The one thing the screen is for; at most one per screen.
- **Secondary**: `surface-sunken` fill, `ink` text, no border. The safe alternative, such as "Pause for review".
- **Quiet**: `brand-strong` text, no fill, for low-stakes actions like "Edit plan".
- **Critical**: `critical-soft` fill, `critical` text. Emergency pause and destructive actions only.
- Disabled buttons drop to 45% opacity and the screen says why.
- Full-width buttons stack with `space-2` between them, primary on top.

### FloatingNav

A white pill floating 16px above the safe-area bottom with `shadow-float`. Four destinations: Home, Plan, Activity, Profile, each an icon over a 13px label.

- The active item is an aqua (`brand`) pill with `ink` icon and label; the rest are `ink-muted`.
- Content scrolls under it: give every scrolling screen a bottom inset of nav height + 16px + safe area.
- Hidden on full-screen flows: onboarding, the payday countdown, PIN and code prompts.

### InsightCard

A calm fact SpreadIT noticed, on a `brand-soft` card with no border. Title in `brand-strong`, one sentence in `ink`.

- Facts only, never advice.
- One at a time, below the hero.

### PaydayCountdown

The review window (S16): money received, the countdown, where it's going, and three choices. Full screen, centred, no nav.

- The countdown in `amount-lg`, `ink`.
- The split bar uses ink, deep teal, aqua and light aqua in priority order; it is decorative and hidden from screen readers. Exact naira follow in the list.
- Fees are their own line and match the fee schedule exactly.
- Buttons: Execute now (primary), Pause for review (secondary), Emergency cancel (quiet, `critical` text).

### RoundAction

Circular quick actions under the hero amount, from the Glo reference: a 56px `surface-sunken` circle with an `ink` icon, and a 14px caption underneath.

- Three per row on Home: Simulate, Send extra, Add rule, spaced `space-8` apart and centred.
- The caption is always shown; the circle carries an accessibility label too.
- Never fill a round action with aqua: the hero stays calm so the amount leads.

### RuleCard

One rule in the plan builder (S6) and simulator (S10): icon circle, name, meta line, amount, funding state, drag handle.

- Meta line order: rule type · priority · bank and last 4 digits.
- Funding badges show only in the simulator and payday screens.
- A Skipped rule shows ₦0 in `ink-muted`.
- Rules are separate white cards (they can be dragged); everything else uses the grouped ActivityList pattern.

### SegmentedControl

A two-way switch for rule type: Fixed amount or % of income. `surface-sunken` track; the selected option is a white pill with `shadow-card`. Each option is at least 44px tall and announces its pressed state.

### StatusBadge

Every transfer and funding state from the PRD, as a pill with an icon and a word. Colour never works alone.

| State | Tone |
| --- | --- |
| Successful, Fully funded | success |
| Processing | brand (`brand-soft` + `brand-strong`) |
| Pending, Sent to fallback, Skipped | neutral |
| Retrying, Reversed, Partly funded | warning |
| Failed, Paused | critical |

### Added in stage 3 (founder-approved, 23 November 2026)

Built only from existing tokens. All four appear on the hidden Components screen.

#### TextField

Text entry for phone, email, password, names and account numbers.

- A `surface-sunken` well (`radius-md`, at least 56px tall) like AmountField, with the label above in `label` / `ink-muted`.
- Focus: 2px `brand-strong` border plus a 3px `brand-soft` halo.
- Error: a `critical` border, and an icon plus `critical` text under the field. Never colour alone.
- Optional fixed suffix (e.g. `%`) in `ink-muted`.

#### PinField

The 6-digit PIN and the SMS code.

- 6 `surface-sunken` boxes (44 × 56, `radius-sm`) over the phone's number keyboard.
- PIN digits show as `ink` dots; an SMS code shows the digits.
- The box being typed in gets the 2px `brand-strong` ring. Errors as TextField.

#### Toggle

An on/off row: `headline` label, optional `label` description, switch on the right.

- On is `brand-strong` (deep teal), never aqua, so the one-aqua rule holds when there are many switches.
- The whole row is the touch target (44px or more) and announces on/off.
- Disabled drops to 45% opacity and shows the reason.

#### OptionList

Pick one option: income type, frequency, bank.

- A white card (`radius-lg`, `shadow-card`) of rows at least 56px tall, with hairlines between them.
- The selected row is `brand-soft` with a `brand-strong` check. Rows can carry a `label` description.

### Added in stage 4 (founder-approved, 23 November 2026)

Built only from existing tokens. Both appear on the hidden Components screen.

#### Slider

The what-if slider on the Payday Simulator (C5). Uses `@react-native-community/slider`, which runs in Expo Go.

- `headline` label on the left, the current value in `body-strong` / `brand-strong` on the right. The value is always written out, never shown by the thumb's position alone.
- Filled track and thumb in `brand-strong` (deep teal), never aqua; the empty track is `line`. The touch area is at least 44px tall.
- The end values sit under each end in `label` / `ink-muted`.
- Screen readers treat it as adjustable and read the written value.

#### CostEstimate

The monthly cost line (C6) on the plan builder and the simulator.

- Normal: a receipt icon and the sentence in `body` / `ink-muted`.
- Above 1% of income: the warning-hint style (`warning-soft` fill, `warning` icon and text), then a quiet "Ways to lower your costs" button.
- That button opens a bottom sheet (`surface`, `radius-xl` top corners, `scrim` behind) with numbered tips and a secondary "Got it" button.

### Added in stage 5 (founder-approved, 24 November 2026)

#### Sheet

A bottom sheet for short explainers and tips ("Ways to lower your costs", the S11 explainer).

- `surface` panel with `radius-xl` top corners over a `scrim`; at most 85% of the screen tall, scrolling inside.
- `title-sm` heading, `body` text, then a secondary "Got it" button. Tapping the scrim also closes it.

#### AlertBanner

The prototype's pretend push notification ("Income received", "Is this income?"). Real pushes come later.

- A white `surface` card (`radius-lg`, `shadow-float`) that slides down under the status bar, over any screen.
- An icon in a `surface-sunken` circle, a `headline` title and a `label` line, plus a close button (44px).
- Tapping it opens the screen it names. One at a time; the newest waits behind the one showing.
