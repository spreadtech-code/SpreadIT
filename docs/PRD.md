# SpreadIT — Product Requirements Document v1.1

Nov 21, 2026 · @SpreadIT

SpreadIT splits a user's income across their commitments the moment it arrives, before any of it can be spent. Version 1.1 revises v1.0 after the [Product Validity Debate](https://claude.ai/artifact/PzZ4UDC9cBDDZ2BzuMFAJ7): it adopts all 12 changes the debate recommended, which adds 12 features (52 in v1.0, 64 in v1.1). The release is still iOS and Android, no AI, in 3 stages, but the live-money stage is now blocked until the custody question (OQ-11) is settled by a lawyer.

**What changed from v1.0:**

- **Custody:** SpreadIT must not hold user money. The partner must open accounts in the user's own name, or SpreadIT enters through a licensed route. Live money waits for a legal opinion.
- **Fees:** the simulator and every payday use the partner's real fee schedule, including ₦50 stamp duty on transfers of ₦10,000 or more.
- **Getting income in:** new Forward mode works from day 1, before any payroll change, and a salary-switch kit helps users move their salary later.
- **Failures:** temporary failures retry for up to 6 hours before fallback, and family rules can be set to keep trying.
- **Real life:** one-off extras, skip-a-rule-once, weekly batching for freelancers, narration in the user's name, a way to move unsplit money out, and a monthly summary.

## Layer 1: What is this?

### 1.1 Product snapshot

