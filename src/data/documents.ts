// Terms and privacy documents (founder addition, 25 Nov 2026).
// PROTOTYPE PLACEHOLDERS: plain summaries of how the prototype works, not legal
// terms. The legal team replaces these before the live pilot.
import { partner } from './partner';

export type DocId = 'terms' | 'privacy' | 'money' | 'fees';

export interface DocSection {
  heading: string;
  text: string;
}

export const documents: Record<DocId, { title: string; updated: string; sections: DocSection[] }> = {
  terms: {
    title: 'Terms of use',
    updated: 'Last updated 25 November 2026',
    sections: [
      { heading: 'Your account', text: `Your SpreadIT account is held in your own name at ${partner.name}. Only you own the money in it.` },
      { heading: 'What SpreadIT does', text: 'When your pay lands, we send it where your plan says. We can’t send it anywhere else.' },
      { heading: 'Your controls', text: 'You can hold, stop or pause any payday, any time. Changes to your plan start from your next payday.' },
      { heading: 'Your PIN', text: 'Keep your PIN to yourself. We’ll never ask for it by phone, SMS or email.' },
    ],
  },
  privacy: {
    title: 'Privacy notice',
    updated: 'Last updated 25 November 2026',
    sections: [
      { heading: 'What we keep', text: 'Your phone number, email, date of birth, your plan, and the accounts you send money to.' },
      { heading: 'Your BVN', text: 'Your bank checks your BVN. We only keep the result, never the number.' },
      { heading: 'Who sees it', text: `${partner.name}, to hold your account and send transfers. Nobody else, unless the law requires it.` },
    ],
  },
  money: {
    title: 'How your money is held',
    updated: 'Last updated 25 November 2026',
    sections: [
      { heading: 'In your name', text: `Your pay sits in an account in your name at ${partner.name}, not in SpreadIT’s own account.` },
      { heading: 'Only your plan moves it', text: 'SpreadIT can only send money to the accounts in your plan, your leftovers account or your backup account.' },
      { heading: 'New accounts wait 24 hours', text: 'A new account in your plan starts getting paid 24 hours after you add it, and changing one needs a 6-digit code.' },
    ],
  },
  fees: {
    title: 'Fees',
    updated: 'Last updated 25 November 2026',
    sections: [
      { heading: 'SpreadIT', text: 'Free while we pilot.' },
      { heading: 'Bank fees', text: 'The bank charges to receive your pay and to send each transfer. You see every fee before any money moves.' },
      { heading: 'Stamp duty', text: '₦50 on each transfer of ₦10,000 or more, set by the government.' },
    ],
  },
};
