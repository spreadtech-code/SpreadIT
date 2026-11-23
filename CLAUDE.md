# SpreadIT — Claude Code ground rules

## What this project is

SpreadIT is a mobile app for Nigerian earners. When income arrives, it automatically splits the money across the user's commitments (family support / Black Tax, rent, tithe, savings, investment, everyday spending) and sends each amount to its destination.

**This repo is a front-end prototype only.** It runs entirely on pretend money and a fake bank. Its job is to let the founder tap through every screen and flow on a real phone. An engineer will later connect a real server and banking partner.

## Source of truth

- `docs/PRD.md` is the product spec (PRD v1.1). Read the relevant section before building any screen or feature.
- Screens are numbered S1–S30 (PRD section 3.4). Features have IDs such as A9 and D7 (PRD section 3.2).
- Each feature's "Done when" in the PRD is its acceptance test. A feature is not finished until its "Done when" passes in the prototype.
- If the PRD is unclear or two parts disagree, **stop and ask me**. Don't guess.

## Tech stack (decided — don't change without asking)

- Expo (React Native) with TypeScript, strict mode on
- Expo Router for navigation (file-based routes)
- Zustand for app state
- Jest for tests
- Runs in Expo Go on iOS and Android. No web build.
- Font: `@expo-google-fonts/source-sans-3` (Regular, SemiBold, Bold, ExtraBold), loaded with `useFonts` before the first screen.
- Icons: `lucide-react-native` at `strokeWidth={1.75}`.
- Light mode only: set `"userInterfaceStyle": "light"` in the Expo app config.
- Ask before adding any other library, and say why it's needed.

## Folder structure

```
app/              Screens and routes (Expo Router). One file per screen, named after the PRD screen.
src/engine/       The split engine: pure functions, no UI, fully tested.
src/fakebank/     The fake bank: account numbers, incoming payments, transfers, failures.
src/data/         Fee schedule, bank list, demo users (Tunde, Chiamaka, Emeka, Folake).
src/components/   Shared UI components, one per component in docs/design-system.md.
src/theme/        tokens.ts: every colour, size, font and shadow. Copied from the design system; don't edit values without asking.
docs/             PRD.md, design-system.md and notes.
docs/references/  Screenshots of reference apps the design is based on. Look, don't copy.
```

## Design (read before building any screen)

- `docs/design-system.md` is the visual source of truth. Read it before building or changing any screen.
- Every colour, size, radius, shadow and font comes from `src/theme/tokens.ts`. Never type a hex value, pixel size or font name in a screen.
- **Light mode only.** No dark theme.
- Background is `colors.canvas`; content sits in white `colors.surface` cards with `radius.lg` (24) or `radius.xl` (32).
- Aqua (`colors.brand`) is a fill only, never text, and at most one aqua element per screen. Text on aqua is `colors.ink`. Brand-coloured text uses `colors.brandStrong`.
- Build the components listed in `docs/design-system.md` first, in `src/components/`, then compose screens from them. Don't invent new components or colours; ask.
- `docs/references/` shows the look we're aiming for (light, airy cards, centred amount, round actions, callout pill, floating nav). Match the feel, never copy another brand's logo, name or content.
- If the design system and the PRD disagree, the PRD wins on behaviour and wording; the design system wins on look. If unsure, ask.
- The design system, PRD and CLAUDE.md always win over any installed UI skill.

## Hard rules