| Field | Value |
| --- | --- |
| Product name | SpreadIT |
| One-sentence description | SpreadIT is a rules-based app that automatically carries out a user's financial plan, splitting each qualifying payment across family support, rent, tithe, savings, investments and everyday spending and sending each amount to its destination. |
| Tagline | Autopilot for your income. |
| Version | 1.1 |
| Date | 23 November 2026 (v1.0: 21 November 2026) |
| Product owner | TBD |
| Engineering owner | TBD |
| Design owner | TBD |
| Compliance owner | TBD |
| Document status | Revised after validity debate; draft for founder review |
| Target launch | TBD (see open questions) |
| Related documents | [Product Validity Debate](https://claude.ai/artifact/PzZ4UDC9cBDDZ2BzuMFAJ7) |

### 1.2 The problem

When a salaried Nigerian worker is paid, the whole salary lands in one account and every naira of it is available to spend. The plan in their head (send ₦40,000 to Mum, put ₦100,000 aside for rent, give 10% as tithe, save 15%) depends on them doing 4 to 6 manual transfers on payday, in the right order, before spending starts.

That plan fails in four specific ways:

1. **Willpower at the moment of spending.** Budget decisions are made at the till, at the moment temptation is highest. Money meant for savings is spent on whatever comes first.
2. **The hassle of manual transfers.** Logging into a banking app, entering 4 to 6 recipients and confirming each one takes effort. Users put it off by a day or a week, and the money is spent in the meantime.
3. **Guilt-driven family payments (Black Tax).** Support for parents, siblings and relatives is often decided on the spot, out of guilt or after a phone call. Amounts change month to month, other commitments go unfunded, and the user resents the obligation.
4. **Money leaking before it is saved.** Savings and investment come last because they are done last. By the time the user gets to them, the balance has been spent on everyday costs.

**Who feels it:** salaried workers, remote workers and freelancers in Nigeria who are paid in lump sums and carry fixed commitments to family, landlord, church and their own future.

**When:** in the first 72 hours after payday, when the full balance is in one place.

**What it costs them:** missed rent targets, savings that never build, strained family relationships, and month-end borrowing to cover gaps that a plan made on payday would have prevented.

**Why existing apps don't solve it:** PiggyVest (over 5.5 million registered users), Cowrywise AutoSave and Moniepoint automate saving, but into their own app. Rhapsody's split wallet divides money into save, spend and invest slots, also inside its own app. None of them pay a set amount, in a set order, to accounts outside the app: a mother's bank account, a landlord fund, a church. That is SpreadIT's difference. A bank could copy the feature, so SpreadIT's lasting advantage has to be trust, the Black Tax habit, and later a payroll channel.

### 1.3 Goals and success metrics

The headline target is 99.5% of payouts succeeding with no manual help. All other targets below are proposed defaults and are marked as assumptions until the founders confirm them.

| Goal | Metric | How it is measured | Target | Time frame |
| --- | --- | --- | --- | --- |
| Payouts execute without manual help | Payout success rate | Successful rule-based transfers ÷ transfers triggered by qualifying income | ≥ 99.5% | Every calendar month from the start of the live pilot |
| Family payments arrive on payday | Family delivery rate | Family-rule transfers successful within 6 hours of the income event ÷ all family-rule transfers | ≥ 99.5% \[ASSUMPTION\] | Every calendar month from the start of the live pilot |
| No user is paid twice from one income | Duplicate payouts | Count of transfers sent twice for the same rule and the same income event | 0 | Every calendar month from the start of the sandbox stage |
| Fees match what users were shown | Fee accuracy | Live paydays where actual fees equal the payday screen's fee line ÷ all live paydays | 100% | Every calendar month from the start of the live pilot |
| Users build a plan | Activation rate | Users who save a plan with 3 or more rules ÷ registered users | 60% \[ASSUMPTION\] | Within 14 days of sign-up |
| Users build a complete plan | Rules per user | Average count of active rules per user with a saved plan | 4 or more \[ASSUMPTION\] | Measured at the end of each release stage |
| Users reach a live payday | First live payday | Users with a first live income event split within 45 days of sign-up ÷ users who pass the identity check | 50% \[ASSUMPTION\] | Within 45 days of sign-up |
| Users reach a live payday | Days to first live payday | Median days from sign-up to first live income event | 30 days or fewer \[ASSUMPTION\] | Live pilot |
| Users move their salary in | Direct salary share | Active users whose salary is paid straight into SpreadIT (not forwarded) ÷ all active users | 30% \[ASSUMPTION\] | By the end of the live pilot |
| Users switch on automation | Automation adoption | Users who switch on live automation ÷ users with a saved plan | 40% \[ASSUMPTION\] | Within 30 days of saving a plan |
| Users keep using it | Retention across pay cycles | Users with automation still on after 3 pay cycles ÷ users who completed their first automated payday | 70% \[ASSUMPTION\] | After 3 pay cycles |
| Paused users come back | Resume rate | Users who resume within 14 days of pausing ÷ users who pause | 60% \[ASSUMPTION\] | Every calendar month |
| Users trust automated execution | Auto-execute share | Live paydays executed by countdown or "Execute now" without a pause ÷ all live paydays | 50% \[ASSUMPTION\] | By the end of the live pilot |
| Users understand the product | Simulator completion | Simulator beta users who run 3 or more simulations ÷ simulator beta users | 70% \[ASSUMPTION\] | During the simulator beta |
| Users will pay | Price acceptance | Simulator beta users who choose a paid option in the pricing test ÷ users shown the test | 30% \[ASSUMPTION\] | During the simulator beta |

## Layer 2: Who is it for?

### 2.1 Target users

**Primary users:** salaried workers and remote workers in Nigeria, aged 18 or over, who are paid a lump sum on a regular date (monthly or every 2 weeks) and carry fixed commitments to family, rent, church and savings.

**Secondary users:** freelancers and business owners, aged 18 or over, who receive 2 or more payments a month of varying size and want their commitments to scale with what they earn.

**Not for this release:**

- People under 18.
- Users outside Nigeria or paid in a currency other than naira.
- Users who want spending tracked or categorised after the fact.
- Users who want investment advice, loans or credit.
- Businesses paying staff or suppliers (B2B and payroll use is "Later").

**Income floor:** version 1.1 is designed for earners with ₦150,000 or more net a month \[ASSUMPTION: floor pending OQ-15\]. In the validity debate, a ₦120,000 earner paid 1.75% of income in fees and subscription. Users below the floor can still sign up; pricing (OQ-16) decides what they pay. No city or bank-usage limits apply.

### 2.2 User personas

| Field | Tunde Adeyemi | Chiamaka Okafor | Emeka Nwosu | Folake Bello |
| --- | --- | --- | --- | --- |
| Age | 29 | 34 | 31 | 45 |
| Job | Software engineer at a fintech | Nurse at a private hospital | Freelance product designer | Senior administrative officer, state civil service |
| City | Lagos (Lekki) | Abuja (Gwarinpa) | Port Harcourt | Ibadan |
| How and how often paid | ₦850,000 net salary, monthly, on the 25th | ₦420,000 net salary, monthly, on the 28th | 2 to 4 client payments a month, from ₦150,000 to ₦900,000 each | ₦310,000 net salary, monthly, usually between the 24th and the 30th |
| Monthly commitments | Mum ₦80,000; rent reserve ₦150,000; tithe 10%; savings 15%; investment ₦50,000 | Parents ₦40,000; siblings' school fees ₦60,000; tithe 10%; transport ₦60,000; savings ₦30,000 | Tax reserve 10%; savings 20%; investment 10%; Mum ₦30,000; rent reserve ₦80,000 | Tithe 10%; children's school fees reserve ₦70,000; cooperative ₦30,000; mother ₦20,000 |
| Main frustration | Promises himself to save each month; by the 10th the money is gone and his rent is due in January | Family calls on payday and she gives more than she planned, then runs short before month end | Good months he overspends; lean months he skips savings entirely | Does each transfer by hand at the bank app and forgets one most months |
| What success looks like | January rent fully reserved without borrowing; savings grow every month | Family receives a fixed amount on the same day every month, with no negotiation | His commitments shrink and grow with each payment; he never sends a fixed amount he can't afford | Every commitment paid on payday, with a record she can show her husband |
| Feeling about automated money movement | Comfortable; wants to see every transfer and pause at will | Open to it; relieved that the app, not her, "decides" the family amount | Interested, but worried that a small payment will trigger his full fixed commitments | Sceptical. Has heard of fintech fraud and failed transfers. Will only switch on after seeing it work with pretend money |

### 2.3 User journeys

**Journey 1: Tunde, first automated payday**

| Step | What happens | Thinking or feeling | Risk of giving up |
| --- | --- | --- | --- |
| 1 | Sees a colleague's post about SpreadIT and downloads the app | "Will this actually make me save?" | Low |
| 2 | Signs up with phone, email and password; sets a 6-digit PIN | "Done in under 2 minutes." | Low |
| 3 | Builds a plan: Mum (fixed), Rent (fixed), Tithe (%), Savings (%), Investment (fixed), remainder to his everyday account | "I can see exactly where ₦850k goes." | Medium: if adding destination accounts takes more than 2 minutes each |
| 4 | Runs the Payday Simulator at ₦850,000 and at ₦425,000. Sees "This plan costs ₦875 per payday in bank fees" | "Good, rent and Mum still get paid on a half month, and I know the cost." | Low |
| 5 | Reads "Where your money is", enters his BVN and receives his SpreadIT account number | "The account is in my name. OK." | High: drops off if the reason for BVN is not shown on the same screen |
| 6 | Chooses Forward mode: on payday he'll send his salary from his current bank to SpreadIT in one transfer | "I don't need HR yet." | Low |
| 7 | On the 25th, his salary lands at his bank. SpreadIT's reminder arrives at 9am; he forwards ₦850,000 | "One transfer instead of six." | Medium: if he forgets; the reminder repeats at 6pm |
| 8 | SpreadIT notifies: ₦850,000 received, executing in 15:00. He taps "Execute now"; each transfer shows Successful | "That's done before I touched a kobo." | Low |
| 9 | After 2 successful paydays, SpreadIT offers the salary-switch kit; he sends the HR letter | "Now it can be fully automatic." | Medium: HR takes a pay cycle |

**Journey 2: Chiamaka, first automated payday**

| Step | What happens | Thinking or feeling | Risk of giving up |
| --- | --- | --- | --- |
| 1 | Hears about SpreadIT in her church WhatsApp group | "Can it handle tithe and family?" | Low |
| 2 | Signs up and picks the default categories Black Tax, Tithe, Transport, Savings | "The categories already match my life." | Low |
| 3 | Sets Parents ₦40,000 and Siblings ₦60,000 as priority 1 and 2 | "Now the amount is fixed. I don't have to decide each month." | Medium: if she has to type her siblings' bank details from memory |
| 4 | Simulates ₦420,000 and sees the remainder of ₦187,175 for herself, after ₦825 in fees | "That's tight but honest." | Medium: a small remainder may discourage her |
| 5 | Completes BVN check and gets her SpreadIT account number | "OK, this is a real bank account." | Medium |
| 6 | Moves her salary to the SpreadIT account | "One month to switch." | High |
| 7 | On the 28th, lets the 15-minute countdown run out | "I'll trust it this time." | Low |
| 8 | Her mother calls to say the money arrived | Relief | Low |

**Journey 3: Emeka, first automated payday (irregular income)**

| Step | What happens | Thinking or feeling | Risk of giving up |
| --- | --- | --- | --- |
| 1 | Finds SpreadIT through a freelancers' Twitter thread | "Does this work if I'm not salaried?" | Medium |
| 2 | Sets income type to "varies" and a qualifying minimum of ₦100,000 | "Small payments won't trigger everything." | Low |
| 3 | Builds a plan with mostly percentage rules and 2 fixed rules | "Percentages make sense for me." | Low |
| 4 | Simulates ₦150,000 and ₦900,000 | "Fixed rules eat most of a small payment. I'll lower them." | Medium: if he can't see why a small payment leaves nothing |
| 5 | Completes BVN check; shares the SpreadIT account number with 3 clients | "2 of my 3 clients will keep paying my old account until I remind them." | High |
| 6 | A ₦320,000 payment arrives; he reviews the split and taps "Execute now" | "It scaled." | Low |
| 7 | A ₦45,000 payment arrives, below his minimum; SpreadIT asks him whether it is income | "Good, it asked me." | Low |

**Journey 4: Folake, first automated payday (sceptical user)**

| Step | What happens | Thinking or feeling | Risk of giving up |
| --- | --- | --- | --- |
| 1 | Her son installs SpreadIT for her | "I don't trust apps with my salary." | High |
| 2 | Signs up; reads the "Your money stays with \[partner bank\]" screen | "So SpreadIT doesn't hold it." | High: drops off if custody is not explained before BVN |
| 3 | Builds her plan with her son's help | "Let me see first." | Medium |
| 4 | Runs the simulator 5 times over 2 weeks with different amounts | "The numbers add up every time." | Medium |
| 5 | Completes BVN check; sets her review window to 60 minutes | "I want time to stop it." | Medium |
| 6 | Payday arrives; she taps "Pause for review", checks each recipient, then "Execute now" | "Every name is right." | Medium |
| 7 | Receives an SMS confirming each completed transfer | "I'll leave it on next month." | Low |

**Journey 5: Short payday (income lower than expected)**

1. Tunde's expected income is ₦850,000. Only ₦380,000 arrives (45% of expected).
2. Because it is below 50% of expected income, SpreadIT does not run automatically. It sends: "₦380,000 received, 45% of your usual pay. Your plan is paused for your review."
3. The Payday screen shows which rules would be fully funded, partly funded or skipped in priority order.
4. Tunde taps "Run in priority order" or edits amounts for this payday only.
5. If the amount had been between 50% and 99% of expected income, SpreadIT would run in priority order automatically and notify him with the funding status of each rule.

**Journey 6: A failed transfer**

1. Chiamaka's transfer to her sister's microfinance bank fails with a temporary error: the bank's transfer service is down.
2. SpreadIT keeps retrying for up to 6 hours (D7). The dashboard shows Retrying, with the time of the next attempt.
3. Because "Keep trying until it goes through" is on for her family rules, SpreadIT does not fall back after 6 hours. It keeps trying every 30 minutes for up to 3 days, and alerts her once at the 6-hour mark.
4. The bank recovers after 4 hours. The transfer completes; her sister's alert reads "From Chiamaka Okafor".
5. If the failure had been permanent (account closed), the money would have gone to her fallback account at once, with a push and SMS: "₦60,000 to Ada Okafor (account closed). The money is in your fallback account."

**Journey 7: Changing a destination account**

1. Tunde's mother changes banks. He opens the rule "Mum" and edits the account.
2. SpreadIT checks the account number against the bank and shows the account name for him to confirm.
3. He enters a one-time code sent by SMS or from his authenticator app.
4. The rule shows "New account active on \[date and time 24 hours later\]". Email and SMS alerts confirm the change and name the new account.
5. If a payday falls inside the 24 hours, the rule pays the old account. If the old account was removed, the amount goes to his fallback account.

**Journey 8: Pausing automation in an emergency**

1. Folake loses her phone, or needs her full salary for a hospital bill.
2. She taps "Emergency pause" on the home screen (or signs in on a new phone to do it).
3. SpreadIT confirms: "Automation paused. Income will stay in your SpreadIT account until you resume."
4. If a payday is already in its review window, no transfers are sent. If transfers are already sent, the ones still queued are stopped and the rest are shown as Completed.
5. Resuming needs her PIN plus a one-time code.

**Journey 9: A one-off extra for family**

1. Mid-month, Tunde's mother is admitted to hospital and needs ₦50,000.
2. Tunde opens the rule "Mum" and taps "Send extra once".
3. He enters ₦50,000 and his PIN. No one-time code or cooldown is needed, because the destination is already verified.
4. The money comes from his SpreadIT balance or, if that is empty, he is asked to forward it in first.
5. His mother's alert reads "From Tunde Adeyemi". His plan is unchanged for next payday.

**Journey 10: Weekly batching for a freelancer**

1. Emeka switches on "Split weekly" for his varied income.
2. Over Monday to Thursday, 3 client payments arrive: ₦150,000, ₦320,000 and ₦45,000. Each shows "Held for Friday's split".
3. On Friday at 9am, SpreadIT adds them up (₦515,000) and runs one split: 1 inflow summary, 1 set of transfers.
4. His fixed rules (Mum, rent reserve) are spread across the month: each Friday split pays a quarter of each, so a small first payment no longer starves his savings.
5. He can still tap "Split now" on any held payment.

**Journey 11: Money that isn't income**

1. A friend repays Folake ₦30,000 into her SpreadIT account. It is below her qualifying minimum.
2. SpreadIT asks "Is this income?" She taps No.
3. The money stays in her SpreadIT account. She taps "Send to my account", enters her PIN, and it goes to her fallback account.

## Layer 3: What will it do?

### 3.1 Scope

**In scope for version 1.1**

- iOS and Android apps.
- Sign-up, sign-in, PIN and biometric unlock, identity check (BVN) through the banking partner.
- A SpreadIT account in the user's own name at the partner bank, which SpreadIT can only instruct (custody model, OQ-11).
- Two ways for income to arrive: Forward mode (one transfer from the user's current bank) and direct salary payment, with a salary-switch kit.
- Plan building: default and custom categories, fixed and percentage rules, priority order, destination accounts, remainder rule, fallback account.
- One-payday adjustments: send extra once, skip a rule once.
- Payday Simulator with pretend money and the partner's real fee schedule.
- Automatic detection of qualifying income, a review window, and automatic transfers in the user's name.
- Weekly batching for varied income.
- Short-payday handling, a 6-hour retry window, keep-trying for family rules, fallback routing, reversals and duplicate protection.
- Moving unsplit money to the user's own account.
- Dashboard, income history, transfer receipts and a monthly summary.
- Emergency pause, step-up verification, 24-hour cooldown on destination changes, change alerts, pause reminders.
- Push, SMS and email notifications.
- Internal admin console (view-only for money).
- A pricing test during the simulator beta.
- Release in 3 stages: simulator beta, sandbox, controlled live pilot (the pilot is blocked until OQ-11 is settled).

**Out of scope for version 1.1**

| Item | Why it is out |
| --- | --- |
| SpreadIT holding user money in its own merchant or pooled balance | Under CBN rules only licensed mobile money operators may hold customer funds; that licence needs a ₦2 billion deposit |
| AI features of any kind (rule drafting, assistant, summaries) | The founders decided to prove the rules engine and user trust first, with no AI |
| Web app | Founders chose iOS and Android; payday approval relies on push notifications |
| Expense tracking, receipt scanning or spending categories | SpreadIT acts before spending; tracking after the fact is a different product |
| Card issuance (physical or virtual) | Adds licensing and fraud scope that version 1.1 does not need to prove the core idea |
| Pulling money from other bank accounts (direct debit) | Forward mode covers the same need without mandates the partner may not support |
| Investment products, advice or robo-advice | Investment rules send money to the user's own investment account; advising is a regulated activity |
| Loans, overdrafts, credit scoring | Not needed to prove automated allocation; adds credit risk |
| Currencies other than naira, and users outside Nigeria | First market is Nigeria |
| Payroll integration and B2B versions for banks, employers and fintechs | Later. Payroll-partner conversations start during the pilot, as the long-term fix for the salary switch |
| Pidgin or other local-language interface | English only for version 1.1; revisit after the pilot |
| Daily allowance release (D12) | Later, blocked by OQ-2 |

### 3.2 Features

Every feature has an ID, a plain description, a priority (Must have, Should have, Later) and a "Done when". Must have = required for the live pilot. Should have = planned for version 1.0 but the pilot can start without it. Later = after version 1.0.

#### A. Onboarding and account

| ID | Feature | Description | Priority | Done when |
| --- | --- | --- | --- | --- |
| A1 | Sign up | User creates an account with phone number, email and password. | Must have | A new user completes sign-up in 5 screens or fewer. The phone is verified with a 6-digit SMS code that expires after 10 minutes. The email is verified by a link. A phone number or email already in use is rejected with the message "An account with this phone number (or email) already exists". |
| A2 | Age check | Only users aged 18 or over can sign up. | Must have | A date of birth under 18 years blocks sign-up with the message "You must be 18 or over to use SpreadIT". If the BVN date of birth shows the user is under 18, live automation stays locked. |
| A3 | Sign in with PIN or biometric | After first sign-in, the user unlocks the app with a 6-digit PIN or the phone's face or fingerprint unlock. | Must have | The app opens with PIN or biometric in 1 step. 5 wrong PINs in a row lock sign-in for 30 minutes and send an SMS alert. "Sign out" in Settings ends the session on that phone. |
| A4 | Password and PIN reset | User resets a forgotten password or PIN. | Must have | Reset needs an SMS code and an email link. After a reset, every other signed-in phone is signed out and an email alert is sent within 60 seconds. |
| A5 | "Where your money is" screen | Explains, before the identity check, that the user's money sits in an account in their own name at the partner bank, and that SpreadIT can only send it where the user's plan says. | Must have | The screen names the partner bank, states "Your SpreadIT account is in your name at \[partner bank\]. SpreadIT can only move money the way your plan says", links to a 1-page explainer, and the user cannot continue until they tap "I understand". The wording is approved by the compliance owner before the live pilot. |
| A6 | Identity check (BVN) | User submits their BVN to the partner bank to unlock live automation. Not needed for the simulator. | Must have | A user who submits a valid BVN sees Pass or Fail within 2 minutes. A Fail shows the reason (name mismatch, date of birth mismatch, BVN not found) and a "Try again" button. After 3 failed attempts in 24 hours, the app shows the support contact instead. |
| A7 | SpreadIT account in the user's name | Each verified user gets a permanent account at the partner bank, held in their own name. SpreadIT has instruction rights only. | Must have | Within 5 minutes of passing the identity check, the user sees bank name, account number and account name, and the account name is the user's own name with no "SpreadIT" prefix \[ASSUMPTION: partner supports this; OQ-11\]. "Copy details" copies all 3 in one tap. "Share" opens the phone's share sheet with the 3 details as text. |
| A8 | Income setup | User states income type (regular or varies), expected amount, pay frequency, expected pay date, qualifying minimum, and how income will arrive (Forward mode or paid in directly). | Must have | The user cannot save a plan until expected amount, qualifying minimum and arrival method are set. The qualifying minimum defaults to 50% of expected amount for regular income and ₦50,000 for varied income, and the user can change it. |
| A9 | Forward mode | The user keeps being paid at their current bank and, on payday, sends the salary to their SpreadIT account in one transfer. SpreadIT reminds them, then splits it. | Must have | On the expected pay date, a push arrives at 9am with the SpreadIT account details and a Copy button; if no qualifying payment has arrived by 6pm, a second push follows, and none after that. A forwarded payment at or above the qualifying minimum creates an income event within 60 seconds. The setup screen shows how to create a standing order at the user's bank for the 10 largest Nigerian banks \[ASSUMPTION: list supplied by partner\]. |
| A10 | Salary-switch kit | Helps a user move their salary to SpreadIT once they trust it. | Should have | After 2 successful live paydays, the app offers the kit once. It produces a letter for HR with the user's full name, the account name exactly as the bank holds it, the account number, bank name and an effective-from date, as a PDF, in 5 seconds or less. When a first payment arrives from a sender other than the user's own account, the app asks "Is this your salary now?"; Yes stops Forward mode reminders. |

#### B. Plan building

| ID | Feature | Description | Priority | Done when |
| --- | --- | --- | --- | --- |
| B1 | Default categories | A new plan offers 7 ready-made categories: Black Tax / Family Support, Rent, Tithe, Savings, Investment, Transport & Everyday, Other. | Must have | A new plan shows the 7 categories, each with an on/off switch, all off by default. Switching one on opens its rule editor. |
| B2 | Custom categories | User adds their own categories (for example School Fees, Emergency Fund, Travel). | Must have | The user can add a category with a name of 1 to 30 characters. A plan holds up to 15 rules. A name already used in the plan is rejected with "You already have a category called \[name\]". |
| B3 | Fixed-amount rule | A rule that sends the same naira amount each time it runs, with its transfer cost shown. | Must have | The rule accepts whole naira amounts from ₦1,000 to ₦50,000,000 \[ASSUMPTION: ₦1,000 minimum\]. Under the amount, the editor shows its transfer cost from the partner's fee schedule (for example "Costs ₦75 to send"). An amount from ₦10,000 to ₦10,999 shows "Send ₦\[amount − 9,999\] less to save ₦50 stamp duty". |
| B4 | Percentage rule | A rule that sends a percentage of gross income (the full amount received). | Must have | The rule accepts 0.5% to 100% in steps of 0.5%. In the simulator, a 10% rule on ₦500,000 shows "10% of ₦500,000 = ₦50,000". |
| B5 | Fixed-rule frequency | User chooses whether a fixed rule runs on every income event, once per calendar month, or spread across the month (for weekly batching). | Must have | Default is "Once per month" \[ASSUMPTION\]. With "Once per month", a second qualifying income in the same month skips the rule and the payday screen shows "Already paid this month". With "Spread across the month", each weekly split pays the rule amount divided by the count of Friday splits in that month, rounded down to the naira, with any balance on the last Friday. |
| B6 | Priority order | User ranks every rule, fixed and percentage together, by dragging. | Must have | Dragging a rule renumbers all rules 1 to n on screen. The next simulation and the next live payday fund rules in that order. |
| B7 | Destination account | Each rule that moves money has a verified destination: bank and 10-digit account number. | Must have | The user picks a bank from the partner's list of Nigerian banks and enters a 10-digit account number. The account name returned by the bank appears within 5 seconds. The rule cannot be saved until the user taps "Confirm this is \[account name\]". An account number that the bank cannot find shows "Account not found" and cannot be saved. |
| B8 | Remainder rule | Every plan states where leftover money goes: primary account, everyday spending, savings or a custom destination. | Must have | \[ASSUMPTION: a plan cannot be switched on until a remainder destination is set, pending OQ-5.\] With no remainder destination, the "Switch on" button is disabled and the screen shows "Choose where leftover money goes". |
| B9 | Fallback account | The user's own account where money goes if a transfer fails for good or the user moves unsplit money out. | Must have | Live automation cannot be switched on until a fallback account is set and confirmed by account name. |
| B10 | Plan checks | SpreadIT checks the plan for problems before it can be switched on. | Must have | Percentage rules adding up to more than 100% block "Switch on" and show the total. If fixed plus percentage rules exceed the expected amount, a warning shows the shortfall in naira and lists the rules that would be partly funded or skipped. If the remainder at the expected amount is ₦0, a warning shows "No money left for day-to-day spending". |
| B11 | Plan summary bar | A bar at the top of the plan shows how much of the expected amount is committed. | Should have | The bar shows the committed percentage and the naira remainder at the expected amount, and updates within 1 second of each rule change. |
| B12 | Changes apply to future income | Editing a plan never changes an income event that has already been split. | Must have | After an edit, completed and in-progress income events show their original allocations. The plan screen shows "Changes apply from your next payday". |
| B13 | Skip a rule once | User skips a rule for the next payday only, without deleting or editing it. | Should have | "Skip next payday" on a rule needs the PIN. The next income event shows the rule as "Skipped by you" and its amount goes to the remainder. The payday after, the rule runs as normal with no action from the user. |
| B14 | Send extra once | User sends a one-off extra amount to an existing rule's verified destination. | Should have | "Send extra once" on a rule accepts ₦1,000 to the SpreadIT balance, needs the PIN but no one-time code or cooldown, and sends within 180 seconds. The plan is unchanged afterwards. If the balance is too low, the screen shows the shortfall and the Forward mode account details. |
| B15 | Keep trying for important rules | A per-rule setting that keeps retrying a temporarily failed transfer instead of falling back after 6 hours. | Must have | The setting is on by default for the Black Tax / Family Support category and off for others \[ASSUMPTION\]. With it on, a temporary failure keeps retrying every 30 minutes for up to 72 hours before fallback, and the user is alerted once at the 6-hour mark. |

#### C. Payday Simulator

| ID | Feature | Description | Priority | Done when |
| --- | --- | --- | --- | --- |
| C1 | Run a simulation | User enters any amount and sees exactly how their plan would split it, with pretend money. | Must have | A user who enters ₦500,000 with 5 active rules sees each allocation amount, the fees and the remainder within 2 seconds, and the amounts add up to exactly ₦500,000. |
| C2 | Simulator without identity check | New users can use the simulator before giving their BVN. | Must have | A user who has not done the identity check can run unlimited simulations, and no simulation screen asks for BVN. |
| C3 | Funding status per rule | Each rule in a result is labelled Fully funded, Partly funded or Skipped. | Must have | A simulation where income cannot cover every rule shows the correct label on each rule and the naira shortfall on each Partly funded or Skipped rule. |
| C4 | Real fee line | Fees are calculated from the partner's published fee schedule: the inflow fee, the transfer fee for each amount band, and ₦50 stamp duty on each transfer of ₦10,000 or more. | Must have | With Paystack's November 2026 schedule, Tunde's plan (₦850,000, 6 transfers) shows fees of ₦875: ₦300 inflow plus ₦575 transfers. Allocations plus fees equal the amount entered. Operations staff can update the fee schedule in the admin console, and the app uses the new schedule within 10 minutes with no app release. Who pays the fees follows OQ-3. |
| C5 | What-if slider | A slider shows the split at different income levels. | Should have | The slider runs from 10% to 150% of expected income in steps of 10%. Each step updates the result within 1 second, with funding labels. |
| C6 | Monthly cost estimate | Shows what the plan costs each month in fees and subscription, in naira and as a share of income. | Must have | The plan builder and simulator show "This plan costs about ₦\[X\] a month (\[Y\]% of your income)" at the expected amount and pay frequency, recalculated within 1 second of each rule change. Above 1% of income, the line is shown in the warning style with a link to "Ways to lower your costs". |

#### D. Income detection and payday execution

| ID | Feature | Description | Priority | Done when |
| --- | --- | --- | --- | --- |
| D1 | Detect qualifying income | A payment into the SpreadIT account at or above the user's qualifying minimum (paid in directly or forwarded) starts an income event automatically. | Must have | A payment at or above the minimum creates an income event within 60 seconds of the partner's payment notice. A payment below the minimum sends a push notification "Is this income?" with Yes and No. No: nothing is split. Yes: an income event is created. |
| D2 | Review window | A countdown before transfers go out, during which the user can execute now, pause or let it run. | Must have | The "Income received" notification arrives within 60 seconds of the income event. The default window is 15 minutes; the user can choose 5, 15 or 60 minutes. The option to switch the window off appears only after 3 successful automated paydays. |
| D3 | Payday screen | Shows the income received and every planned transfer before execution. | Must have | The screen lists every recipient with bank name, last 4 digits of the account number and amount, plus fees and remainder, and shows the buttons "Execute now", "Pause for review" and "Emergency cancel". |
| D4 | Short payday | Different behaviour when income is below the expected amount. | Must have | Below 50% of expected amount: the event is paused and nothing is sent until the user taps "Run in priority order". From 50% to 99%: rules run in priority order automatically and the user is notified with each rule's funding label. |
| D5 | Larger payday | Behaviour when income is above the expected amount. | Must have | Fixed rules pay their set amount, percentage rules are calculated on the actual amount received, and all extra money goes to the remainder destination. |
| D6 | Send transfers | SpreadIT instructs the partner bank to make every transfer in the split. | Must have | All transfer instructions reach the partner within 180 seconds of the window closing or of "Execute now". Each transfer shows one of: Pending, Processing, Successful, Retrying, Failed, Sent to fallback, Reversed. |
| D7 | Retry and fallback | Temporary failures are retried for up to 6 hours; permanent failures go to the fallback account at once. | Must have | A temporary failure is retried at 30 seconds, 2 minutes and 10 minutes, then every 30 minutes up to 6 hours \[ASSUMPTION: 6 hours, OQ-17\]. The dashboard shows Retrying with the next attempt time. After 6 hours (or 72 hours with B15 on), or at once on a permanent failure, the amount goes to the fallback account and the user gets a push and SMS within 60 seconds naming the recipient, amount and reason. |
| D8 | Send again | User re-sends a failed transfer from the dashboard. | Must have | "Send again" on a failed transfer asks for the PIN, then sends the same amount to the same destination from the user's SpreadIT balance and shows the new status. |
| D9 | No duplicate transfers | The same payment notice received twice never creates 2 splits. | Must have | In testing, replaying the same partner payment notice 10 times produces 1 income event and 1 set of transfers. In live use, duplicate payouts stay at 0. |
| D10 | Reversals | Handles a transfer the bank reverses after it was marked Successful. | Must have | Within 5 minutes of the partner reporting a reversal, the transfer shows Reversed, the amount is shown as returned to the SpreadIT account, and the user gets a push and SMS. |
| D11 | Multiple payments in a day | Each qualifying payment is handled on its own unless weekly batching is on. | Must have | 2 qualifying payments on the same day create 2 income events, each with its own split, and fixed rules follow their frequency setting (B5). With D14 on, both are held for the next weekly split. |
| D12 | Daily allowance release | Releases the remainder in equal daily amounts over 30 days instead of in one transfer. | Later | Blocked by open question OQ-2. When built: the user sees today's release, days left and total left; each day's amount is the remainder divided by 30, rounded down to the kobo, and day 30 includes the rounding balance. |
| D13 | Send to my account | Moves money that was not split (a refund, a friend's repayment, a held payment) to the user's fallback account. | Must have | "Send to my account" on the dashboard shows the unsplit balance, needs the PIN, and sends the chosen amount (₦1 up to the full balance) to the fallback account within 180 seconds. The transfer fee is shown before the user confirms. |
| D14 | Weekly batching | For varied income, holds qualifying payments and runs one split a week. | Should have | With "Split weekly" on, each qualifying payment shows "Held for Friday's split". At 9am every Friday, held payments are added up and split once, with B5's spread rule for fixed amounts. "Split now" on a held payment runs it at once. A user cannot turn on weekly batching while income type is "regular". |
| D15 | Transfers in the user's name | Recipients see who sent the money. | Must have | Every transfer's narration starts "From \[user's first and last name\]" followed by the rule name (for example "From Tunde Adeyemi – Mum"), cut to the partner's narration length limit. The user can edit the rule-name part up to 20 characters. |

#### E. Dashboard and history

| ID | Feature | Description | Priority | Done when |
| --- | --- | --- | --- | --- |
| E1 | Home dashboard | One screen with the latest income event and the state of automation. | Must have | The home screen shows: latest income amount and date, allocation by category, status of each transfer, unsplit balance, the next expected pay date, and an Automation On / Paused label with the Emergency pause button. |
| E2 | Income history | A list of every past income event. | Must have | Events are listed newest first, back to the user's first event. Opening one shows the full split, fees, funding labels, transfer statuses, partner references and times. |
| E3 | Transfer receipt | A receipt for each transfer. | Should have | Each transfer shows partner reference, bank session ID, time completed and fee. "Share receipt" produces an image the user can send by WhatsApp or email. |
| E4 | Monthly summary | A once-a-month report of what SpreadIT did. | Should have | On the 1st of each month at 10am, a push opens a summary of the previous month: total received, total sent per category, fees paid, family payments delivered on payday (count), and savings sent since the user joined. Every total matches the income history to the kobo. "Share" produces an image with amounts hidden by default. |

#### F. Security and control

| ID | Feature | Description | Priority | Done when |
| --- | --- | --- | --- | --- |
| F1 | Emergency pause | One button stops all automation. | Must have | Tapping "Emergency pause" and entering the PIN sets automation to Paused within 5 seconds. While paused, no new transfers are sent and transfers not yet sent to the partner are stopped. Resuming needs PIN plus a one-time code. |
| F2 | Step-up verification | Sensitive changes need a one-time code. | Must have | Changes to rules, destinations, fallback account, review window, password and phone number are saved only after a valid 6-digit code from SMS or an authenticator app. A wrong code 3 times cancels the change. |
| F3 | 24-hour cooldown on destinations | A new or changed destination account becomes active 24 hours after the change. | Must have | The rule shows "New account active on \[date, time\]". Paydays inside those 24 hours pay the previous account, or the fallback account if there was none. |
| F4 | Change alerts | Every sensitive change triggers alerts outside the app. | Must have | An email and SMS arrive within 60 seconds of each change, naming the rule and the old and new account (last 4 digits only). The alert includes a "This wasn't me" link that pauses automation. |
| F5 | Auto-lock | The app locks when left in the background. | Must have | After 5 minutes in the background, the app needs the PIN or biometric to open. |
| F6 | Signed-in devices | User sees and signs out other phones. | Should have | Settings lists each signed-in phone with model and last-used date, and "Sign out" removes access on that phone within 60 seconds. |

#### G. Notifications

| ID | Feature | Description | Priority | Done when |
| --- | --- | --- | --- | --- |
| G1 | Payday notifications | The user is told when income arrives and when the split completes. | Must have | Push on income received (within 60 seconds). Push and SMS when all transfers reach a final status, with a count of successful and failed transfers. |
| G2 | Notification settings | User chooses which non-security notifications to receive. | Should have | The user can switch off payday summary SMS. Security alerts (F4) and failure alerts (D7) cannot be switched off, and their switches are shown greyed out with the reason. |
| G3 | Pause reminders | Brings back users who paused. | Should have | A user paused for 7 days gets 1 push: "Your plan is paused. Resume before your next payday on \[date\]?" with a Resume button. A second push follows at day 14, and none after that. Resuming from the push still needs PIN and a one-time code. |

#### H. Support and operations

| ID | Feature | Description | Priority | Done when |
| --- | --- | --- | --- | --- |
| H1 | Get help | Support contact from every payday and transfer screen. | Must have | "Get help" opens WhatsApp or email with the income event reference filled in. During the pilot, a support reply arrives within 4 working hours \[ASSUMPTION: 4 working hours\]. |
| H2 | Admin console | Internal tool for staff to investigate problems. | Must have | Staff with the admin role can view users, income events, rules, transfers, failed transfers and partner notices. No staff role can send money, edit a user's rules or change destinations. Every view of a user's personal data is logged with staff name and time. |

#### I. Pricing

| ID | Feature | Description | Priority | Done when |
| --- | --- | --- | --- | --- |
| I1 | Free during the pilot | All features are free for pilot users. | Must have | Pilot users see no payment screen and no rule limit up to 15 rules. |
| I2 | Pricing after the pilot | The pricing model chosen from the I3 test (OQ-16): a monthly subscription, a fee per payday, free below the income floor, or a mix. | Later | The chosen price is shown on the "Switch on automation" screen and in Settings before any charge. A user gets 7 days' notice before a price change, and rules stay active for any month already paid. |
| I3 | Pricing test | During the simulator beta, each user is shown one of 3 price options to learn what users will pay. | Should have | Each beta user is assigned at random to 1 of 3 options (₦1,500 a month; ₦200 per payday; free below ₦150,000 net and ₦1,500 above) \[ASSUMPTION: these 3 options\]. The option appears on the "Go live" screen with "Accept" and "Not now", and each choice is recorded. Each option reaches at least 60 users before the test closes. No beta user is charged. |

### 3.3 AI behaviour rules

Version 1.1 has no AI. Every split is calculated by fixed rules: the same income and the same plan always give the same result. The rules below apply to the first release that adds AI, and must be met before any AI feature ships.

**What the AI may do**

- Turn a plain-language request ("send my mum 40k every payday") into a proposed rule the user can edit.
- Answer questions about how SpreadIT works, using SpreadIT's help content.
- Explain a past income event using the data on the user's own screen.

**What the AI must never do**

- Move money, start or stop a transfer, or trigger an income event.
- Save, change, activate or delete a rule, destination or setting. It can only propose; the user confirms with the same PIN and one-time code as a manual change.
- Tell the user how much to give family, church or anyone else.
- Recommend investments, loans or financial products.
- Ask for or repeat a full BVN, full account number, PIN, password or one-time code.

**Tone and language**

- Plain Nigerian English, sentences of 20 words or fewer, naira amounts written as ₦ with commas.
- No judgement about family support, tithe or spending choices.
- Pidgin: \[ASSUMPTION: the AI understands Pidgin input and replies in plain English\], to be confirmed when AI is scoped.

**Advice, uncertainty and mistakes**

- A request for financial advice gets: "I can't advise on that, but I can help you set up the plan you choose."
- When the AI is not sure what the user means, it asks one question instead of guessing.
- Every proposed rule is shown as a preview with the naira result at the user's expected income before the user confirms.
- If the user says the AI got something wrong, it says so, and offers to redo the proposal.

**Sensitive data**

- BVN, account numbers and family members' names are never sent to the AI model in full. Account numbers show the last 4 digits only.
- Conversations are not used to train any model.

**Hand over to a human when**

- The user reports a missing, failed or reversed payment.
- The user reports fraud, a lost phone or a change they did not make.
- The user asks for a person, or asks the same question 3 times.

**Example responses**

| User says | Good response | Bad response |
| --- | --- | --- |
| "Send my mum 40k every payday" | "I've drafted a rule: ₦40,000 to Mum, once a month, priority 1. Add her bank account to finish." | "Done! Mum will get ₦40,000." (the AI cannot save rules) |
| "How much should I give my family?" | "That's your call. I can show what different amounts leave you with in the simulator." | "Most people give 10%." |
| "My transfer to Ada didn't arrive" | "I'm passing this to our support team now with your payday reference." | "It probably will arrive soon." |
| "What's my BVN?" | "I can't show your BVN. You can find it by dialling *565*0# on your registered phone." | Repeats the BVN. |

### 3.4 Screens and flows

**Screens**

| # | Screen | What it is for | Main actions | Goes to |
| --- | --- | --- | --- | --- |
| S1 | Welcome | Explains SpreadIT in 3 cards | Sign up, Sign in | S2 or S4 |
| S2 | Sign up | Collect phone, email, password, date of birth | Continue | S3 |
| S3 | Verify phone and email | Enter SMS code; confirm email link | Submit code, Resend code | S4 |
| S4 | Set PIN and biometric | Create 6-digit PIN; switch on face or fingerprint unlock | Save PIN | S5 |
| S5 | Income setup | Income type, expected amount, frequency, pay date, qualifying minimum, arrival method (Forward mode or paid in directly), weekly batching switch for varied income | Save | S6 |
| S6 | Plan builder | Category list with switches, priority order, plan summary bar, monthly cost estimate, plan checks | Switch category on, Drag to reorder, Add category, Run simulator, Switch on automation | S7, S9, S10, S14 |
| S7 | Rule editor | Set rule type, amount or %, frequency, destination, keep-trying setting; shows transfer cost | Save rule, Delete rule, Skip next payday, Send extra once | S8, S6 or S28 |
| S8 | Add destination account | Pick bank, enter account number, confirm account name | Confirm this is \[name\] | S7 |
| S9 | Remainder and fallback | Choose remainder destination and fallback account | Save | S6 |
| S10 | Payday Simulator | Split pretend income with real fees; what-if slider; monthly cost estimate | Run simulation, Move slider, Edit plan | S6 or S11 |
| S11 | Where your money is | Explain that the account is in the user's name and what SpreadIT can do with it | I understand | S12 |
| S12 | Identity check | Submit BVN | Submit, Try again | S13 |
| S13 | Your SpreadIT account | Show bank name, account number, account name | Copy details, Share | S26 or S14 |
| S14 | Switch on automation | Final plan check; review window length; price (I3 test or I2) | Switch on | S15 |
| S15 | Home dashboard | Latest income event, transfer statuses, unsplit balance, next pay date, automation status | Emergency pause, Open event, Open plan, Send to my account | S16, S19, S6, S24, S29 |
| S16 | Payday screen | Income received, planned transfers, fees, countdown | Execute now, Pause for review, Emergency cancel | S15 |
| S17 | Short payday review | Income below 50% of expected; shows funding labels | Run in priority order, Adjust this payday, Hold | S16 |
| S18 | Is this income? | Payment below qualifying minimum | Yes, No | S16 or S15 |
| S19 | Income history | All past income events, newest first | Open event | S20 |
| S20 | Income event detail | Full split, fees, statuses, references | Send again, Open receipt, Get help | S21, S25 |
| S21 | Transfer receipt | Partner reference, session ID, time, fee | Share receipt | S20 |
| S22 | Settings | Security, devices, notifications, review window, arrival method, sign out | Change setting | S23 or S24 |
| S23 | Verify change | Enter one-time code for a sensitive change or for resume | Submit code | Previous screen |
| S24 | Emergency pause | Confirm pause with PIN | Pause, Cancel | S15 |
| S25 | Get help | Contact support with event reference | Open WhatsApp, Open email | Previous screen |
| S26 | Forward mode setup | Explain Forward mode; set reminder times; standing-order steps for the user's bank | Use Forward mode, Copy details | S14 |
| S27 | Salary-switch kit | Generate the HR letter | Create letter, Share PDF | S15 |
| S28 | Send extra once | Enter a one-off amount for an existing rule | Send with PIN | S15 |
| S29 | Send to my account | Move unsplit money to the fallback account | Send with PIN | S15 |
| S30 | Monthly summary | Last month's totals per category, fees, family payments delivered | Share image | S15 |

The admin console (H2) is an internal staff tool and is not part of the user's app.

**Main flows**

1. **Onboarding:** S1 → S2 → S3 → S4 → S5 → S6.
2. **Building a plan:** S6 → S7 → S8 → S7 → S6 (repeat per rule) → S9 → S6.
3. **Running the simulator:** S6 → S10 → S6 (edit) → S10.
4. **Going live:** S10 → S11 → S12 → S13 → S26 (if Forward mode) → S14 → S15.
5. **Forward-mode payday:** 9am push → user forwards salary from their bank app → push "Income received" → S16 → S15.
6. **Payday approval:** push → S16 → Execute now, or countdown ends → S15. Below 50%: push → S17 → S16. Below the qualifying minimum: push → S18.
7. **One-payday adjustments:** S6 → S7 → Skip next payday (PIN) → S6; or S7 → S28 → S15.
8. **Moving unsplit money:** S15 → S29 → S15.
9. **Moving the salary in:** push after 2nd live payday → S27 → S15.
10. **Reviewing history:** S15 → S19 → S20 → S21; monthly push → S30.
11. **Pausing automation:** S15 → S24 → S15 (Paused). Resume: S15 → S23 → S15 (On).

## Layer 4: How will it work?

### 4.1 Quality rules

**Speed**

| What | Standard |
| --- | --- |
| App opens from closed (cold start) | 3 seconds or less on an Android phone with 3 GB RAM |
| Any screen loads on 4G | 2 seconds or less |
| Any screen loads on 3G (1 Mbps) | 4 seconds or less |
| Simulator result | 2 seconds or less after "Run simulation" |
| Split recorded after the partner's payment notice | 800 milliseconds or less for 99 in every 100 events |
| Income event created after money arrives | 60 seconds or less |
| Transfer instructions sent to partner | 180 seconds or less after the review window closes or "Execute now" |

**Security**

- Sign-in: 6-digit PIN or biometric. 5 wrong PINs lock sign-in for 30 minutes.
- Sensitive changes (rules, destinations, fallback, review window, password, phone) need a 6-digit one-time code by SMS or authenticator app.
- New or changed destination accounts activate after a 24-hour cooldown.
- Email and SMS alert within 60 seconds of every sensitive change.
- Personal and account data encrypted at rest (AES-256) and in transit (TLS 1.2 or higher).
- Partner API keys are kept in a managed secrets store on the server, never in the app or in source code.
- Every payment notice from the partner is checked for a valid signature before it is processed; an invalid one is rejected and logged.
- Account numbers are masked to the last 4 digits in every log and every admin screen.
- An external penetration test is passed, with no open high or critical findings, before the live pilot.

**Privacy**

| Data | Why it is collected | How long it is kept | Who can see it |
| --- | --- | --- | --- |
| Name, phone, email, date of birth | Account, sign-in, alerts, age check | Life of the account + 6 years \[ASSUMPTION: 6 years, to be confirmed by compliance\] | User; support staff, with each view logged |
| BVN | Identity check by the partner bank | Not stored by SpreadIT \[ASSUMPTION\]; only the pass/fail result and partner reference are kept | Partner bank |
| Destination account details and recipient names | Sending transfers | Life of the rule + 6 years | User; support staff, with each view logged |
| Income events and transfer records | Split execution, history, dispute handling | 6 years after the event | User; support staff, with each view logged; regulators on lawful request |
| Phone model and app version | Security (signed-in devices) and bug fixing | 12 months after last use | User; engineering staff |

- SpreadIT complies with the Nigeria Data Protection Act 2023: consent is captured at sign-up, a privacy notice is linked from S2, and a data protection officer is named before the live pilot.
- A user can download their data or request deletion from Settings; requests are completed within 30 days, except records SpreadIT must keep by law.
- A personal-data breach is reported to the Nigeria Data Protection Commission within 72 hours of discovery.
- User data is never sold or shared for marketing.

**Cost limits**

Every payday's real cost is known before it runs. The simulator, the payday screen and the monthly cost estimate (C6) all use the partner's fee schedule. Paystack's published schedule as of November 2026, used until a partner is chosen:

| Cost | Amount |
| --- | --- |
| Inflow fee per payment received | 1% of the payment, capped at ₦300 |
| Transfer of ₦5,000 or less | ₦10 |
| Transfer of ₦5,001 to ₦50,000 | ₦25 |
| Transfer above ₦50,000 | ₦50 |
| Stamp duty on each transfer of ₦10,000 or more | ₦50 |

At these rates, a 6-rule plan on ₦850,000 costs ₦875 per payday (0.1% of income); a 4-rule plan on ₦120,000 costs ₦600 (0.5%).

Ceilings for SpreadIT's own costs are not yet set (OQ-4). Until they are, the team reports 4 numbers every month: server cost per active user, SMS cost per active user, fees per income event, and partner fees per active user.

**Accessibility**

- Meets WCAG 2.1 AA.
- Body text 16 pt minimum; text contrast at least 4.5:1, large text 3:1.
- Every button and status is labelled for VoiceOver (iOS) and TalkBack (Android).
- Touch targets at least 44 × 44 points.
- Layout holds at 200% system text size with no text cut off.
- Status is never shown by colour alone: every coloured status also shows its word (for example Failed).

**Responsiveness**

- Supported: iOS 15 and later, Android 9 and later \[ASSUMPTION: these minimums\].
- Phone screens from 4.7 to 6.9 inches, portrait only. Tablets run the phone layout.
- App download size 60 MB or less \[ASSUMPTION\].
- With no network, the dashboard shows the last loaded data with "Last updated \[time\]", and sensitive changes are blocked with "You're offline".
- If the network drops during a change, the change is not saved and the screen says so.

**Reliability**

- Payment-notice intake: 99.99% uptime per month.
- Rest of the service: 99.9% uptime per month.
- Payout success rate: 99.5% or higher per month.
- Family-rule transfers successful within 6 hours of the income event: 99.5% or higher per month.
- Duplicate payouts: 0.
- Fees charged equal fees shown on the payday screen: 100% of paydays.
- For every income event, allocations plus fees equal the amount received to the kobo. A mismatch blocks that event's transfers and alerts the on-call engineer within 5 minutes.

### 4.2 Technology choices

| Area | Choice | Why |
| --- | --- | --- |
| Platforms | iOS and Android apps | Founder decision; payday approval relies on push notifications |
| Mobile build | One shared codebase for both platforms (React Native or Flutter, OQ-7) | One team ships iOS and Android together |
| Server | Node.js with TypeScript \[ASSUMPTION\] | Named in the earlier PRD; the same language (TypeScript) as the app if React Native is chosen |
| Database | PostgreSQL \[ASSUMPTION\] | Named in the earlier PRD; each money record either saves in full or not at all |
| Banking partner | TBD (OQ-1). Must meet the 6 partner requirements below. Paystack is the reference for fees until then | Custody, fees and reliability all depend on it |
| Partner connection | Built behind a SpreadIT layer so the partner can be replaced without changing plan logic | Avoids lock-in to one partner |
| Fee schedule | Stored as data that operations staff can update in the admin console | Fees change by partner and by regulation; no app release needed |
| Push notifications | Apple Push Notification service and Firebase Cloud Messaging | Standard on iOS and Android |
| SMS and email | Providers TBD | Needed for codes and alerts |
| AI model | None in version 1.1 | Founder decision |
| Admin console | Internal web tool, staff only | Staff work on laptops; not exposed to users |

**Partner requirements.** The banking partner must:

1. Open a permanent account in each user's own name, after a BVN check, with SpreadIT holding instruction rights only (no pooled or merchant balance).
2. Send a signed notice for every payment into a user's account within 30 seconds.
3. Accept transfer instructions to any Nigerian bank and report each one's final status.
4. Let the narration start with the user's name (D15).
5. Publish its fee schedule and give 30 days' notice of changes.
6. Offer a sandbox with test deposits and test transfers before the live pilot.

### 4.3 Linked context files

| File | What it contains |
| --- | --- |
| [SpreadIT — Product Validity Debate](https://claude.ai/artifact/PzZ4UDC9cBDDZ2BzuMFAJ7) | 9-persona debate, 4 case studies and the 12 changes adopted in v1.1, with sources for fees, licensing and competitors |
| SpreadIT\_Product\_Description.md | Product description: overview, problem, how it works, features, target user |
| Income\_Autopilot\_MVP\_PRD.pdf | Earlier PRD under the old name: features, edge cases, data needs, release phases, success metrics |
| Act\_as\_a\_Principal\_Fintech\_Product\_Manager (PDF) | Engineering-focused PRD under the old name: allocation order, partner integration, ledger, failure handling, security standards |
| SpreadIT\_PRD\_Prompt.md | The prompt and rules used to produce this PRD |

## Layer 5: When and what if?

Version 1.1 ships in 3 stages; dates are open (OQ-6). Stage 1: a simulator beta with 200 users, pretend money and the pricing test (I3). Stage 2: the partner's sandbox, with test deposits and test transfers. Stage 3: a controlled live pilot with 50 users for 3 pay cycles.

**Stage 3 starts only when all 3 gates are met:** a written legal opinion confirms the custody model (OQ-11); the chosen partner meets all 6 partner requirements (4.2); and fees charged equalled fees shown on 100% of sandbox paydays. Public launch follows only if the pilot meets 99.5% payout success with 0 duplicate payouts.

### 5.1 Risks and assumptions

**Risks**

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Regulator treats SpreadIT as holding customer funds, which needs a mobile money operator licence | High (as v1.0 was designed) | High | Accounts in the user's own name with instruction rights only (A7, partner requirement 1); legal opinion is a gate for Stage 3; CBN Regulatory Sandbox as fallback route |
| No partner can open accounts in the user's name with instruction rights | Medium | High | Approach 3 or more banks and microfinance banks in parallel (OQ-1); Stage 1 and 2 continue meanwhile |
| Users won't move their salary to a new account | High | High | Forward mode from day 1 (A9); salary-switch kit after 2 paydays (A10); payroll-partner talks during the pilot |
| Forward-mode users forget to forward on payday | Medium | Medium | 9am and 6pm reminders; standing-order steps for the user's bank (A9); track forward delay per payday |
| Users don't trust an app with their salary | High | High | Custody screen before BVN (A5); simulator first; review window on by default; Emergency pause on the home screen; monthly summary (E4) |
| Fees make SpreadIT poor value for lower earners | High | Medium | Real fee line and monthly cost estimate (C4, C6); stamp-duty warning (B3); income floor and pricing test (OQ-15, I3) |
| Partner or regulator changes fees | Medium | Medium | Fee schedule editable without an app release (C4); 30 days' notice required of the partner |
| Interbank transfer failures on payday | Medium | High | 6-hour retry window, keep-trying for family rules (D7, B15); pilot measures success rate per destination bank |
| A bank or savings app copies the feature | Medium | Medium | Lead on Black Tax and payments to people outside the app; build trust and the payday habit; payroll channel later |
| Account takeover redirects a user's salary | Low | High | One-time codes, 24-hour cooldown, change alerts with "This wasn't me" (F2 to F4) |
| A wrong split (calculation error) sends the wrong amounts | Low | High | Every event must balance to the kobo before transfers go out; mismatch blocks the event (4.1 Reliability) |
| Irregular earners trigger fixed rules on small payments | Medium | Medium | Qualifying minimum (A8), "Is this income?" prompt (D1), weekly batching and spread fixed rules (D14, B5) |
| Users set family support they can't sustain, then blame the app | Medium | Medium | Plan checks show the naira remainder at expected income (B10); skip-once (B13) |
| Users pause and never resume | Medium | Medium | Pause reminders at day 7 and day 14 (G3); resume rate metric (1.3) |
| Future AI gives advice or exposes sensitive data | Low (AI is out of v1.1) | High | AI rules in 3.3 must be met before any AI feature ships |

**Assumptions**

Each of these needs founder confirmation. Where it came from a default accepted in the gap check, it is noted.

1. Success targets other than 99.5% payout success, 0 duplicates and 100% fee accuracy: 60% activation, 4 rules per user, 50% first live payday within 45 days, 30 days or fewer to first live payday, 30% direct salary share, 40% automation adoption, 70% retention after 3 pay cycles, 60% resume rate, 50% auto-execute share, 70% simulator completion, 30% price acceptance, 99.5% family delivery within 6 hours.
2. Primary users are salaried and remote workers; freelancers are secondary (accepted default).
3. Version 1.1 is designed for earners with ₦150,000 or more net a month (pending OQ-15).
4. Rules are funded in the user's priority order across fixed and percentage rules (accepted default).
5. Percentages are calculated on gross income (founder decision).
6. Qualifying income is detected automatically above a user-set minimum; smaller payments need user confirmation (accepted default).
7. Below 50% of expected income, the split pauses for approval; from 50% to 99% it runs in priority order (accepted default). With weekly batching on, D4 does not apply.
8. Temporary failures retry for up to 6 hours, then go to the fallback account; with keep-trying on, up to 72 hours (pending OQ-17). Keep-trying is on by default for family rules.
9. Review window: on by default; 5, 15 or 60 minutes; can be switched off after 3 successful paydays (accepted default).
10. Fixed rules default to once per calendar month.
11. The minimum fixed amount is ₦1,000.
12. A plan cannot be switched on without a remainder destination (pending OQ-5).
13. A partner can open accounts in each user's own name with SpreadIT holding instruction rights only (pending OQ-1 and OQ-11).
14. Forward-mode reminders arrive at 9am and 6pm on the expected pay date.
15. Pricing test options: ₦1,500 a month; ₦200 per payday; free below ₦150,000 net and ₦1,500 above.
16. Sign-in by PIN or biometric; one-time codes by SMS or authenticator for sensitive changes (accepted default).
17. BVN is required before live automation, not for the simulator (accepted default). SpreadIT stores only the check result, not the BVN.
18. Release: 200-user simulator beta, then sandbox, then 50-user live pilot for 3 pay cycles (accepted default), behind the 3 Stage 3 gates.
19. WCAG 2.1 AA (accepted default).
20. Records kept 6 years; minimum OS iOS 15 and Android 9; app size 60 MB or less.
21. Server on Node.js with TypeScript and PostgreSQL.
22. Support replies within 4 working hours during the pilot.
23. Future AI understands Pidgin and replies in English.

### 5.2 Edge cases

| Situation | Expected product behaviour |
| --- | --- |
| Income is below 50% of expected | Split pauses; user sees funding labels and taps "Run in priority order", adjusts this payday, or holds (D4) |
| Income is 50% to 99% of expected | Rules run in priority order automatically; lower rules are Partly funded or Skipped; user is notified (D4) |
| Income is higher than expected | Fixed rules pay their set amount, percentages use the actual amount, the extra goes to the remainder (D5) |
| User forwards only part of their salary | Treated as income of that amount; D4 thresholds apply against the expected amount |
| User forwards salary in 2 transfers on the same day | 2 income events; once-per-month fixed rules pay only on the first. The payday screen of the second shows "Forwarding in parts? Hold and combine", which holds it for up to 2 hours for a third part |
| Salary starts arriving directly while Forward mode is on | App asks "Is this your salary now?"; Yes stops forward reminders (A10) |
| Same payment notice arrives twice or more | 1 income event, 1 set of transfers (D9) |
| A payment is not income (refund, gift, user's own transfer) | Below the qualifying minimum, the user is asked "Is this income?"; No = nothing is split. Above it, the user can tap "Pause for review" then "This isn't income" during the review window. Either way the money can be moved out with "Send to my account" (D13) |
| A transfer fails temporarily (network, bank timeout) | Retried for up to 6 hours, or 72 hours with keep-trying on; status Retrying with next attempt time (D7, B15) |
| A transfer fails permanently (account closed, frozen, name mismatch) | Sent to the fallback account at once with no retries; user alerted by push and SMS within 60 seconds (D7) |
| A transfer is reversed by the bank after success | Status Reversed, amount returned to the SpreadIT account, user alerted within 5 minutes (D10) |
| A destination account is closed | First failure is permanent: money goes to fallback; the rule is marked "Account needs updating" and is skipped on later paydays until the user updates it |
| A rule amount sits between ₦10,000 and ₦10,999 | The rule editor shows how much less to send to avoid ₦50 stamp duty (B3); the user decides |
| The partner's fees change between the simulation and payday | The payday screen always uses the schedule in force when the income event is created; the simulator uses the latest schedule within 10 minutes of the change (C4) |
| Fees are larger than the income | No transfers; the user sees "This payment is too small to split" and can move it with "Send to my account" |
| User taps "Send extra once" with too little in the SpreadIT balance | The screen shows the shortfall and the account details to forward it; nothing is sent until the balance covers it (B14) |
| User skips a rule, then income is short | The skipped rule's amount goes to the remainder; other rules follow the priority order (B13, D4) |
| Weekly batching is on and no payment arrives in a week | No Friday split; no notification |
| The plan is changed after income arrives | The event in progress keeps the plan it started with; the change applies from the next payday (B12) |
| Percentage rules add up to more than 100% | The plan cannot be switched on; the total is shown (B10) |
| No remainder is left at expected income | Warning "No money left for day-to-day spending"; the plan can still be switched on (B10) |
| User's phone is lost or the account is compromised | User signs in on another phone or uses "This wasn't me" from an alert to pause; destination changes need a one-time code and wait 24 hours (F1 to F4) |
| Banking partner is down on payday | Income events are created when the partner sends its notices after recovery. Approved transfers are held as Pending, not counted as failures, and resent within 10 minutes of recovery. If held more than 30 minutes, the user is notified |
| 2 payments arrive on the same day | 2 income events, each with its own split, unless weekly batching is on (D11, D14) |
| User pauses during the review window | No transfers are sent; the money stays in the SpreadIT account until the user resumes and taps "Execute now" (F1) |
| User pauses after 1 or more transfers have gone | Transfers already sent to the partner complete; the rest are stopped and marked "Stopped by you" (F1) |
| Income arrives inside a 24-hour destination cooldown | That rule pays the previous account, or the fallback account if there was none (F3) |
| A destination is the user's own SpreadIT account | Rejected at setup with "You can't send money to your SpreadIT account" |
| User asks to close the account with money still in it | Closing is blocked until the balance is ₦0; the user is offered "Send to my account" first |

### 5.3 Open questions

| # | Question | Why it matters | Who decides | Decide by |
| --- | --- | --- | --- | --- |
| OQ-11 | **Blocker.** Does an account in the user's own name with SpreadIT holding instruction rights keep SpreadIT outside the MMO licence? If not, is the CBN Regulatory Sandbox the route? | Without a yes, there is no live pilot | Founders + fintech lawyer | 15 January 2027 |
| OQ-1 | Which banking partner meets the 6 partner requirements, and which is the backup? | Custody, fees and reliability all depend on it | Founders | 15 January 2027 |
| OQ-3 | The fee schedule is now known; who pays it: the user, SpreadIT, or split? | Changes every split and the price | Founders | 15 January 2027 |
| OQ-15 | Is ₦150,000 net the right income floor, and do users below it pay less or nothing? | Sets the target market and pricing | Founders | Before the simulator beta |
| OQ-16 | Which pricing model wins the I3 test? | Sets revenue and whether ₦1,500 a month holds | Founders | End of the simulator beta |
| OQ-17 | Are 6 hours (standard) and 72 hours (keep-trying) the right retry windows? | Trades recipient delivery against money held in transit | Product owner + banking partner | Before the sandbox stage |
| OQ-2 | Daily allowance: held in a partner sub-wallet and released daily, or sent upfront to a spending account? | Decides whether D12 is possible and what it costs | Founders + banking partner | Before D12 is scheduled |
| OQ-4 | What are the cost ceilings per active user (servers, SMS, partner fees)? | Sets whether the price covers costs | Founders | Before the live pilot |
| OQ-5 | Must every plan have a remainder destination, or does leftover money default to an emergency buffer? | Changes B8 and the plan-building flow | Product owner | Before design of S6 and S9 starts |
| OQ-6 | What are the dates for the simulator beta, sandbox, live pilot and public launch? | Sets the build plan and hiring | Founders | 15 December 2026 |
| OQ-7 | React Native or Flutter? | Sets the hiring profile and the build | Engineering owner | Before build starts |
| OQ-8 | Who are the product, engineering, design and compliance owners? | The PRD needs named decision-makers | Founders | 15 December 2026 |
| OQ-9 | Are the success targets in 1.3 (apart from 99.5%, 0 duplicates and 100% fee accuracy) right? | They decide whether the pilot passes | Founders | Before the simulator beta |
| OQ-10 | Are the 6-year retention period and the decision not to store BVN correct? | Legal compliance under CBN rules and the NDPA | Compliance owner | Before the live pilot |
| OQ-13 | Should fixed rules default to once per month or to every income event? | Changes what irregular earners pay to family and rent | Product owner | Before the simulator beta |
| OQ-18 | Who leads payroll-partner conversations, and with which employers or payroll providers first? | Long-term fix for the salary switch | Founders | Before the live pilot |
| OQ-14 | When should AI and Pidgin support be considered? | Sets the version 2 roadmap | Founders | After the live pilot |
| OQ-12 | ~~How does a user move unsplit money out?~~ Resolved in v1.1 by D13 "Send to my account" | — | — | Resolved 23 November 2026 |

## Reliability check

All 64 features in v1.1 have a testable "Done when", and the vague-word scan of the revised PRD found 0 remaining. New and revised features are marked.

### Check 1: Every feature has a "Done when"

| ID | Feature | Done when | ID | Feature | Done when |
| --- | --- | --- | --- | --- | --- |
| A1 | Sign up | ✅ | D2 | Review window | ✅ |
| A2 | Age check | ✅ | D3 | Payday screen | ✅ |
| A3 | Sign in with PIN or biometric | ✅ | D4 | Short payday | ✅ |
| A4 | Password and PIN reset | ✅ | D5 | Larger payday | ✅ |
| A5 | "Where your money is" screen (revised) | ✅ | D6 | Send transfers | ✅ |
| A6 | Identity check (BVN) | ✅ | D7 | Retry and fallback (revised) | ✅ |
| A7 | SpreadIT account in the user's name (revised) | ✅ | D8 | Send again | ✅ |
| A8 | Income setup (revised) | ✅ | D9 | No duplicate transfers | ✅ |
| A9 | Forward mode (new) | ✅ | D10 | Reversals | ✅ |
| A10 | Salary-switch kit (new) | ✅ | D11 | Multiple payments in a day (revised) | ✅ |
| B1 | Default categories | ✅ | D12 | Daily allowance release | ✅ (blocked by OQ-2) |
| B2 | Custom categories | ✅ | D13 | Send to my account (new) | ✅ |
| B3 | Fixed-amount rule (revised) | ✅ | D14 | Weekly batching (new) | ✅ |
| B4 | Percentage rule | ✅ | D15 | Transfers in the user's name (new) | ✅ |
| B5 | Fixed-rule frequency (revised) | ✅ | E1 | Home dashboard (revised) | ✅ |
| B6 | Priority order | ✅ | E2 | Income history | ✅ |
| B7 | Destination account | ✅ | E3 | Transfer receipt | ✅ |
| B8 | Remainder rule | ✅ (pending OQ-5) | E4 | Monthly summary (new) | ✅ |
| B9 | Fallback account | ✅ | F1 | Emergency pause | ✅ |
| B10 | Plan checks | ✅ | F2 | Step-up verification | ✅ |
| B11 | Plan summary bar | ✅ | F3 | 24-hour cooldown on destinations | ✅ |
| B12 | Changes apply to future income | ✅ | F4 | Change alerts | ✅ |
| B13 | Skip a rule once (new) | ✅ | F5 | Auto-lock | ✅ |
| B14 | Send extra once (new) | ✅ | F6 | Signed-in devices | ✅ |
| B15 | Keep trying for important rules (new) | ✅ | G1 | Payday notifications | ✅ |
| C1 | Run a simulation | ✅ | G2 | Notification settings | ✅ |
| C2 | Simulator without identity check | ✅ | G3 | Pause reminders (new) | ✅ |
| C3 | Funding status per rule | ✅ | H1 | Get help | ✅ |
| C4 | Real fee line (revised) | ✅ (fee payer per OQ-3) | H2 | Admin console | ✅ |
| C5 | What-if slider | ✅ | I1 | Free during the pilot | ✅ |
| C6 | Monthly cost estimate (new) | ✅ | I2 | Pricing after the pilot (revised) | ✅ (model per OQ-16) |
| D1 | Detect qualifying income (revised) | ✅ | I3 | Pricing test (new) | ✅ |

### Check 2: No vague words

The full PRD was searched for: fast, quick, quickly, easy, easily, simple, seamless, intuitive, user-friendly, robust, scalable, efficient, secure (without a measure), reliable (without a number), modern, clean, smooth, appropriate, adequate, reasonable, sufficient, as needed, where possible, some, various, several, many, etc., and so on, best-in-class, world-class, high-quality, optimise and improve (without a target).

v1.0 scan: 6 instances were found and replaced with numbers or named behaviours ("quick enough", "some clients", "wide hiring pool", "dependable", "not secured", "some transfers"). v1.1 scan: the revised text was searched again for the full list; 0 new instances. Remaining matches are parts of other words ("something", "measured", "security" as a section name) or this list itself.

**Vague-word scan complete: 0 remaining.**
