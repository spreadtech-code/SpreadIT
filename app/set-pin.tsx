// S4 Set PIN and biometric (A3): create a 6-digit PIN, enter it again, then
// choose face or fingerprint unlock. The switch is saved; real biometric
// unlock comes later (founder decision, stage 3).
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, PinField, PIN_LENGTH, Screen, Toggle } from '../src/components';
import { useApp } from '../src/state/appStore';

export default function SetPinScreen() {
  const router = useRouter();
  const setPin = useApp((s) => s.setPin);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [biometric, setBiometric] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFirst = (pin: string) => {
    setFirst(pin);
    setError(null);
    if (pin.length === PIN_LENGTH) setStep(2);
  };

  const onSecond = (pin: string) => {
    setSecond(pin);
    setError(null);
    if (pin.length < PIN_LENGTH) return;
    if (pin !== first) {
      setFirst('');
      setSecond('');
      setStep(1);
      setError("The PINs don't match. Choose your PIN again.");
      return;
    }
    setStep(3);
  };

  const save = () => {
    setPin(first, biometric);
    router.replace('/income-setup');
  };

  return (
    <Screen
      step={`Step ${step} of 3`}
      title={step === 1 ? 'Create your PIN' : step === 2 ? 'Enter it again' : 'Unlock with face or fingerprint?'}
      subtitle={
        step === 3
          ? 'You can still use your PIN at any time.'
          : 'You use it to open SpreadIT and to confirm money moves. Keep it to yourself.'
      }
      onBack={
        step === 1
          ? null
          : () => {
              setFirst('');
              setSecond('');
              setError(null);
              setStep(1);
            }
      }
      footer={step === 3 ? <Button label="Save PIN" variant="primary" onPress={save} /> : undefined}
    >
      {step === 1 ? <PinField key="first" label="New PIN" value={first} onChange={onFirst} error={error} /> : null}
      {step === 2 ? <PinField key="second" label="Same PIN again" value={second} onChange={onSecond} /> : null}
      {step === 3 ? (
        <Toggle
          label="Unlock with face or fingerprint"
          description="Open SpreadIT with your phone's face or fingerprint unlock."
          value={biometric}
          onValueChange={setBiometric}
        />
      ) : null}
    </Screen>
  );
}
