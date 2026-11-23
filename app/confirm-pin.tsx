// PIN prompt for actions that need the PIN (full screen, no nav).
// Stage 3: "Skip next payday" on a rule (B13). Later stages add more.
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FieldError, PinField, PIN_LENGTH, Screen } from '../src/components';
import { useApp } from '../src/state/appStore';

export default function ConfirmPinScreen() {
  const router = useRouter();
  const { action, ruleId } = useLocalSearchParams<{ action: string; ruleId?: string }>();
  const enterPin = useApp((s) => s.enterPin);
  const setSkipNext = useApp((s) => s.setSkipNext);
  const rule = useApp((s) => s.plan.rules.find((r) => r.id === ruleId));
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const title = action === 'skipNext' && rule ? `Skip ${rule.name} next payday` : 'Confirm with your PIN';

  const onChange = (value: string) => {
    setPin(value);
    if (value.length < PIN_LENGTH) return;
    const outcome = enterPin(value, Date.now());
    setPin('');
    if (outcome.result === 'wrong') return setError(`Wrong PIN. ${outcome.attemptsLeft} ${outcome.attemptsLeft === 1 ? 'try' : 'tries'} left.`);
    if (outcome.result === 'locked') return setError('Too many wrong PINs. Try again in 30 minutes.');
    if (action === 'skipNext' && ruleId) setSkipNext(ruleId, true);
    router.back();
  };

  return (
    <Screen
      title={title}
      subtitle={
        action === 'skipNext'
          ? 'Its money goes to your leftover account for one payday. The payday after, it runs as normal.'
          : undefined
      }
    >
      <PinField label="Enter your 6-digit PIN" value={pin} onChange={onChange} />
      {error ? <FieldError message={error} /> : null}
    </Screen>
  );
}
