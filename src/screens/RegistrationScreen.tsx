import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  communityGuidelines,
  neighborhoodVerification,
} from '../constants/copy';
import {
  defaultNeighborhood,
  type Neighborhood,
} from '../constants/neighborhoods';
import { colors, radii } from '../constants/theme';
import { AppText } from '../components/AppText';
import { Icon } from '../components/Icon';
import { InfoModal } from '../components/InfoModal';
import { NeighborhoodPicker } from '../components/NeighborhoodPicker';
import { PasswordMeter } from '../components/PasswordMeter';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useAuth } from '../hooks/useAuth';
import { hasErrors, validateRegistration } from '../services/validation';
import type { AuthStackParamList } from '../types/navigation';

type RegistrationScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Registration'
>;

type InfoState = {
  title: string;
  body: string;
} | null;

const samplePassword = 'Oakridge#2026';

export function RegistrationScreen({ navigation }: RegistrationScreenProps) {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('Marcus Vance');
  const [neighborhood, setNeighborhood] = useState(defaultNeighborhood.name);
  const [neighborhoodDetail, setNeighborhoodDetail] = useState(
    defaultNeighborhood.detail,
  );
  const [email, setEmail] = useState('marcus.v@gmail.com');
  const [password, setPassword] = useState(samplePassword);
  const [confirmPassword, setConfirmPassword] = useState(samplePassword);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [info, setInfo] = useState<InfoState>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<
    Partial<
      Record<
        | 'fullName'
        | 'neighborhood'
        | 'email'
        | 'password'
        | 'confirmPassword'
        | 'acceptedTerms',
        string
      >
    >
  >({});

  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === password;
  const usingSampleArea = neighborhood === defaultNeighborhood.name;

  function selectNeighborhood(next: Neighborhood) {
    setNeighborhood(next.name);
    setNeighborhoodDetail(next.detail);
    setPickerOpen(false);
  }

  async function handleCreateAccount() {
    const values = {
      fullName,
      neighborhood,
      neighborhoodDetail,
      email,
      password,
      confirmPassword,
      acceptedTerms,
    };
    const nextErrors = validateRegistration(values);
    setErrors(nextErrors);
    setFormError(null);
    if (hasErrors(nextErrors)) {
      return;
    }
    const message = await signUp(values);
    if (message !== null) {
      setFormError(message);
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
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.iconButton}
          >
            <Icon name="arrow-left" size={24} />
          </Pressable>
          <View style={styles.step}>
            <View style={styles.stepDot} />
            <AppText color={colors.primary} variant="labelSm">
              Step 1 of 2: Profile Setup
            </AppText>
          </View>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
        <AppText color={colors.primary} variant="headlineLg">
          Join your neighborhood
        </AppText>
        <AppText color={colors.onSurfaceVariant} variant="bodyMd">
          Connect with verified neighbors, local businesses, and community
          organizers.
        </AppText>
        <View style={styles.trustCard}>
          <View style={styles.trustIcon}>
            <Icon color={colors.primaryContainer} name="shield-check" size={18} />
          </View>
          <View style={styles.trustCopy}>
            <AppText color={colors.primary} variant="labelMd">
              Hyperlocal Privacy Protected
            </AppText>
            <AppText color={colors.onSurfaceVariant} variant="bodySm">
              Only verified residents in your postal cluster can see shared civic
              updates.
            </AppText>
          </View>
        </View>
        <TextField
          autoCapitalize="words"
          autoComplete="name"
          error={errors.fullName}
          label="Full Name"
          onChangeText={setFullName}
          placeholder="e.g. Marcus Vance"
          rightElement={
            <Icon color={colors.outlineVariant} name="account-outline" size={20} />
          }
          value={fullName}
        />
        <TextField
          error={errors.neighborhood}
          label="Neighborhood / Area"
          labelExtra={
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                selectNeighborhood(defaultNeighborhood);
              }}
              style={styles.detect}
            >
              <Icon color={colors.primary} name="crosshairs-gps" size={14} />
              <AppText color={colors.primary} variant="labelSm">
                {usingSampleArea ? 'Auto-detected' : 'Use Oakridge'}
              </AppText>
            </Pressable>
          }
          leftIcon="map-marker"
          leftIconColor={colors.primary}
          onChangeText={(value) => {
            setNeighborhood(value);
            setNeighborhoodDetail('Custom area');
          }}
          placeholder="Search by street or precinct"
          rightElement={
            <Pressable
              accessibilityLabel="Choose neighborhood"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => {
                setPickerOpen(true);
              }}
            >
              <Icon color={colors.onSurfaceVariant} name="chevron-down" size={20} />
            </Pressable>
          }
          value={neighborhood}
        />
        <AppText color={colors.onSurfaceVariant} variant="labelSm">
          {neighborhoodDetail}
        </AppText>
        <TextField
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
          keyboardType="email-address"
          label="Email address"
          onChangeText={setEmail}
          placeholder="name@example.com"
          rightElement={
            <Icon color={colors.outlineVariant} name="email-outline" size={20} />
          }
          value={email}
        />
        <TextField
          autoCapitalize="none"
          autoComplete="new-password"
          error={errors.password}
          label="Password"
          onChangeText={setPassword}
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
        <PasswordMeter password={password} />
        <TextField
          autoCapitalize="none"
          autoComplete="new-password"
          error={errors.confirmPassword}
          label="Confirm Password"
          onChangeText={setConfirmPassword}
          rightElement={
            passwordsMatch ? (
              <Icon color={colors.primary} name="check-circle" size={20} />
            ) : (
              <View style={styles.iconSpacer} />
            )
          }
          secureTextEntry
          value={confirmPassword}
        />
        {passwordsMatch ? (
          <View style={styles.matchRow}>
            <Icon color={colors.primary} name="check-all" size={14} />
            <AppText color={colors.primary} variant="labelSm">
              Passwords match
            </AppText>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
          onPress={() => {
            setAcceptedTerms((current) => {
              return !current;
            });
          }}
          style={styles.terms}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxOn]}>
            {acceptedTerms ? (
              <Icon color={colors.onPrimary} name="check" size={14} />
            ) : null}
          </View>
          <AppText color={colors.onSurfaceVariant} style={styles.termsText} variant="bodySm">
            I agree to the{' '}
            <AppText
              color={colors.primary}
              onPress={() => {
                setInfo({
                  title: 'Community Guidelines',
                  body: communityGuidelines,
                });
              }}
              style={styles.link}
              variant="labelMd"
            >
              Community Guidelines
            </AppText>
            {' & '}
            <AppText
              color={colors.primary}
              onPress={() => {
                setInfo({
                  title: 'Neighborhood Verification',
                  body: neighborhoodVerification,
                });
              }}
              style={styles.link}
              variant="labelMd"
            >
              Neighborhood Verification
            </AppText>
          </AppText>
        </Pressable>
        {errors.acceptedTerms !== undefined ? (
          <AppText color={colors.error} variant="labelSm">
            {errors.acceptedTerms}
          </AppText>
        ) : null}
        {formError !== null ? (
          <AppText color={colors.error} variant="bodySm">
            {formError}
          </AppText>
        ) : null}
        <PrimaryButton label="Create Account" onPress={handleCreateAccount} />
        <View style={styles.loginRow}>
          <AppText color={colors.onSurfaceVariant} variant="bodyMd">
            Already have an account?{' '}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              navigation.navigate('Login');
            }}
          >
            <AppText color={colors.primary} style={styles.link} variant="labelMd">
              Log in
            </AppText>
          </Pressable>
        </View>
        <View style={styles.seal}>
          <Icon color={colors.onSurfaceVariant} name="shield-outline" size={18} />
          <AppText color={colors.onSurfaceVariant} variant="labelSm">
            Secured by LocalConnect Civic Protocol
          </AppText>
        </View>
      </ScrollView>
      <NeighborhoodPicker
        onClose={() => {
          setPickerOpen(false);
        }}
        onSelect={selectNeighborhood}
        selectedName={neighborhood}
        visible={pickerOpen}
      />
      <InfoModal
        body={info?.body ?? ''}
        onClose={() => {
          setInfo(null);
        }}
        title={info?.title ?? ''}
        visible={info !== null}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: 20,
    gap: 14,
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
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(192, 201, 194, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryContainer,
  },
  progressTrack: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  progressFill: {
    width: '50%',
    height: '100%',
    backgroundColor: colors.primaryContainer,
  },
  trustCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(192, 201, 194, 0.35)',
    padding: 14,
  },
  trustIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustCopy: {
    flex: 1,
    gap: 2,
  },
  detect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconSpacer: {
    width: 20,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -6,
  },
  terms: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxOn: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  termsText: {
    flex: 1,
  },
  link: {
    textDecorationLine: 'underline',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  seal: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(192, 201, 194, 0.6)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
});