1. **No real money, no real APIs.** No Paystack, no real BVN checks, no real SMS. Everything goes through `src/fakebank/`.
2. **The fake bank uses the same shape a real partner would.** It has these functions: `receiveIncome`, `createRecipient`, `sendTransfer`, `getTransferStatus`, `resolveAccountName`. The engineer will swap in a real partner behind the same functions.
3. **Money is whole kobo integers.** Never use floating-point numbers for money. Convert to naira only for display.
4. **Display naira as `₦1,234,567`**, with an extra `.50` only when there are kobo.
5. **The split engine is pure and deterministic.** The same income, plan and fee schedule always give the same result. It never touches the UI or the fake bank directly.
6. **Fees come from `src/data/feeSchedule.ts`, never hard-coded.** Use these Paystack rates (PRD 4.1):
   - inflow: 1% of the payment, capped at ₦300
   - transfer of ₦5,000 or less: ₦10
   - transfer of ₦5,001–₦50,000: ₦25
   - transfer above ₦50,000: ₦50
   - stamp duty: ₦50 on each transfer of ₦10,000 or more
7. **Allocations + fees must equal income to the kobo** on every split. Write a test that checks this.
8. **Out of scope:** AI features, web app, expense tracking, cards, loans, investment advice, the daily allowance (D12), real payments of any kind.

## Split engine must pass these tests before any payday screen is built

- Tunde: ₦850,000 with his 6 rules (PRD 2.2 and case 1 of the validity debate) gives fees of ₦875 and the right amount per rule.
- Short payday: income below 50% of expected pauses the split (D4). From 50% to 99% it runs in priority order with labels Fully funded / Partly funded / Skipped.
- Larger payday: the extra goes to the remainder (D5).
- Percentage rules use gross income (B4). Rules run in the user's priority order, fixed and percentage together (B6).
- Once-per-month fixed rules skip on the second income in a month (B5).
- Percentages over 100% are rejected (B10).

## Build order (one stage at a time — stop for my review after each)

1. **Skeleton and theme:** set up Expo Router, `src/theme/tokens.ts`, the Source Sans 3 font and the floating nav. Then all 30 screens as placeholder pages on `colors.canvas`, with their PRD name and number, linked by the flows in PRD 3.4. I should be able to tap through the whole app.
1b. **Components:** build every component in `docs/design-system.md` in `src/components/`, plus a hidden "Components" screen that shows them all so I can check them on my phone.
2. **Split engine + fee schedule + tests** (`src/engine/`, `src/data/`).
3. **Onboarding and plan builder:** S1–S9.
4. **Payday Simulator:** S10, including the what-if slider and the monthly cost estimate (C1–C6).
5. **Fake bank + payday flows:** S11–S18. Add a hidden "Demo controls" menu to fire a payday, a short payday, a payment below the minimum, a failed transfer and a reversal.
6. **Dashboard, history, receipts, summary:** S15, S19–S21, S30.
   - *Order change (founder decision, 23 Nov 2026):* S15 Home was built early, after stage 4, using a temporary demo payday (`src/fakebank/demoPayday.ts`). Stage 5 wires it to real fake-bank paydays and removes the demo.
7. **Settings, security and v1.1 features:** S22–S29 (Forward mode, salary-switch kit, send extra once, skip once, send to my account, pause).

## UI rules (PRD 4.1)

- Body text at least 16pt. Touch targets at least 44×44 points.
- Text contrast at least 4.5:1 (the design system's colour pairs already pass).
- Status is never shown by colour alone: always show the word too (for example "Failed").
- Every button and status has an accessibility label for VoiceOver and TalkBack.
- Screens must work from 4.7-inch to 6.9-inch phones, portrait only.
- Copy: plain Nigerian English, short sentences. Use the exact wording the PRD gives (for example "Is this income?", "Send to my account").
- Masked account numbers show only the last 4 digits.

## Working rules

- Before each stage, tell me your plan in 5 bullets or fewer and wait for my OK.
- Keep each change small. After each stage: run the tests, make sure the app starts in Expo Go, and summarise what to tap to check it.
- Commit to Git after each working stage, with a message naming the screens or feature IDs (for example "S10 simulator: C1, C3, C4").
- Never delete or rewrite `docs/PRD.md`.
- I'm not an engineer. Explain errors and choices in plain language.

## Commands

- Start the app: `npx expo start` (then scan the QR code with Expo Go)
- Run tests: `npx jest`
