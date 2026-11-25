// Terms and privacy (founder addition, 25 Nov 2026; Figma "8 · More screens /
// Terms and privacy"), from Profile > Help. Each row opens a document
// (terms-doc). Prototype: the documents are placeholders until the legal team
// writes them.
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, Landmark, Receipt, ShieldCheck } from 'lucide-react-native';
import { Screen, SettingsGroup, SettingsRow } from '../src/components';
import { documents, type DocId } from '../src/data/documents';
import { colors, type } from '../src/theme/tokens';

const icons: Record<DocId, typeof FileText> = { terms: FileText, privacy: ShieldCheck, money: Landmark, fees: Receipt };

export default function TermsScreen() {
  const router = useRouter();
  return (
    <Screen title="Terms and privacy" subtitle="The rules for using SpreadIT, in plain words.">
      <SettingsGroup>
        {(Object.keys(documents) as DocId[]).map((id) => (
          <SettingsRow key={id} label={documents[id].title} Icon={icons[id]} onPress={() => router.push(`/terms-doc?doc=${id}`)} />
        ))}
      </SettingsGroup>
      <Text style={styles.note}>Prototype: these are placeholders until the legal team writes them.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { ...type.label, color: colors.inkMuted },
});
