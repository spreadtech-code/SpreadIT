// S25 Get help (H1): contact support by WhatsApp or email, with the payday's
// reference filled in. Reached from S16, S20, S21 and Settings.
// Opened with ?event=<id> and/or ?ref=<transfer reference>; without them, a
// general question.
// The support email and WhatsApp number are placeholders (src/data/support.ts).
import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Mail, Send } from 'lucide-react-native';
import { Button, Notice, Screen } from '../src/components';
import { support } from '../src/data/support';
import { formatNaira } from '../src/engine/format';
import { dayMonth } from '../src/lib/payDates';
import { usePaydays } from '../src/payday/paydayStore';
import { colors, radius, space, type } from '../src/theme/tokens';

export default function GetHelpScreen() {
  const { event: eventId, ref } = useLocalSearchParams<{ event?: string; ref?: string }>();
  const event = usePaydays((s) => s.events.find((e) => e.id === eventId));
  const [problem, setProblem] = useState<string | null>(null);

  const about = [
    event ? `Payday on ${dayMonth(new Date(event.receivedAt))} · ${formatNaira(event.amountKobo)} · ref ${event.id}` : null,
    ref ? `Transfer ref ${ref}` : null,
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
      title="Need a hand?"
      subtitle={`We reply within ${support.replyWithin}.`}
      footer={
        <>
          <Button
            label="Chat on WhatsApp"
            icon={Send}
            variant="primary"
            onPress={() => open(`whatsapp://send?phone=${support.whatsapp}&text=${encodeURIComponent(message)}`, 'WhatsApp')}
          />
          <Button
            label="Send an email"
            icon={Mail}
            variant="secondary"
            onPress={() => open(`mailto:${support.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, 'email')}
          />
        </>
      }
    >
      <View style={styles.card}>
        <Text style={styles.small}>{about.length > 0 ? 'We’ll attach' : 'Asking about a payday?'}</Text>
        {about.length > 0 ? (
          about.map((line) => (
            <Text key={line} style={styles.body} selectable>
              {line}
            </Text>
          ))
        ) : (
          <Text style={styles.body}>Open it and tap Get help there, and we’ll attach its reference.</Text>
        )}
      </View>
      {problem ? <Notice tone="warning" text={problem} /> : null}
      <Text style={styles.muted}>Prototype: the support number and email are placeholders, so messages won’t reach anyone yet.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.brandSoft, borderRadius: radius.lg, padding: space[4], gap: space[1] },
  small: { ...type.label, color: colors.onBrand },
  body: { ...type.bodyStrong, color: colors.onBrand },
  muted: { ...type.label, color: colors.inkMuted },
});
