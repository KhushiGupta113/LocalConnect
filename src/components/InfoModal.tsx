import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { colors, radii } from '../constants/theme';
import { AppText } from './AppText';

type InfoModalProps = {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
};

export function InfoModal({ visible, title, body, onClose }: InfoModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <AppText variant="headlineSm">{title}</AppText>
          <AppText color={colors.onSurfaceVariant} variant="bodyMd">
            {body}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => {
              return [styles.close, pressed && styles.pressed];
            }}
          >
            <AppText color={colors.onPrimary} variant="labelLg">
              Close
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(22, 29, 22, 0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 20,
    gap: 12,
  },
  close: {
    marginTop: 4,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
});
