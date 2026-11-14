import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { colors, radii } from '../constants/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  icon = 'arrow-right',
  disabled = false,
  loading = false,
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => {
        return [
          styles.button,
          (disabled || loading) && styles.disabled,
          pressed && styles.pressed,
        ];
      }}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <View style={styles.content}>
          <AppText color={colors.onPrimary} variant="labelLg">
            {label}
          </AppText>
          <Icon color={colors.onPrimary} name={icon} size={18} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.55,
  },
});
