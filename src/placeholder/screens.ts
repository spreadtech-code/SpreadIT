// TEMPORARY (stage 1): the map of all 30 screens from PRD 3.4, used by the
// placeholder pages. Each real screen replaces its placeholder in later stages.
// Names, purposes and action labels are copied from the PRD table.

export type ScreenId =
  | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9' | 'S10'
  | 'S11' | 'S12' | 'S13' | 'S14' | 'S15' | 'S16' | 'S17' | 'S18' | 'S19' | 'S20'
  | 'S21' | 'S22' | 'S23' | 'S24' | 'S25' | 'S26' | 'S27' | 'S28' | 'S29' | 'S30';

export type ActionTone = 'primary' | 'secondary' | 'quiet' | 'critical';

/**
 * How a button moves you:
 * - push: open the target on top (Back returns here).
 * - back: return to the previous screen (falls back to opening the target).
 * - tab:  close screens until a tab screen is reached (Home, Plan, Activity, Profile).
 * - reset: clear everything behind (used once, when onboarding ends) so Back can't return to it.
 */
export type NavMode = 'push' | 'back' | 'tab' | 'reset';

export interface ScreenAction {
  label: string;
  to: ScreenId;
  mode?: NavMode;
  tone?: ActionTone;
}

export interface ScreenInfo {
  id: ScreenId;
  name: string;
  purpose: string;
  /** The route path; the file in app/ has the same name. */
  route: string;
  /** Lives behind the floating nav. */
  tab?: boolean;
  /** PRD "Main actions" that move you to another screen. */
  actions: ScreenAction[];
  /** Flow links the PRD gives without a button name ("Goes to" column and PRD 3.4 flows). */
  links?: ScreenAction[];
  /** PRD "Main actions" that stay on the screen; built in a later stage. */
  later?: string[];
  /** Stand-ins for push notifications that open a screen (Home only). */
  pretendPush?: ScreenAction[];
}

