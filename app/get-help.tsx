// S25 Get help (H1): contact support by WhatsApp or email, with the payday's
// reference filled in. Reached from S16, S20, S21 and Settings.
// Opened with ?event=<id> and/or ?ref=<transfer reference>; without them, a
// general question.
// The support email and WhatsApp number are placeholders (src/data/support.ts).
import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Screen } from '../src/components';
import { support } from '../src/data/support';
import { formatNaira } from '../src/engine/format';
import { dayMonth } from '../src/lib/payDates';
import { usePaydays } from '../src/payday/paydayStore';
import { colors, radius, shadow, space, type } from '../src/theme/tokens';

export default function GetHelpScreen() {
  const router = useRouter();
  const { event: eventId, ref } = useLocalSearchParams<{ event?: string; ref?: string }>();
  const event = usePaydays((s) => s.events.find((e) => e.id === eventId));
  const [problem, setProblem] = useState<string | null>(null);

  const about = [
    event ? `Payday reference: ${event.id} (${formatNaira(event.amountKobo)} received ${dayMonth(new Date(event.receivedAt))})` : null,
    ref ? `Transfer reference: ${ref}` : null,
  ].filter((x): x is string => x !== null);
  const message = ['Hello SpreadIT, I need help.', ...about, '', 'What happened:'].join('\n');
  const subject = event ? `Help with payday ${event.id}` : ref ? `Help with transfer ${ref}` : 'Help with SpreadIT';

  const open = async (url: string, app: string) => {
    setProblem(null);
    try {
      await Linking.openURL(url);
    } catch {
      setProblem(`Couldn't open ${app} on this phone. Email us at ${support.email}.`);
    }
  };

  return (
    <Screen
      title="Get help"
      subtitle={`We reply within ${support.replyWithin} during the pilot.`}
      footer={<Button label="Back" variant="quiet" onPress={() => router.back()} />}
    >
      <View style={styles.card}>
        <Text style={styles.heading}>We'll include</Text>
        {about.length > 0 ? (
          about.map((line) => (
            <Text key={line} style={styles.body} selectable>
              {line}
            </Text>
          ))
        ) : (
          <Text style={styles.body}>No payday picked. To ask about a payday, open it and tap Get help there.</Text>
        )}
      </View>

      <Button
        label="Open WhatsApp"
        variant="secondary"
        onPress={() => open(`whatsapp://send?phone=${support.whatsapp}&text=${encodeURIComponent(message)}`, 'WhatsApp')}
      />
      <Button
        label="Open email"
        variant="secondary"
        onPress={() => open(`mailto:${support.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, 'email')}
      />
      {problem ? (
        <Text style={styles.body} accessibilityLiveRegion="polite">
          {problem}
        </Text>
      ) : null}
      <Text style={styles.muted}>Prototype: the support number and email are placeholders, so messages won't reach anyone yet.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[5], gap: space[2], ...shadow.card },
  heading: { ...type.titleSm, color: colors.ink },
  body: { ...type.body, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
});
