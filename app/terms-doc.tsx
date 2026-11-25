// One Terms and privacy document (founder addition, 25 Nov 2026; Figma
// "8 · More screens / Terms of use"). Opened with ?doc=terms|privacy|money|fees.
// Placeholder text until the legal team writes the real documents.
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { Screen } from '../src/components';
import { documents, type DocId } from '../src/data/documents';
import { colors, space, type } from '../src/theme/tokens';

export default function TermsDocScreen() {
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const d = doc && doc in documents ? documents[doc as DocId] : null;
  if (!d) return <Redirect href="/terms" />;

  return (
    <Screen title={d.title} subtitle={d.updated}>
      {d.sections.map((s) => (
        <View key={s.heading} style={styles.section}>
          <Text style={styles.heading} accessibilityRole="header">
            {s.heading}
          </Text>
          <Text style={styles.body}>{s.text}</Text>
        </View>
      ))}
      <Text style={styles.note}>Placeholder text for the prototype. Not legal terms.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: space[1] },
  heading: { ...type.headline, color: colors.ink },
  body: { ...type.body, color: colors.ink },
  note: { ...type.label, color: colors.inkMuted },
});
