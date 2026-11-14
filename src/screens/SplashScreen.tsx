import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { images } from '../constants/images';
import { colors, radii } from '../constants/theme';
import { AppText } from '../components/AppText';
import { Icon } from '../components/Icon';

type SplashScreenProps = {
  autoAdvance: boolean;
  onContinue: () => void;
};

export function SplashScreen({ autoAdvance, onContinue }: SplashScreenProps) {
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [progress]);

  useEffect(() => {
    if (!autoAdvance) {
      return;
    }
    const timer = setTimeout(() => {
      onContinue();
    }, 2200);
    return () => {
      clearTimeout(timer);
    };
  }, [autoAdvance, onContinue]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-90, 170],
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={autoAdvance ? 'LocalConnect splash' : 'Continue to sign in'}
      disabled={autoAdvance}
      onPress={onContinue}
      style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
    >
      <View style={styles.glowTop} />
      <View style={styles.glowLeft} />
      <View style={styles.center}>
        <View style={styles.badgeWrap}>
          <View style={styles.halo} />
          <View style={styles.badge}>
            <Image source={images.logo} style={styles.logo} />
          </View>
          <View style={styles.check}>
            <Icon color={colors.onTertiaryFixed} name="check" size={12} />
          </View>
        </View>
        <AppText color={colors.onPrimary} style={styles.wordmark} variant="display">
          LocalConnect
        </AppText>
        <View style={styles.tagline}>
          <View style={styles.dot} />
          <AppText color={colors.surfaceContainer} variant="bodyMd">
            Your neighborhood, connected.
          </AppText>
        </View>
        <View style={styles.pills}>
          <View style={styles.pill}>
            <Icon color={colors.primaryFixedDim} name="shield-outline" size={14} />
            <AppText color={colors.primaryFixedDim} variant="labelSm">
              Verified Local
            </AppText>
          </View>
          <AppText color={colors.outlineVariant} variant="labelSm">
            •
          </AppText>
          <View style={styles.pill}>
            <Icon color={colors.primaryFixedDim} name="nature-people" size={14} />
            <AppText color={colors.primaryFixedDim} variant="labelSm">
              Oakridge Ward
            </AppText>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.track}>
          <Animated.View style={[styles.bar, { transform: [{ translateX }] }]} />
        </View>
        <AppText color={colors.surfaceContainerHigh} variant="labelMd">
          v2.4 • Connecting Oakridge & beyond
        </AppText>
        <View style={styles.syncRow}>
          <Icon color={colors.onPrimaryContainer} name="sync" size={12} />
          <AppText color={colors.onPrimaryContainer} variant="labelSm">
            {autoAdvance ? 'Syncing neighborhood feeds' : 'Tap to continue'}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  glowTop: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(135, 189, 166, 0.22)',
  },
  glowLeft: {
    position: 'absolute',
    top: '38%',
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(197, 239, 159, 0.08)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrap: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  halo: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1,
    borderColor: 'rgba(183, 238, 213, 0.28)',
  },
  badge: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.surfaceContainerLowest,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  check: {
    position: 'absolute',
    right: 10,
    bottom: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.tertiaryFixedDim,
    borderWidth: 2,
    borderColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    textAlign: 'center',
  },
  tagline: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(26, 80, 61, 0.45)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.tertiaryFixedDim,
  },
  pills: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(183, 238, 213, 0.16)',
  },
  footer: {
    alignItems: 'center',
    gap: 10,
  },
  track: {
    width: 176,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(183, 238, 213, 0.18)',
    overflow: 'hidden',
  },
  bar: {
    width: 80,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryFixedDim,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
