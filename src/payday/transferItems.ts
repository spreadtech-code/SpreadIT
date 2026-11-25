// Each sent transfer as an ActivityList row, with its live status from the
// fake bank (D6, D7, D10). Used by Home (S15) and the payday screen (S16).
import { Wallet } from 'lucide-react-native';
import type { ActivityItem } from '../components/ActivityList';
import { categoryIcon } from '../components/categoryIcons';
import { maskAccount } from '../engine/format';
import { timeText } from '../lib/splitText';
import type { IncomeEvent } from './events';
import { bankTransfer } from './paydayStore';

export function transferItems(event: IncomeEvent, t: number, onPress?: (reference: string) => void): ActivityItem[] {
  return event.transfers.map((tr) => {
    const b = bankTransfer(tr.reference);
    const status = b?.status ?? 'Pending';
    const account = `${tr.destination.bankName} ${maskAccount(tr.destination.accountNumber)}`;
    let meta = tr.toFallback ? `${account} (backup)` : account;
    if (tr.resendOf) meta = `${meta} · sent again`;
    if (status === 'Retrying' && b?.nextAttemptAt) {
      const mins = Math.max(0, Math.ceil((b.nextAttemptAt - t) / 60_000));
      meta = `Next try ${timeText(b.nextAttemptAt)}${mins <= 1 ? '' : ` (in ${mins} min)`}`;
    }
    if (status === 'Sent to fallback') meta = `${b?.failureReason ?? 'Didn’t go'}. Sent to your backup account.`;
    if (status === 'Failed') meta = `${b?.failureReason ?? 'Didn’t go'}. Back in your SpreadIT account.`;
    if (status === 'Reversed') meta = 'Returned by the bank. Back in your SpreadIT account.';
    return {
      id: tr.reference,
      name: tr.name,
      meta,
      direction: 'out' as const,
      amountKobo: tr.amountKobo,
      status,
      Icon: tr.id === 'remainder' ? Wallet : categoryIcon(tr.categoryKey),
      onPress: onPress ? () => onPress(tr.reference) : undefined,
    };
  });
}

