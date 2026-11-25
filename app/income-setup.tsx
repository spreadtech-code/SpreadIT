// S5 Income setup (A8, A9, D14): income type, expected amount, frequency,
// pay date, qualifying minimum, arrival method, weekly batching (varied income
// only). One question per step. Save -> S6 Plan builder.
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { AmountField, Button, FieldError, OptionList, Screen, TextField, Toggle, type Option } from '../src/components';
import { formatNaira } from '../src/engine/format';
import { useApp, type Income } from '../src/state/appStore';

type StepId = 'type' | 'expected' | 'frequency' | 'payDate' | 'minimum' | 'arrival' | 'batching';

const typeOptions: Option<Income['type']>[] = [
  { value: 'regular', label: 'Regular', description: 'A salary of about the same amount on about the same date.' },
  { value: 'varies', label: 'It varies', description: 'Freelance or business payments of different sizes.' },
];
const frequencyOptions: Option<Income['frequency']>[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'twoWeekly', label: 'Every 2 weeks' },
  { value: 'weekly', label: 'Weekly' },
];
const weekdayOptions: Option<'1' | '2' | '3' | '4' | '5'>[] = [
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
];
const arrivalOptions: Option<Income['arrival']>[] = [
  {
    value: 'forward',
    label: 'Forward mode',
    description: 'Keep being paid at your bank. On payday, send your pay to SpreadIT in one transfer. We remind you.',
  },
  { value: 'direct', label: 'Paid in directly', description: 'Your employer or clients pay straight into your SpreadIT account.' },
];

/** A8: 50% of expected for regular income (whole naira), ₦50,000 for varied. */
function defaultMinimum(type: Income['type'], expectedKobo: number): number {
  return type === 'regular' ? Math.floor(expectedKobo / 2 / 100) * 100 : 5_000_000;
}

export default function IncomeSetupScreen() {
  const router = useRouter();
  const saveIncome = useApp((s) => s.saveIncome);

  const [type, setType] = useState<Income['type'] | null>(null);
  const [expected, setExpected] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<Income['frequency'] | null>(null);
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [weekday, setWeekday] = useState<'1' | '2' | '3' | '4' | '5' | null>(null);
  const [minimum, setMinimum] = useState<number | null>(null);
  const [minimumTouched, setMinimumTouched] = useState(false);
  const [arrival, setArrival] = useState<Income['arrival'] | null>(null);
  const [batching, setBatching] = useState(false);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Pay date is skipped for varied income; weekly batching only shows for varied income.
  const steps = useMemo<StepId[]>(
    () => [
      'type',
      'expected',
      'frequency',
      ...(type === 'varies' ? [] : (['payDate'] as StepId[])),
      'minimum',
      'arrival',
      ...(type === 'varies' ? (['batching'] as StepId[]) : []),
    ],
    [type],
  );
  const step = steps[index];
  const last = index === steps.length - 1;

  const back = () => {
    setError(null);
    if (index > 0) setIndex(index - 1);
    else router.back();
  };

  const next = () => {
    setError(null);
    if (step === 'type' && !type) return setError('Choose one.');
    if (step === 'expected' && (!expected || expected <= 0)) return setError('Enter the amount you expect each payday.');
    if (step === 'frequency' && !frequency) return setError('Choose one.');
    if (step === 'payDate') {
      if (frequency === 'monthly') {
        const d = Number(dayOfMonth);
        if (!/^\d{1,2}$/.test(dayOfMonth) || d < 1 || d > 31) return setError('Enter a day from 1 to 31.');
      } else if (!weekday) return setError('Choose a day.');
    }
    if (step === 'expected' && !minimumTouched && type && expected) setMinimum(defaultMinimum(type, expected));
    if (step === 'minimum' && (!minimum || minimum <= 0)) return setError('Enter a minimum amount.');
    if (step === 'arrival' && !arrival) return setError('Choose one.');

    if (!last) return setIndex(index + 1);

    saveIncome({
      type: type!,
      expectedKobo: expected!,
      frequency: frequency!,
      payDayOfMonth: type === 'regular' && frequency === 'monthly' ? Number(dayOfMonth) : null,
      payWeekday: type === 'regular' && frequency !== 'monthly' && weekday ? Number(weekday) : null,
      qualifyingMinimumKobo: minimum!,
      arrival: arrival!,
      weeklyBatching: type === 'varies' && batching,
    });
    if (router.canDismiss()) router.dismissAll();
    router.replace('/plan-builder');
  };

  const titles: Record<StepId, string> = {
    type: 'How are you paid?',
    expected: type === 'varies' ? 'How much is a typical payment?' : 'How much lands each payday?',
    frequency: type === 'varies' ? 'Roughly how often are you paid?' : 'How often are you paid?',
    payDate: frequency === 'monthly' ? 'Which day of the month?' : 'Which day of the week?',
    minimum: 'Smallest payment to split by itself',
    arrival: 'How will your pay reach SpreadIT?',
    batching: 'Split once a week?',
  };

  return (
    <Screen
      step={`Step ${index + 1} of ${steps.length}`}
      title={titles[step]}
      onBack={back}
      footer={<Button label={last ? 'Save' : 'Next'} variant="primary" onPress={next} />}
    >
      {step === 'type' ? (
        <OptionList accessibilityLabel="Income type" options={typeOptions} value={type} onChange={(v) => { setType(v); setError(null); }} />
      ) : null}
      {step === 'expected' ? (
        <AmountField
          label="After tax"
          valueKobo={expected}
          onChangeKobo={setExpected}
          helper="Roughly is fine. We use it to check your plan and spot a short payday."
        />
      ) : null}
      {step === 'frequency' ? (
        <OptionList accessibilityLabel="Pay frequency" options={frequencyOptions} value={frequency} onChange={setFrequency} />
      ) : null}
      {step === 'payDate' && frequency === 'monthly' ? (
        <TextField
          label="Day of the month"
          value={dayOfMonth}
          onChangeText={(t) => setDayOfMonth(t.replace(/\D/g, ''))}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="25"
          helper="If it moves around, pick the usual day."
          autoFocus
        />
      ) : null}
      {step === 'payDate' && frequency !== 'monthly' ? (
        <OptionList accessibilityLabel="Pay day" options={weekdayOptions} value={weekday} onChange={setWeekday} />
      ) : null}
      {step === 'minimum' ? (
        <AmountField
          label="Your minimum"
          valueKobo={minimum}
          onChangeKobo={(k) => {
            setMinimum(k);
            setMinimumTouched(true);
          }}
          helper={`Payments below this ask you “Is this pay?” first. Suggested: ${formatNaira(
            defaultMinimum(type ?? 'regular', expected ?? 0),
          )}.`}
        />
      ) : null}
      {step === 'arrival' ? (
        <OptionList accessibilityLabel="How income arrives" options={arrivalOptions} value={arrival} onChange={setArrival} />
      ) : null}
      {step === 'batching' ? (
        <Toggle
          label="Split weekly"
          description="Hold qualifying payments and split them together every Friday at 9am."
          value={batching}
          onValueChange={setBatching}
        />
      ) : null}
      {error ? <FieldError message={error} /> : null}
    </Screen>
  );
}
