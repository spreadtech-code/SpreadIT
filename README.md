# SpreadIT

**Every payday, sorted before you spend it.**

SpreadIT is a mobile app for Nigerian earners. When pay lands, it automatically splits the money across the person's commitments (family support, rent, tithe, savings, investment, everyday spending) and sends each amount to its account, before any of it can be spent.

> **This repository is a front-end prototype.** It runs entirely on pretend money and a fake bank. Nothing in it moves real money, checks a real BVN or sends a real SMS. Its job is to let the team tap through every screen and flow on a real phone. An engineer will later connect a real server and banking partner.

---

## What you can do in the prototype

- **Sign up and get set up:** phone number, a pretend SMS code, a 6-digit PIN and pay details.
- **Build a plan:** rules in priority order (fixed amounts or a percentage of pay), each sending to a bank account, plus a leftovers account and a backup account.
- **Try a payday:** a simulator that splits any amount with the real bank fees, updating live as you type or slide.
- **Turn on Autopilot:** where your money is held, a pretend identity check, then your own SpreadIT account.
- **Get paid (pretend):** a countdown before the split goes out, with *Send it now*, *Hold for review* and *Stop this payday*. It also covers short paydays, "Is this pay?" and failed, retried and returned transfers.
- **Follow the money:** a split donut on Home, activity history, payday details, receipts, a monthly recap and notifications.
- **Stay in control:** pause everything, 6-digit codes for sensitive changes, PIN and face unlock settings, change PIN and forgot password.

## Quick start

You need [Node.js](https://nodejs.org) (a recent LTS; the project is developed on Node 26) and the free **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) · [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)).

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iPhone). Your phone and computer must be on the same Wi-Fi; if they can't be, use `npx expo start --tunnel`.

### Demo tips

| To… | Do this |
| --- | --- |
| Fire a pretend payday, short payday, failed transfer or reversal | On Home, **hold the greeting ("Hi, …") for 1 second** to open **Demo controls** |
| See every UI component | On Profile, **hold the "Profile" title for 1 second** |
| Get an SMS code | Codes are shown on screen as a **"Pretend SMS"** card |
| Pass the identity check | Any 11-digit BVN works. Ending `000` = not found, `111` = name doesn't match, `222` = date of birth doesn't match |
| See "Account not found" | Enter an account number ending in `0000` |
| Start over | Components screen → **Reset demo data** |

## Tests

```bash
npx jest          # 219 tests
npx tsc --noEmit  # type-check (TypeScript strict mode)
```

The split engine is covered first, because every payday depends on it:

- **Tunde's ₦850,000 payday** with his 6 rules gives exactly ₦875 in fees and the right amount for every rule.
- **Allocations plus fees always equal the income, to the kobo.**
- **A short payday** (below 50% of expected) waits for the user. Between 50% and 99%, rules are paid in priority order as Fully paid, Part paid or Skipped.
- **A larger payday** sends the extra to the leftovers account.
- **Percentage rules** use gross pay.
- **Once-a-month rules** skip on a second payday in the same month.
- **Percentages over 100%** are rejected.

Other tests cover the fake bank, payday flows, security rules, the notification inbox and account recovery.

## Tech stack

- [Expo](https://expo.dev) SDK 58 (React Native) with **TypeScript** in strict mode
- **Expo Router** for file-based navigation
- **Zustand** for app state (saved on the phone with AsyncStorage)
- **Jest** (jest-expo) for tests
- **Host Grotesk** font, **Lucide** icons, **react-native-svg** for the split donut
- Light mode only; runs in Expo Go on iOS and Android (no web build)

## Project structure

```
app/              Screens and routes (Expo Router); (tabs)/ holds Home, Plan, Activity and Profile
src/engine/       The split engine: pure functions, no UI, fully tested
src/fakebank/     The fake bank: incoming pay, recipients, transfers, failures, account-name lookup
src/payday/       Payday events, alerts and notifications, one-off transfers, monthly recap
src/state/        App state: account, PIN, plan, Autopilot, security and sensitive changes
src/data/         Fee schedule, banks, categories, demo users, partner and support details
src/components/   Shared UI components (one per component in docs/design-system.md)
src/theme/        tokens.ts: every colour, size, font and shadow
src/lib/          Helpers: pay dates, form checks, wording, auto-lock
docs/             Product spec, design system, app wording
assets/           App icon and splash screen
```

## Ground rules in the code

- **Money is whole kobo integers.** No floating-point money anywhere; naira only for display (`₦1,234,567`, with `.50` only when there are kobo).
- **Fees come from `src/data/feeSchedule.ts`**, never typed into the code. The rates are Paystack's (Nov 2026):
  - inflow: 1%, capped at ₦300
  - transfer of ₦5,000 or less: ₦10
  - transfer of ₦5,001–₦50,000: ₦25
  - transfer above ₦50,000: ₦50
  - stamp duty: ₦50 on each transfer of ₦10,000 or more
- **The split engine is pure and deterministic:** the same pay, plan and fee schedule always give the same result.
- **Every colour, size and font comes from `src/theme/tokens.ts`.** Screens never type a hex value or pixel size.
- **Account numbers show only the last 4 digits.**

## Design and wording

- **Figma:** [SpreadIT — App designs](https://www.figma.com/design/RDclWHQYxigUF1xz6zQFuk), page "v4 Screens", colour mode "Blue". Screens are grouped by area, with *New user* and *Existing user* flows wired as a clickable prototype.
- **[`docs/design-system.md`](docs/design-system.md):** colours, type, spacing and every component.
- **[`docs/copy.md`](docs/copy.md):** the app's plain, app-style words for each product-spec term (for example *Send it now* for "Execute now", *Is this pay?* for "Is this income?").

## For the engineer

The prototype is built so the real backend can slot in behind it:

- **Bank partner:** the fake bank exposes the same five calls a real partner would: `receiveIncome`, `createRecipient`, `sendTransfer`, `getTransferStatus` and `resolveAccountName` (`src/fakebank/`). Swap in the real partner behind the same functions.
- **What is pretend today:**
  - SMS codes and email links
  - the BVN identity check
  - push notifications (shown in-app)
  - sign-in, which checks the one account saved on the phone. Passwords and PINs are only scrambled with `prototypeHash` in `src/lib/secrets.ts`; this is **not** real security and must be replaced.
  - the support WhatsApp number and email
  - the Terms and privacy text
- **Open product questions:** the banking partner (OQ-1), the custody model (OQ-11), pricing (OQ-15, OQ-16) and the retry window (OQ-17). These are tracked in the product spec.

**Out of scope for this release:** AI features, a web app, expense tracking, cards, loans, investment advice, the daily allowance (D12) and real payments of any kind.

## Documentation

| File | What it is |
| --- | --- |
| [`docs/PRD.md`](docs/PRD.md) | The product spec (PRD v1.1): features, screens S1–S30, flows and acceptance tests |
| [`docs/design-system.md`](docs/design-system.md) | The visual source of truth |
| [`docs/copy.md`](docs/copy.md) | The app's wording |
| [`CLAUDE.md`](CLAUDE.md) | Working rules for building this repo |
