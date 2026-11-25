// Notifications (founder addition, 25 Nov 2026; Figma "8 · More screens /
// Notifications"): every pretend push and SMS, newest first, behind the bell on
// Home. Filters: All / Money (paydays and transfers) / Security (changes to your
// plan, pause reminders). Items newer than the last visit have a dot. Tapping one
// opens what it's about. Opening the screen marks everything as seen.
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowDownLeft, Bell, CircleCheck, RefreshCw, ShieldCheck, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { Chip, InsightCard, Screen } from '../src/components';
import { dayMonth } from '../src/lib/payDates';
import { timeText } from '../src/lib/splitText';
import { now } from '../src/fakebank/bankStore';
import { markInboxSeen, usePaydays, type PretendAlert } from '../src/payday/paydayStore';
import { colors, radius, size, space, type } from '../src/theme/tokens';

type Filter = 'all' | 'money' | 'security';

/** An icon and tone from the alert's words. */
function look(a: PretendAlert): { Icon: LucideIcon; fill: string; ink: string } {
  const t = a.title.toLowerCase();
  if (a.kind === 'security') return { Icon: ShieldCheck, fill: colors.brandSoft, ink: colors.primary };
  if (t.includes('didn’t go') || t.includes('returned')) return { Icon: TriangleAlert, fill: colors.criticalSoft, ink: colors.critical };
  if (t.includes('trying again') || t.includes('backup')) return { Icon: RefreshCw, fill: colors.warningSoft, ink: colors.warning };
  if (t.includes('done')) return { Icon: CircleCheck, fill: colors.brandSoft, ink: colors.primary };
  if (t.includes('landed') || t.includes('pay')) return { Icon: ArrowDownLeft, fill: colors.brandSoft, ink: colors.primary };
  return { Icon: Bell, fill: colors.brandSoft, ink: colors.primary };
}

export default function NotificationsScreen() {
  const router = useRouter();
  const inbox = usePaydays((s) => s.inbox ?? []);
  const seenAt = usePaydays((s) => s.inboxSeenAt ?? 0);
  const [filter, setFilter] = useState<Filter>('all');
  // Keep the dots for this visit; everything counts as seen from now on.
  const [seenBefore] = useState(seenAt);
  useEffect(() => markInboxSeen(), []);

  const today = new Date(now());
  const groups = useMemo(() => {
    const list = [...inbox]
      .filter((a) => filter === 'all' || (a.kind ?? 'money') === filter)
      .sort((a, b) => b.createdAt - a.createdAt);
    const isToday = (t: number) => new Date(t).toDateString() === today.toDateString();
    return [
      { title: 'Today', items: list.filter((a) => isToday(a.createdAt)) },
      { title: 'Earlier', items: list.filter((a) => !isToday(a.createdAt)) },
    ].filter((g) => g.items.length > 0);
  }, [inbox, filter, today.toDateString()]);

  return (
    <Screen title="Notifications">
      <View style={styles.chips}>
        <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="Money" selected={filter === 'money'} onPress={() => setFilter('money')} />
        <Chip label="Security" selected={filter === 'security'} onPress={() => setFilter('security')} />
      </View>

      {groups.length === 0 ? (
        <InsightCard title="Nothing yet" text="Paydays, transfers and changes to your plan show here." />
      ) : (
        groups.map((g) => (
          <View key={g.title} style={styles.group}>
            <Text style={styles.groupTitle} accessibilityRole="header">
              {g.title}
            </Text>
            {g.items.map((a) => {
              const { Icon, fill, ink } = look(a);
              const unread = a.createdAt > seenBefore;
              const when = new Date(a.createdAt).toDateString() === today.toDateString() ? timeText(a.createdAt) : dayMonth(new Date(a.createdAt));
              return (
                <Pressable
                  key={a.id}
                  onPress={() => router.push(a.route as never)}
                  accessibilityRole="button"
                  accessibilityLabel={`${unread ? 'New. ' : ''}${a.title}. ${a.body}. ${when}`}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                >
                  <View style={[styles.bubble, { backgroundColor: fill }]}>
                    <Icon size={size.icon} color={ink} strokeWidth={1.75} />
                  </View>
                  <View style={styles.text}>
                    <View style={styles.top}>
                      <Text style={styles.title}>{a.title}</Text>
                      <Text style={styles.time}>{when}</Text>
                      {unread ? <View style={styles.dot} /> : null}
                    </View>
                    <Text style={styles.body}>{a.body}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', gap: space[2] },
  group: { gap: space[1] },
  groupTitle: { ...type.labelStrong, color: colors.inkMuted },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3], paddingVertical: space[2], minHeight: size.touchMin },
  pressed: { opacity: 0.7 },
  bubble: { width: size.bubble, height: size.bubble, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  top: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  title: { ...type.bodyStrong, color: colors.ink, flex: 1 },
  time: { ...type.caption, color: colors.inkMuted },
  dot: { width: space[2], height: space[2], borderRadius: radius.pill, backgroundColor: colors.primary },
  body: { ...type.label, color: colors.inkMuted },
});
