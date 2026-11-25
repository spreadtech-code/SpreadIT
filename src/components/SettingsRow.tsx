// SettingsRow + SettingsGroup (docs/design-system.md v4, Figma "SettingsRow", S22
// Profile): a white card of rows split by thin lines, with an optional muted
// group title above. Each row: a pale-blue icon bubble, a label, an optional value
// on the right ("On", "15 min") and a chevron when it opens something.
// Tone "critical" is for Pause everything and Log out (red, no chevron).
// With `switchValue` the row is an on/off switch instead (tap anywhere on it).
import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { colors, radius, shadow, size, space, type } from '../theme/tokens';

export interface SettingsRowProps {
  label: string;
  Icon: LucideIcon;
  value?: string;
  onPress?: () => void;
  tone?: 'default' | 'critical';
  accessibilityHint?: string;
  /** Makes the row a switch. onPress is then ignored. */
  switchValue?: boolean;
  onSwitch?: (value: boolean) => void;
}

export function SettingsRow({ label, Icon, value, onPress, tone = 'default', accessibilityHint, switchValue, onSwitch }: SettingsRowProps) {
  const critical = tone === 'critical';
  const isSwitch = switchValue !== undefined && onSwitch !== undefined;
  const press = isSwitch ? () => onSwitch(!switchValue) : onPress;
  return (
    <Pressable
      onPress={press}
      disabled={!press}
      accessibilityRole={isSwitch ? 'switch' : press ? 'button' : undefined}
      accessibilityState={isSwitch ? { checked: switchValue } : undefined}
      accessibilityLabel={value ? `${label}, ${value}` : label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.bubble, critical && styles.bubbleCritical]}>
        <Icon size={size.iconSm} color={critical ? colors.critical : colors.primary} strokeWidth={1.75} />
      </View>
      <Text style={[styles.label, critical && styles.labelCritical]} numberOfLines={2}>
        {label}
      </Text>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitch}
          trackColor={{ false: colors.line, true: colors.primary }}
          thumbColor={colors.raised}
          ios_backgroundColor={colors.line}
          importantForAccessibility="no"
          accessibilityElementsHidden
        />
      ) : onPress && !critical ? (
        <ChevronRight size={size.iconSm} color={colors.inkFaint} strokeWidth={1.75} />
      ) : null}
    </Pressable>
  );
}

export function SettingsGroup({ title, children }: { title?: string; children: ReactNode }) {
  const rows = Children.toArray(children);
  return (
    <View style={styles.group}>
      {title ? (
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      <View style={styles.card}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 ? <View style={styles.hairline} /> : null}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: space[2] },
  title: { ...type.labelStrong, color: colors.inkMuted },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: space[4], ...shadow.card },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginLeft: size.bubbleSm + space[3] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: size.buttonHeight, paddingVertical: space[2] },
  pressed: { opacity: 0.7 },
  bubble: {
    width: size.bubbleSm,
    height: size.bubbleSm,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleCritical: { backgroundColor: colors.criticalSoft },
  label: { ...type.body, color: colors.ink, flex: 1 },
  labelCritical: { color: colors.critical },
  value: { ...type.label, color: colors.inkMuted },
});
