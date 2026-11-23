// InsightCard (docs/design-system.md): a calm fact SpreadIT noticed, on a
// brand-soft card with no border. Facts only, never advice. One at a time.
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type } from '../theme/tokens';

export function InsightCard({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.card} accessible accessibilityLabel={`${title}. ${text}`}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.brandSoft,
    borderRadius: radius.lg,
    padding: space[5],
    gap: space[1],
  },
  title: { ...type.headline, color: colors.brandStrong },
  text: { ...type.body, color: colors.ink },
});
