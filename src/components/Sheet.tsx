// Sheet (added stage 5a; awaiting founder approval): a bottom sheet over a
// scrim. Pulled out of CostEstimate so the S11 explainer can reuse it. Design system "Space, shape and depth": sheets use
// radius-xl. Used for "Ways to lower your costs" (C6) and the S11 explainer (A5).
import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space, type } from '../theme/tokens';
import { Button } from './Button';

export interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** The closing button. Defaults to "Got it". */
  closeLabel?: string;
}

export function Sheet({ visible, title, onClose, children, closeLabel = 'Got it' }: SheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.scrim}>
        <Pressable style={styles.dismiss} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + space[5] }]} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            {children}
          </ScrollView>
          <Button label={closeLabel} variant="secondary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end' },
  dismiss: { flex: 1, minHeight: space[12] },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space[5],
    paddingTop: space[6],
    gap: space[4],
  },
  body: { gap: space[4] },
  title: { ...type.titleSm, color: colors.ink },
});
