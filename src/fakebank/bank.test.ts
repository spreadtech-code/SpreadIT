// The fake bank's money side: income in, transfers out, statuses (D6, D7, D9, D10).
import { paystackNov2026 as schedule } from '../data/feeSchedule';
import {
  advance,
  createRecipient,
  emptyBank,
  getTransferStatus,
  KEEP_TRYING_LIMIT_MS,
  receiveIncome,
  RETRY_LIMIT_MS,
  retryOffsets,
  reverseTransfer,
  sendTransfer,
  type BankState,
} from './bank';

const naira = (n: number) => Math.round(n * 100);
const T0 = 1_800_000_000_000;
const mum = { bankName: 'GTBank', accountNumber: '0123454821', accountName: 'Folasade Adeyemi' };
const own = { bankName: 'Kuda', accountNumber: '2004118832', accountName: 'Tunde Adeyemi' };

function funded(amountNaira = 850_000): BankState {
  let s = receiveIncome(emptyBank, { reference: 'PAY1', amountKobo: naira(amountNaira), sender: 'Employer', receivedAt: T0 }, schedule).state;
  s = createRecipient(s, mum).state;
  s = createRecipient(s, own).state;
  return s;
}

function send(s: BankState, reference = 'TR1', amountNaira = 80_000, extra = {}) {
  const r = sendTransfer(
    s,
    { reference, recipientCode: 'RCP_GTBANK_0123454821', amountKobo: naira(amountNaira), narration: 'From Tunde Adeyemi – Mum', fallbackRecipientCode: 'RCP_KUDA_2004118832', ...extra },
    schedule,
    T0,
  );
  if (!r.ok) throw new Error(r.reason);
  return r;
}

describe('receiveIncome', () => {
  it('credits the payment minus the inflow fee (₦300 cap)', () => {
    expect(funded().balanceKobo).toBe(naira(850_000 - 300));
  });

  it('D9: the same payment notice 10 times credits once', () => {
    let s = emptyBank;
    for (let i = 0; i < 10; i++) {
      s = receiveIncome(s, { reference: 'PAY1', amountKobo: naira(850_000), sender: 'Employer', receivedAt: T0 }, schedule).state;
    }
    expect(Object.keys(s.payments)).toHaveLength(1);
    expect(s.balanceKobo).toBe(naira(849_700));
  });
});

describe('createRecipient', () => {
  it('gives the same account the same code', () => {
    const s = funded();
    expect(createRecipient(s, mum).state).toBe(s);
    expect(Object.keys(s.recipients)).toHaveLength(2);
  });
});

describe('sendTransfer and statuses (D6)', () => {
  it('debits amount + fee and moves Pending -> Processing -> Successful', () => {
    const { state } = send(funded());
    expect(state.balanceKobo).toBe(naira(849_700 - 80_000 - 100)); // ₦50 + ₦50 stamp duty
    expect(state.transfers.TR1.status).toBe('Pending');
    expect(getTransferStatus(state, 'TR1', T0 + 2_000).transfer?.status).toBe('Processing');
    expect(getTransferStatus(state, 'TR1', T0 + 5_000).transfer?.status).toBe('Successful');
  });

  it('D9: the same transfer reference sends once', () => {
    const first = send(funded());
    const again = sendTransfer(first.state, { reference: 'TR1', recipientCode: 'RCP_GTBANK_0123454821', amountKobo: naira(80_000), narration: 'x' }, schedule, T0);
    expect(again.ok && again.duplicate).toBe(true);
    expect(again.ok && again.state.balanceKobo).toBe(first.state.balanceKobo);
  });

  it('refuses a transfer the balance cannot cover', () => {
    const r = sendTransfer(funded(1_000), { reference: 'BIG', recipientCode: 'RCP_GTBANK_0123454821', amountKobo: naira(5_000), narration: 'x' }, schedule, T0);
    expect(r).toEqual({ ok: false, reason: 'insufficientFunds' });
  });
});

describe('Failures, retry and fallback (D7)', () => {
  it('retries at 30 seconds, 2 minutes, 10 minutes, then every 30 minutes, up to 6 hours', () => {
    const o = retryOffsets(RETRY_LIMIT_MS);
    expect(o.slice(0, 5)).toEqual([30_000, 120_000, 600_000, 2_400_000, 4_200_000]);
    expect(o[o.length - 1]).toBe(RETRY_LIMIT_MS);
  });

  it('temporary: Retrying with a next attempt time, then Sent to fallback after 6 hours', () => {
    let s: BankState = { ...funded(), nextFailure: 'temporary' };
    s = send(s).state;
    expect(s.nextFailure).toBeNull(); // used once
    const failedAt = T0 + 5_000;
    s = advance(s, failedAt);
    expect(s.transfers.TR1.status).toBe('Retrying');
    expect(s.transfers.TR1.nextAttemptAt).toBe(failedAt + 30_000);
    s = advance(s, failedAt + 3 * 60_000);
    expect(s.transfers.TR1.nextAttemptAt).toBe(failedAt + 600_000);
    s = advance(s, failedAt + RETRY_LIMIT_MS - 1);
    expect(s.transfers.TR1.status).toBe('Retrying');
    s = advance(s, failedAt + RETRY_LIMIT_MS);
    expect(s.transfers.TR1.status).toBe('Sent to fallback');
  });

  it('keep-trying (B15) holds out for 72 hours', () => {
    let s: BankState = { ...funded(), nextFailure: 'temporary' };
    s = send(s, 'TR1', 80_000, { keepTrying: true }).state;
    s = advance(s, T0 + 5_000 + RETRY_LIMIT_MS);
    expect(s.transfers.TR1.status).toBe('Retrying');
    s = advance(s, T0 + 5_000 + KEEP_TRYING_LIMIT_MS);
    expect(s.transfers.TR1.status).toBe('Sent to fallback');
  });

  it('permanent: Sent to fallback at once, with the reason', () => {
    let s: BankState = { ...funded(), nextFailure: 'permanent' };
    s = send(s).state;
    s = advance(s, T0 + 5_000);
    expect(s.transfers.TR1.status).toBe('Sent to fallback');
    expect(s.transfers.TR1.failureReason).toBe('The account is closed');
  });

  it('with no fallback account: Failed, and the money comes back', () => {
    let s: BankState = { ...funded(), nextFailure: 'permanent' };
    const before = s.balanceKobo;
    s = send(s, 'TR1', 80_000, { fallbackRecipientCode: null }).state;
    s = advance(s, T0 + 5_000);
    expect(s.transfers.TR1.status).toBe('Failed');
    expect(s.balanceKobo).toBe(before);
  });
});

describe('Reversals (D10)', () => {
  it('marks a Successful transfer Reversed and returns the amount', () => {
    let s = advance(send(funded()).state, T0 + 5_000);
    const before = s.balanceKobo;
    s = reverseTransfer(s, 'TR1', T0 + 60_000);
    expect(s.transfers.TR1.status).toBe('Reversed');
    expect(s.balanceKobo).toBe(before + naira(80_000));
  });

  it('ignores a transfer that is not Successful', () => {
    const s = send(funded()).state;
    expect(reverseTransfer(s, 'TR1', T0)).toBe(s);
  });
});
