import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { laterPhase } from '../constants/copy';
import { images } from '../constants/images';
import { colors, radii } from '../constants/theme';
import { AppText } from '../components/AppText';
import { Icon } from '../components/Icon';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useAuth } from '../hooks/useAuth';
import { useReturnToSplash } from '../navigation/gate';
import { hasErrors, validateLogin } from '../services/validation';
import type { AuthStackParamList } from '../types/navigation';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const returnToSplash = useReturnToSplash();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  async function handleLogin() {
    const nextErrors = validateLogin({ email, password });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      return;
    }
    const message = await signIn(email, password);
    if (message !== null) {
      setErrors({ password: message });
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="Back to splash"
            accessibilityRole="button"
            onPress={returnToSplash}
            style={styles.iconButton}
          >
            <Icon color={colors.onSurfaceVariant} name="arrow-left" size={22} />
          </Pressable>
          <View style={styles.brand}>
            <Image source={images.logo} style={styles.brandLogo} />
            <AppText color={colors.primary} variant="labelMd">
              LocalConnect
            </AppText>
          </View>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.intro}>
          <View style={styles.hub}>
            <Icon color={colors.onTertiaryFixedVariant} name="map-marker" size={14} />
            <AppText color={colors.onTertiaryFixedVariant} variant="labelSm">
              Oakridge Commons Hub
            </AppText>
          </View>
          <AppText variant="display">Welcome back</AppText>
          <AppText color={colors.onSurfaceVariant} variant="bodyMd">
            Sign in to see what’s happening around Oakridge Commons
          </AppText>
        </View>
        <View style={styles.form}>
          <TextField
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
            keyboardType="email-address"
            label="Email address"
            leftIcon="email-outline"
            onChangeText={setEmail}
            placeholder="sarah.jenkins@example.com"
            value={email}
          />
          <TextField
            autoCapitalize="none"
            autoComplete="password"
            error={errors.password}
            label="Password"
            leftIcon="lock-outline"
            onChangeText={setPassword}
            placeholder="••••••••••••"
            rightElement={
              <Pressable
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => {
                  setShowPassword((current) => {
                    return !current;
                  });
                }}
              >
                <Icon
                  color={colors.onSurfaceVariant}
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                />
              </Pressable>
            }
            secureTextEntry={!showPassword}
            value={password}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Alert.alert('Forgot password', laterPhase.forgotPassword);
            }}
            style={styles.forgot}
          >
            <AppText color={colors.primaryContainer} variant="labelMd">
              Forgot password?
            </AppText>
          </Pressable>
          <PrimaryButton label="Log In" onPress={handleLogin} />
        </View>
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <AppText color={colors.onSurfaceVariant} style={styles.dividerLabel} variant="labelSm">
            or continue with
          </AppText>
        </View>
        <View style={styles.socialRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Alert.alert('Google', laterPhase.google);
            }}
            style={({ pressed }) => {
              return [styles.social, pressed && styles.pressed];
            }}
          >
            <Icon color="#4285F4" name="google" size={18} />
            <AppText variant="labelMd">Google</AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Alert.alert('Passkey', laterPhase.passkey);
            }}
            style={({ pressed }) => {
              return [styles.social, pressed && styles.pressed];
            }}
          >
            <Icon color={colors.primaryContainer} name="fingerprint" size={20} />
            <AppText variant="labelMd">Passkey</AppText>
          </Pressable>
        </View>
        <View style={styles.footer}>
          <AppText color={colors.onSurfaceVariant} variant="bodyMd">
            Don’t have an account?{' '}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              navigation.navigate('Registration');
            }}
          >
            <AppText color={colors.primaryContainer} variant="labelLg">
              Sign up
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(192, 201, 194, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  brandLogo: {
    width: 20,
    height: 20,
    borderRadius: 6,
  },
  intro: {
    marginTop: 12,
    gap: 6,
  },
  hub: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
  },
  form: {
    marginTop: 20,
    gap: 14,
  },
  forgot: {
    alignSelf: 'flex-end',
  },
  dividerRow: {
    marginTop: 28,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(192, 201, 194, 0.7)',
  },
  dividerLabel: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  social: {
    flex: 1,
    height: 48,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(192, 201, 194, 0.6)',
    backgroundColor: colors.surfaceContainerLowest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
