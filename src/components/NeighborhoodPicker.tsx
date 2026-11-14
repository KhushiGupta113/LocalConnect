import { Modal, Pressable, StyleSheet, View } from 'react-native';
import {
  neighborhoods,
  type Neighborhood,
} from '../constants/neighborhoods';
import { colors, radii } from '../constants/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

type NeighborhoodPickerProps = {
  visible: boolean;
  selectedName: string;
  onSelect: (neighborhood: Neighborhood) => void;
  onClose: () => void;
};

export function NeighborhoodPicker({
  visible,
  selectedName,
  onSelect,
  onClose,
}: NeighborhoodPickerProps) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable onPress={onClose} style={styles.backdrop}>
        <Pressable style={styles.sheet}>
          <AppText variant="headlineSm">Choose a neighborhood</AppText>
          <AppText color={colors.onSurfaceVariant} variant="bodySm">
            These areas are bundled with the app for this phase. There is no
            location lookup yet.
          </AppText>
          {neighborhoods.map((neighborhood) => {
            const selected = neighborhood.name === selectedName;
            return (
              <Pressable
                accessibilityRole="button"
                key={neighborhood.id}
                onPress={() => {
                  onSelect(neighborhood);
                }}
                style={({ pressed }) => {
                  return [styles.row, pressed && styles.pressed];
                }}
              >
                <View style={styles.copy}>
                  <AppText variant="labelLg">{neighborhood.name}</AppText>
                  <AppText color={colors.onSurfaceVariant} variant="labelSm">
                    {neighborhood.detail}
                  </AppText>
                </View>
                {selected ? (
                  <Icon color={colors.primary} name="check" size={20} />
                ) : null}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(22, 29, 22, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 20,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(192, 201, 194, 0.7)',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.7,
  },
});
