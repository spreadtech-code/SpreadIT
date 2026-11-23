// Hidden full-screen preview of PaydayCountdown (stage 1b), opened from the
// Components screen. The countdown ticks from 15:00; any button goes back.
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { PaydayCountdown } from '../src/components';
import { tundeAllocations, tundeFeesKobo, tundeIncomeKobo } from '../src/components/demoData';

const REVIEW_WINDOW_SECONDS = 15 * 60;

export default function ComponentsPaydayPreview() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(REVIEW_WINDOW_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <PaydayCountdown
      receivedKobo={tundeIncomeKobo}
      secondsLeft={secondsLeft}
      allocations={tundeAllocations}
      feesKobo={tundeFeesKobo}
      onExecute={() => router.back()}
      onPause={() => router.back()}
      onCancel={() => router.back()}
    />
  );
}
