// S17 Short payday review (D4): income below 50% of expected. The split is
// paused and nothing is sent until the user chooses. Shows each rule's funding
// label and shortfall.
// - "Pay in order" (PRD "Run in priority order"): start the review window (S16).
// - "Adjust this payday": skip rules for this payday only; the split updates.
// - "Hold it for now" (PRD "Hold"): keep it unsent; Home shows it as on hold.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, RuleCard, Screen, Toggle, categoryIcon } from '../src/components';
import { formatNaira } from '../src/engine/format';
import { lineNote, ruleTypeText } from '../src/lib/splitText';
import { eventRoute, holdEvent, latestEvent, runInPriorityOrder, setSkipOnce, usePaydays } from '../src/payday/paydayStore';
import { colors, radius, space, type } from '../src/theme/tokens';

export default function ShortPaydayReviewScreen() {
  const router = useRouter();
  const { event: eventId } = useLocalSearchParams<{ event?: string }>();
  const events = usePaydays((s) => s.events);
  const event = eventId ? events.find((e) => e.id === eventId) : latestEvent(events);
  const [adjusting, setAdjusting] = useState(false);

  if (!event) return <Redirect href="/home" />;
  if (event.stage !== 'needsApproval') return <Redirect href={eventRoute(event) as never} />;

  const { split } = event;
  const toggleRule = (ruleId: string, send: boolean) =>
    setSkipOnce(event.id, send ? event.skipOnce.filter((id) => id !== ruleId) : [...event.skipOnce, ruleId]);

  return (
    <Screen
      title="This payday is short"
      subtitle={`${formatNaira(event.amountKobo)} landed. That’s less than half your usual ${formatNaira(event.expectedKobo)}, so nothing moves until you choose.`}
      footer={
        <>
          <Button
            label="Pay in order"
            variant="primary"
            onPress={() => {
              runInPriorityOrder(event.id);
              router.replace(`/payday?event=${event.id}`);
            }}
          />
          <Button
            label={adjusting ? 'Done adjusting' : 'Adjust this payday'}
            variant="secondary"
            onPress={() => setAdjusting(!adjusting)}
          />
          <Button
            label="Hold it for now"
            variant="quiet"
            accessibilityHint="Keeps the money unsent until you split it from Home"
            onPress={() => {
              holdEvent(event.id);
              if (router.canDismiss()) router.dismissAll();
              router.navigate('/home');
            }}
          />
        </>
      }
    >
      {adjusting ? (
        <View style={styles.card}>
          <Text style={styles.heading}>Pay on this payday</Text>
          <Text style={styles.muted}>Turn a rule off to skip it this time only. Its money goes to the rules below it.</Text>
          {event.plan.rules.map((r) => (
            <Toggle key={r.id} label={r.name} value={!event.skipOnce.includes(r.id)} onValueChange={(on) => toggleRule(r.id, on)} />
          ))}
        </View>
      ) : null}

      {split.lines.map((line) => {
        const rule = event.plan.rules.find((r) => r.id === line.ruleId);
        return (
          <RuleCard
            key={line.ruleId}
            name={line.name}
            Icon={categoryIcon(rule?.categoryKey)}
            ruleType={ruleTypeText(rule, event.amountKobo, line)}
            priority={line.priority}
            bankName={rule?.destination?.bankName}
            accountNumber={rule?.destination?.accountNumber}
            amountKobo={line.amountKobo}
            funding={line.funding}
            note={lineNote(line)}
          />
        );
      })}

      <View style={styles.well}>
        <Row label={split.remainder ? split.remainder.name : 'Leftovers'} value={formatNaira(split.remainder?.amountKobo ?? 0)} />
        <Row label="Bank fees" value={formatNaira(split.totalFeesKobo)} />
      </View>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.body}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.brandSoft, borderRadius: radius.lg, padding: space[4], gap: space[3] },
  well: { backgroundColor: colors.surfaceSunken, borderRadius: radius.lg, padding: space[4], gap: space[3] },
  heading: { ...type.headline, color: colors.ink },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: space[3] },
  body: { ...type.label, color: colors.inkMuted, flex: 1 },
  value: { ...type.amountMd, color: colors.ink },
  muted: { ...type.label, color: colors.inkMuted },
});
