import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii } from '../constants/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { PrimaryButton } from './PrimaryButton';

type PhaseNoticeProps = {
  icon: IconName;
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  children?: ReactNode;
};

export function PhaseNotice({
  icon,
  title,
  body,
  actionLabel,
  onAction,
  children,
}: PhaseNoticeProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24 }]}>
      <View style={styles.iconWrap}>
        <Icon color={colors.primaryContainer} name={icon} size={28} />
      </View>
      <AppText style={styles.title} variant="headlineLg">
        {title}
      </AppText>
      <AppText color={colors.onSurfaceVariant} style={styles.body} variant="bodyMd">
        {body}
      </AppText>
      {children}
      <PrimaryButton icon="arrow-right" label={actionLabel} onPress={onAction} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    gap: 16,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.primary,
  },
  body: {
    lineHeight: 22,
  },
});
