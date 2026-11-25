// CostEstimate (added stage 4, founder-approved): the C6 monthly cost line on
// the plan builder (S6) and the Payday Simulator (S10).
// - Normal: an info Notice (pale aqua, v4).
// - Above 1% of income: the existing warning-hint style (warning-soft fill,
//   warning icon and text) plus a "Ways to lower your costs" link that opens a
//   Sheet of tips. The wording and the 1% test come from the engine.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TriangleExclamationPoint } from 'lucide-react-native';
import { colors, radius, size, space, type } from '../theme/tokens';
import { Button } from './Button';
import { Notice } from './Notice';
import { Sheet } from './Sheet';

export interface CostEstimateProps {
  /** "This plan costs about ₦875 a month (0.10% of your income)". */
  text: string;
  overLimit: boolean;
  /** Shown in the "Ways to lower your costs" sheet. */
  tips: string[];
}

export function CostEstimate({ text, overLimit, tips }: CostEstimateProps) {
  const [open, setOpen] = useState(false);

  if (!overLimit) {
    return <Notice text={text} />;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.warning} accessible accessibilityRole="alert" accessibilityLabel={`Warning. ${text}. That is more than 1% of your income.`}>
        <TriangleExclamationPoint size={size.icon} color={colors.warning} strokeWidth={1.75} />
        <Text style={styles.warningText}>{text}</Text>
      </View>
      <Button label="Ways to lower your costs" variant="quiet" onPress={() => setOpen(true)} />
      <TipsSheet visible={open} tips={tips} onClose={() => setOpen(false)} />
    </View>
  );
}

function TipsSheet({ visible, tips, onClose }: { visible: boolean; tips: string[]; onClose: () => void }) {
  return (
    <Sheet visible={visible} title="Ways to lower your costs" onClose={onClose}>
      {tips.map((tip, i) => (
        <View key={tip} style={styles.tip}>
          <Text style={styles.number}>{i + 1}.</Text>
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  text: { ...type.body, color: colors.inkMuted, flex: 1 },
  wrap: { gap: space[1] },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    backgroundColor: colors.warningSoft,
    borderRadius: radius.sm,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
  },
  warningText: { ...type.body, color: colors.warning, flex: 1 },
  tip: { flexDirection: 'row', gap: space[2] },
  number: { ...type.bodyStrong, color: colors.ink },
  tipText: { ...type.body, color: colors.ink, flex: 1 },
});
