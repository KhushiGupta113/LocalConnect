import { type ReactNode } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors, fontFamilies, radii } from '../constants/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  autoComplete?: 'email' | 'password' | 'name' | 'off' | 'new-password';
  leftIcon?: IconName;
  leftIconColor?: string;
  rightElement?: ReactNode;
  labelExtra?: ReactNode;
  editable?: boolean;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete = 'off',
  leftIcon,
  leftIconColor = colors.onSurfaceVariant,
  rightElement,
  labelExtra,
  editable = true,
}: TextFieldProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <AppText variant="labelMd">{label}</AppText>
        {labelExtra}
      </View>
      <View
        style={[
          styles.field,
          error !== undefined ? styles.fieldError : styles.fieldIdle,
        ]}
      >
        {leftIcon !== undefined ? (
          <Icon color={leftIconColor} name={leftIcon} size={20} />
        ) : null}
        <TextInput
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={false}
          editable={editable}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(64, 73, 68, 0.45)"
          secureTextEntry={secureTextEntry}
          style={[
            styles.input,
            secureTextEntry && value.length > 0 ? styles.secret : null,
          ]}
          value={value}
        />
        {rightElement}
      </View>
      {error !== undefined ? (
        <AppText color={colors.error} variant="labelSm">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  field: {
    minHeight: 48,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldIdle: {
    borderColor: 'rgba(192, 201, 194, 0.7)',
  },
  fieldError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    paddingVertical: 12,
  },
  secret: {
    letterSpacing: 2,
  },
});
