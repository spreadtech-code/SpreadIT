// Change PIN (founder addition, 25 Nov 2026; Figma "8 · More screens / Change PIN"):
// 1. the current PIN (wrong tries count towards the 5-try lock, like Unlock),
// 2. a new PIN, 3. the same again. Then a pretend email and SMS ("Your PIN
// changed. Wasn’t you? Tap to pause everything.") and back to PIN and face unlock.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { FieldError, PinField, PIN_LENGTH, Screen } from '../src/components';
import { securityAlerts } from '../src/payday/paydayStore';
import { useApp } from '../src/state/appStore';

export default function ChangePinScreen() {
  const router = useRouter();
  const enterPin = useApp((s) => s.enterPin);
  const changePin = useApp((s) => s.changePin);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [current, setCurrent] = useState('');
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onCurrent = (pin: string) => {
    setCurrent(pin);
    setError(null);
    if (pin.length < PIN_LENGTH) return;
    const outcome = enterPin(pin, Date.now());
    setCurrent('');
    if (outcome.result === 'wrong') return setError(`Wrong PIN. ${outcome.attemptsLeft} ${outcome.attemptsLeft === 1 ? 'try' : 'tries'} left.`);
    if (outcome.result === 'locked') return setError('Too many wrong PINs. Try again in 30 minutes.');
    setStep(2);
  };

  const onFirst = (pin: string) => {
    setFirst(pin);
    setError(null);
    if (pin.length === PIN_LENGTH) setStep(3);
  };

  const onSecond = (pin: string) => {
    setSecond(pin);
    setError(null);
    if (pin.length < PIN_LENGTH) return;
    if (pin !== first) {
      setFirst('');
      setSecond('');
      setStep(2);
      return setError('Those PINs don’t match. Choose your new PIN again.');
    }
    changePin(pin);
    securityAlerts([{ title: 'Email and SMS: your PIN changed', body: 'Your SpreadIT PIN was changed. Wasn’t you? Tap to pause everything.' }]);
    router.back();
  };

  return (
    <Screen
      step={`Step ${step} of 3`}
      title={step === 1 ? 'Enter your current PIN' : step === 2 ? 'Choose a new PIN' : 'Enter it again'}
      subtitle={step === 1 ? 'Then you’ll choose a new one.' : step === 2 ? '6 digits. Avoid your birthday or 123456.' : 'The same 6 digits, to be sure.'}
      onBack={step === 1 ? undefined : () => { setStep(1); setFirst(''); setSecond(''); setError(null); }}
    >
      {step === 1 ? <PinField key="current" label="Current PIN" value={current} onChange={onCurrent} /> : null}
      {step === 2 ? <PinField key="new" label="New PIN" value={first} onChange={onFirst} /> : null}
      {step === 3 ? <PinField key="again" label="New PIN again" value={second} onChange={onSecond} /> : null}
      {error ? <FieldError message={error} /> : null}
    </Screen>
  );
}
