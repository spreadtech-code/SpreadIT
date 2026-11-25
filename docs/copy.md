# SpreadIT app wording (copy.md)

The PRD (`docs/PRD.md`) stays as it is: it is the spec and uses formal product words. The app speaks plainer, app-style English. This file maps each PRD term to the word the app shows. It was set by the founder on 25 Nov 2026 with the v4 design in Figma.

**Rules**

- The app's on-screen wording follows this file. If a PRD term isn't listed here, use the PRD's exact wording.
- Internal names in code stay as they are (for example the `'Fully funded'` funding state, `'Sent to fallback'` transfer status, the `automation` store key and route names like `/switch-on-automation`). Only what people see or hear changes. `StatusBadge`'s `badgeWords` turns each state into its app word, and screen readers hear the same word.
- Plain Nigerian English, short sentences, curly apostrophes (’). Say "pay" for the money that lands, "payday" for the event.
- Status is never colour alone: the word is always there too.

## Status words (StatusBadge)

| PRD / code state | App shows |
| --- | --- |
| Successful | Sent |
| Fully funded | Fully paid |
| Partly funded | Part paid |
| Skipped | Skipped |
| Processing | Sending |
| Pending | Queued |
| Sent to fallback | Sent to backup |
| Retrying | Trying again |
| Reversed | Returned |
| Failed | Didn’t go |
| Paused | Paused |

## Payday states (Activity, Payday details)

| Code stage | App shows |
| --- | --- |
| askIncome | Is this pay? |
| needsApproval | Needs your OK |
| review | Waiting to send |
| held | On hold, not split yet |
| sending | Sending |
| done | Done |
| notIncome | Not pay, not split |
| cancelled | Stopped, not split |
| tooSmall | Too small to split |

## Actions and buttons

| PRD wording | App shows |
| --- | --- |
| Execute now | Send it now |
| Pause for review | Hold for review |
| Emergency cancel | Stop this payday |
| Emergency pause | Pause everything |
| Run in priority order | Pay in order |
| Hold (S17) | Hold it for now |
| Send to my account | Move to your account (Home, payday) / Move unsplit money (Profile) / Move with PIN (button) |
| Switch on automation | Turn on Autopilot |
| Run simulation | (none: the split updates as you type or slide) |
| Run simulator | Simulate a payday |
| Sign up | Get started |
| Sign in | Log in |
| Sign out | Log out |
| I understand (S11) | Got it |
| Yes / No (S18) | Yes, split it / No, keep it |
| Submit code | Verify (sign-up) / Confirm (changes) |
| Resend code | Send it again |
| Create letter / Share letter | Create the letter / Share the letter |
| Save rule / Delete rule | Save / Delete |
| Add category | Add a category |

## Names of things

| PRD term | App word |
| --- | --- |
| Automation (On / Paused / Off) | Autopilot (on / paused / off) |
| Automation On · next payday… (E1) | Autopilot on · next payday 25 December |
| Remainder | Leftovers |
| Remainder destination | Leftovers account |
| Fallback account | Backup account |
| Review window | Review time (Profile) / time to check each payday (S14) |
| Qualifying minimum | Your minimum |
| One-time code | 6-digit code |
| Income (the money that lands) | Pay |
| Income received | Pay landed / Payday’s here |
| Income event | Payday |
| Settings (S22) | Profile |
| Income history (S19) | Activity |
| Payday Simulator (S10) | Try a payday |
| Salary-switch kit (S27) | Move your salary here |
| Send extra once (S28) | Send extra to … |
| Monthly summary (S30) | Your <month> (recap) |
| Identity check (S12) | Verify it’s you |
| Forward mode setup (S26) | Forward your pay |

## Screen titles

| Screen | Title in the app |
| --- | --- |
| S1 Welcome | Every payday, sorted before you spend it. |
| S2 Sign up | What’s your number? / What’s your email? / Choose a password / When were you born? |
| S3 Verify | Check your messages |
| S4 Set PIN | Create your PIN / Enter it again / Unlock with face or fingerprint? |
| S5 Income setup | How much lands each payday? (and the other steps) |
| S6 Plan builder | Your plan |
| S7 Rule editor | The rule’s name (e.g. Mum) |
| S8 Add destination | Choose the bank / Which account? |
| S9 Remainder and fallback | Leftovers & backup |
| S10 Payday Simulator | Try a payday |
| S11 Where your money is | Your money stays yours |
| S12 Identity check | Verify it’s you |
| S13 Your SpreadIT account | You’re all set, Tunde |
| S14 Switch on automation | Turn on Autopilot |
| S15 Home | Hi, Tunde |
| S16 Payday | Payday’s here |
| S17 Short payday review | This payday is short |
| S18 Is this income? | Is this pay? |
| S19 Income history | Activity |
| S20 Income event | Payday details |
| S21 Transfer receipt | Receipt |
| S22 Settings | Profile |
| S23 Verify change | Enter the code |
| S24 Emergency pause | Pause everything? |
| S25 Get help | Need a hand? |
| S26 Forward mode | Forward your pay |
| S27 Salary-switch kit | Move your salary here |
| S28 Send extra once | Send extra to Mum |
| S29 Send to my account | Move to your account |
| S30 Monthly summary | Your November |
| S31 Sign in | Welcome back |
| S32 Unlock | Hi again, Tunde |
| Notifications (founder addition) | Notifications |
| PIN and face unlock (founder addition) | PIN and face unlock / Change PIN: Enter your current PIN, Choose a new PIN, Enter it again |
| Terms and privacy (founder addition) | Terms and privacy / Terms of use, Privacy notice, How your money is held, Fees |
| Forgot password (founder addition) | Reset your password / Choose a new password |

## Short lines used across the app

- Home status: “Payday’s done. Everything’s sent.”
- Plan and rule editor: “Changes start from your next payday.”
- Welcome: “Every payday, sorted before you spend it.”
- Countdown: “until it sends by itself”
- Short payday: “₦340,000 landed. That’s less than half your usual ₦850,000, so nothing moves until you choose.”
- Change alerts: “Wasn’t you? Tap to pause everything.”
- Cost line (C6): “This plan costs about ₦875 a month (0.10% of your pay)”
