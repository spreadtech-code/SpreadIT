// S2 Sign up (A1, A2): phone, email, password, date of birth. One question per step.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, FieldError, Screen, TextField } from '../src/components';
import { space } from '../src/theme/tokens';
import { ageOn, isEmail, isNigerianPhone, parseDateOfBirth, passwordProblem, UNDER_18_MESSAGE } from '../src/lib/forms';
import { useApp } from '../src/state/appStore';

const STEPS = 4;

export default function SignUpScreen() {
  const router = useRouter();
  const signUp = useApp((s) => s.signUp);
  const sendSmsCode = useApp((s) => s.sendSmsCode);

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState<string | null>(null);

  const back = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const next = () => {
    setError(null);
    if (step === 1) {
      if (!isNigerianPhone(phone)) return setError('Enter an 11-digit Nigerian mobile number, like 0803 123 4567.');
    } else if (step === 2) {
      if (!isEmail(email)) return setError('Enter an email address, like name@example.com.');
    } else if (step === 3) {
      const problem = passwordProblem(password);
      if (problem) return setError(problem);
    } else {
      const today = new Date();
      const dob = parseDateOfBirth(day, month, year, today);
      if (!dob) return setError('Enter a real date: day, month and 4-digit year.');
      if (ageOn(dob, today) < 18) return setError(UNDER_18_MESSAGE);
      signUp({ phone, email, password, dateOfBirth: dob });
      sendSmsCode();
      router.replace('/verify-phone-email');
      return;
    }
    setStep(step + 1);
  };

  const titles = ['Your phone number', 'Your email', 'Choose a password', 'Your date of birth'];
  const subtitles = [
    "We'll send a 6-digit code to check it's yours.",
    "We'll send a link to confirm it.",
    `At least 8 characters.`,
    'You must be 18 or over to use SpreadIT.',
  ];

  return (
    <Screen
      step={`Sign up · Step ${step} of ${STEPS}`}
      title={titles[step - 1]}
      subtitle={subtitles[step - 1]}
      onBack={back}
      footer={<Button label={step === STEPS ? 'Continue' : 'Next'} variant="primary" onPress={next} />}
    >
      {step === 1 ? (
        <TextField key="phone" label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" placeholder="0803 123 4567" error={error} autoFocus onSubmitEditing={next} />
      ) : step === 2 ? (
        <TextField key="email" label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" textContentType="emailAddress" placeholder="name@example.com" error={error} autoFocus onSubmitEditing={next} />
      ) : step === 3 ? (
        <TextField key="password" label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" error={error} autoFocus onSubmitEditing={next} />
      ) : (
        <View style={styles.dob}>
          <View style={styles.dobDay}>
            <TextField label="Day" value={day} onChangeText={(t) => setDay(t.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={2} placeholder="DD" autoFocus />
          </View>
          <View style={styles.dobDay}>
            <TextField label="Month" value={month} onChangeText={(t) => setMonth(t.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={2} placeholder="MM" />
          </View>
          <View style={styles.dobYear}>
            <TextField label="Year" value={year} onChangeText={(t) => setYear(t.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={4} placeholder="YYYY" />
          </View>
        </View>
      )}
      {step === 4 && error ? <FieldError message={error} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  dob: { flexDirection: 'row', gap: space[3] },
  dobDay: { flex: 1 },
  dobYear: { flex: 1.6 },
});