export const screens: ScreenInfo[] = [
  // Flow 1: Onboarding
  {
    id: 'S1', name: 'Welcome', route: '/welcome',
    purpose: 'Explains SpreadIT in 3 cards.',
    actions: [
      { label: 'Sign up', to: 'S2', tone: 'primary' },
      { label: 'Sign in', to: 'S4', tone: 'secondary' },
    ],
  },
  {
    id: 'S2', name: 'Sign up', route: '/sign-up',
    purpose: 'Collect phone, email, password, date of birth.',
    actions: [{ label: 'Continue', to: 'S3', tone: 'primary' }],
  },
  {
    id: 'S3', name: 'Verify phone and email', route: '/verify-phone-email',
    purpose: 'Enter SMS code; confirm email link.',
    actions: [{ label: 'Submit code', to: 'S4', tone: 'primary' }],
    later: ['Resend code'],
  },
  {
    id: 'S4', name: 'Set PIN and biometric', route: '/set-pin',
    purpose: 'Create 6-digit PIN; switch on face or fingerprint unlock.',
    actions: [{ label: 'Save PIN', to: 'S5', tone: 'primary' }],
  },
  {
    id: 'S5', name: 'Income setup', route: '/income-setup',
    purpose:
      'Income type, expected amount, frequency, pay date, qualifying minimum, arrival method (Forward mode or paid in directly), weekly batching switch for varied income.',
    actions: [{ label: 'Save', to: 'S6', mode: 'reset', tone: 'primary' }],
  },

  // Flows 2 and 3: Building a plan, running the simulator
  {
    id: 'S6', name: 'Plan builder', route: '/plan-builder', tab: true,
    purpose:
      'Category list with switches, priority order, plan summary bar, monthly cost estimate, plan checks.',
    actions: [
      { label: 'Add category', to: 'S7', tone: 'secondary' },
      { label: 'Run simulator', to: 'S10', tone: 'secondary' },
      { label: 'Switch on automation', to: 'S14', tone: 'secondary' },
    ],
    links: [{ label: 'Remainder and fallback', to: 'S9' }],
    later: ['Switch category on', 'Drag to reorder'],
  },
  {
    id: 'S7', name: 'Rule editor', route: '/rule-editor',
    purpose:
      'Set rule type, amount or %, frequency, destination, keep-trying setting; shows transfer cost.',
    actions: [
      { label: 'Save rule', to: 'S6', mode: 'back', tone: 'primary' },
      { label: 'Skip next payday', to: 'S6', mode: 'back', tone: 'secondary' },
      { label: 'Send extra once', to: 'S28', tone: 'secondary' },
      { label: 'Delete rule', to: 'S6', mode: 'back', tone: 'critical' },
    ],
    links: [{ label: 'Add destination account', to: 'S8' }],
  },
  {
    id: 'S8', name: 'Add destination account', route: '/add-destination',
    purpose: 'Pick bank, enter account number, confirm account name.',
    actions: [{ label: 'Confirm this is [name]', to: 'S7', mode: 'back', tone: 'primary' }],
  },
  {
    id: 'S9', name: 'Remainder and fallback', route: '/remainder-fallback',
    purpose: 'Choose remainder destination and fallback account.',
    actions: [{ label: 'Save', to: 'S6', mode: 'back', tone: 'primary' }],
  },
  {
    id: 'S10', name: 'Payday Simulator', route: '/payday-simulator',
    purpose: 'Split pretend income with real fees; what-if slider; monthly cost estimate.',
    actions: [{ label: 'Edit plan', to: 'S6', mode: 'back', tone: 'quiet' }],
    links: [{ label: 'Where your money is', to: 'S11' }],
    later: ['Run simulation', 'Move slider'],
  },

  // Flow 4: Going live
  {
    id: 'S11', name: 'Where your money is', route: '/where-your-money-is',
    purpose: "Explain that the account is in the user's name and what SpreadIT can do with it.",
    actions: [{ label: 'I understand', to: 'S12', tone: 'primary' }],
  },
  {
    id: 'S12', name: 'Identity check', route: '/identity-check',
    purpose: 'Submit BVN.',
    actions: [{ label: 'Submit', to: 'S13', tone: 'primary' }],
    later: ['Try again'],
  },
  {
    id: 'S13', name: 'Your SpreadIT account', route: '/your-spreadit-account',
    purpose: 'Show bank name, account number, account name.',
    actions: [],
    links: [
      { label: 'Forward mode setup', to: 'S26' },
      { label: 'Switch on automation', to: 'S14' },
    ],
    later: ['Copy details', 'Share'],
  },
  {
    id: 'S14', name: 'Switch on automation', route: '/switch-on-automation',
    purpose: 'Final plan check; review window length; price (I3 test or I2).',
    actions: [{ label: 'Switch on', to: 'S15', mode: 'tab', tone: 'primary' }],
  },

  // Home and payday flows (5, 6, 8, 11)
  {
    id: 'S15', name: 'Home dashboard', route: '/home', tab: true,
    purpose:
      'Latest income event, transfer statuses, unsplit balance, next pay date, automation status.',
    actions: [
      { label: 'Open event', to: 'S16', tone: 'secondary' },
      { label: 'Open plan', to: 'S6', tone: 'secondary' },
      { label: 'Send to my account', to: 'S29', tone: 'secondary' },
      { label: 'Emergency pause', to: 'S24', tone: 'critical' },
    ],
    links: [
      { label: 'Income history', to: 'S19' },
      { label: 'Resume automation (when paused)', to: 'S23' },
    ],
    pretendPush: [
      { label: 'Income received', to: 'S16' },
      { label: 'Short payday (below 50%)', to: 'S17' },
      { label: 'Payment below qualifying minimum', to: 'S18' },
      { label: 'Salary-switch kit (after 2nd payday)', to: 'S27' },
      { label: 'Monthly summary', to: 'S30' },
    ],
  },
  {
    id: 'S16', name: 'Payday screen', route: '/payday',
    purpose: 'Income received, planned transfers, fees, countdown.',
    actions: [
      { label: 'Execute now', to: 'S15', mode: 'tab', tone: 'primary' },
      { label: 'Pause for review', to: 'S15', mode: 'tab', tone: 'secondary' },
      { label: 'Emergency cancel', to: 'S15', mode: 'tab', tone: 'quiet' },
    ],
  },
  {
    id: 'S17', name: 'Short payday review', route: '/short-payday-review',
    purpose: 'Income below 50% of expected; shows funding labels.',
    actions: [
      { label: 'Run in priority order', to: 'S16', tone: 'primary' },
      { label: 'Adjust this payday', to: 'S16', tone: 'secondary' },
    ],
    later: ['Hold'],
  },
  {
    id: 'S18', name: 'Is this income?', route: '/is-this-income',
    purpose: 'Payment below qualifying minimum.',
    actions: [
      { label: 'Yes', to: 'S16', tone: 'primary' },
      { label: 'No', to: 'S15', mode: 'tab', tone: 'secondary' },
    ],
  },

  // Flow 10: Reviewing history
  {
    id: 'S19', name: 'Income history', route: '/income-history', tab: true,
    purpose: 'All past income events, newest first.',
    actions: [{ label: 'Open event', to: 'S20', tone: 'secondary' }],
  },
  {
    id: 'S20', name: 'Income event detail', route: '/income-event',
    purpose: 'Full split, fees, statuses, references.',
    actions: [
      { label: 'Open receipt', to: 'S21', tone: 'secondary' },
      { label: 'Get help', to: 'S25', tone: 'secondary' },
    ],
    later: ['Send again'],
  },
  {
    id: 'S21', name: 'Transfer receipt', route: '/transfer-receipt',
    purpose: 'Partner reference, session ID, time, fee.',
    actions: [],
    later: ['Share receipt'],
  },

  // Settings and security (flow 11)
  {
    id: 'S22', name: 'Settings', route: '/settings', tab: true,
    purpose:
      'Security, devices, notifications, review window, arrival method, sign out.',
    actions: [{ label: 'Change setting', to: 'S23', tone: 'secondary' }],
    links: [{ label: 'Emergency pause', to: 'S24' }],
  },
  {
    id: 'S23', name: 'Verify change', route: '/verify-change',
    purpose: 'Enter one-time code for a sensitive change or for resume.',
    actions: [{ label: 'Submit code', to: 'S22', mode: 'back', tone: 'primary' }],
  },
  {
    id: 'S24', name: 'Emergency pause', route: '/emergency-pause',
    purpose: 'Confirm pause with PIN.',
    actions: [
      { label: 'Pause', to: 'S15', mode: 'tab', tone: 'critical' },
      { label: 'Cancel', to: 'S15', mode: 'tab', tone: 'secondary' },
    ],
  },
  {
    id: 'S25', name: 'Get help', route: '/get-help',
    purpose: 'Contact support with event reference.',
    actions: [],
    later: ['Open WhatsApp', 'Open email'],
  },
  {
    id: 'S26', name: 'Forward mode setup', route: '/forward-mode-setup',
    purpose:
      "Explain Forward mode; set reminder times; standing-order steps for the user's bank.",
    actions: [{ label: 'Use Forward mode', to: 'S14', tone: 'primary' }],
    later: ['Copy details'],
  },
  {
    id: 'S27', name: 'Salary-switch kit', route: '/salary-switch-kit',
    purpose: 'Generate the HR letter.',
    actions: [],
    links: [{ label: 'Home', to: 'S15', mode: 'tab' }],
    later: ['Create letter', 'Share PDF'],
  },
  {
    id: 'S28', name: 'Send extra once', route: '/send-extra-once',
    purpose: 'Enter a one-off amount for an existing rule.',
    actions: [{ label: 'Send with PIN', to: 'S15', mode: 'tab', tone: 'primary' }],
  },
  {
    id: 'S29', name: 'Send to my account', route: '/send-to-my-account',
    purpose: 'Move unsplit money to the fallback account.',
    actions: [{ label: 'Send with PIN', to: 'S15', mode: 'tab', tone: 'primary' }],
  },
  {
    id: 'S30', name: 'Monthly summary', route: '/monthly-summary',
    purpose: 'Last month’s totals per category, fees, family payments delivered.',
    actions: [],
    links: [{ label: 'Home', to: 'S15', mode: 'tab' }],
    later: ['Share image'],
  },
];

export const screensById: Record<ScreenId, ScreenInfo> = Object.fromEntries(
  screens.map((s) => [s.id, s]),
) as Record<ScreenId, ScreenInfo>;
