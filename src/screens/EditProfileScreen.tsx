import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { images } from '../constants/images';
import { colors, fontFamilies, radii } from '../constants/theme';
import { AppText } from '../components/AppText';
import { Icon } from '../components/Icon';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../hooks/useAuth';
import { pickPhoto } from '../services/photos';
import type { MainStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<MainStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, updateProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [handle, setHandle] = useState(user?.handle ?? '');
  const [role, setRole] = useState(user?.role ?? 'Resident');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [street, setStreet] = useState(user?.street ?? '');
  const [photoUri, setPhotoUri] = useState(user?.photoUri);
  const [streetPrivate, setStreetPrivate] = useState(user?.streetPrivate ?? true);
  const [showContact, setShowContact] = useState(user?.showContact ?? true);
  const [urgentAlerts, setUrgentAlerts] = useState(user?.urgentAlerts ?? true);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const photo = photoUri !== undefined ? { uri: photoUri } : images.maya;

  async function changePhoto() {
    setPicking(true);
    setError(null);
    const result = await pickPhoto();
    setPicking(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    if ('uri' in result) {
      setPhotoUri(result.uri);
    }
  }

  async function save() {
    const message = await updateProfile({
      fullName,
      handle,
      role: role.trim().length === 0 ? 'Resident' : role.trim(),
      bio,
      street: street.trim(),
      photoUri,
      streetPrivate,
      showContact,
      urgentAlerts,
    });
    if (message !== null) {
      setError(message);
      return;
    }
    navigation.goBack();
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable onPress={() => navigation.goBack()}><Icon name="arrow-left" size={24} /></Pressable>
        <AppText variant="headlineSm">Edit Profile</AppText>
        <Pressable onPress={save}><AppText color={colors.primary} variant="labelLg">Save</AppText></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.photoBlock}>
          <Image source={photo} style={styles.avatar} />
          <Pressable onPress={() => { void changePhoto(); }}>
            <AppText color={colors.primary} variant="labelMd">{picking ? 'Opening library…' : 'Update Photo'}</AppText>
          </Pressable>
          <AppText color={colors.onSurfaceVariant} variant="bodySm">Visible to neighbors in this session.</AppText>
        </View>
        <Field label="Full Name" onChangeText={setFullName} value={fullName} />
        <Field label="Username" onChangeText={setHandle} prefix="@" value={handle} />
        <Field label="Role" onChangeText={setRole} value={role} />
        <View style={styles.field}>
          <View style={styles.rowBetween}>
            <AppText variant="labelMd">Bio</AppText>
            <AppText color={bio.length > 200 ? colors.error : colors.onSurfaceVariant} variant="labelSm">{bio.length}/200</AppText>
          </View>
          <TextInput maxLength={200} multiline onChangeText={setBio} style={styles.bio} value={bio} />
        </View>
        <Field editable={false} label="Neighborhood" value={user?.neighborhood ?? ''} />
        <AppText color={colors.onSurfaceVariant} variant="labelSm">Neighborhood stays with this session. A later phase can verify a move.</AppText>
        <Field label="Street" onChangeText={setStreet} value={street} />
        <Toggle label="Show street only to your block" onValueChange={setStreetPrivate} value={streetPrivate} />
        <Toggle label="Show contact info in the directory" onValueChange={setShowContact} value={showContact} />
        <Toggle label="Receive urgent neighborhood alerts" onValueChange={setUrgentAlerts} value={urgentAlerts} />
        {error !== null ? <AppText color={colors.error} variant="bodySm">{error}</AppText> : null}
        <Pressable
          onPress={() => {
            Alert.alert('Leave this session?', 'Deactivating an account needs a server. You can sign out now.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign out', style: 'destructive', onPress: signOut },
            ]);
          }}
        >
          <AppText color={colors.onSurfaceVariant} variant="labelSm">Sign out of this session</AppText>
        </Pressable>
      </ScrollView>
      <View style={{ padding: 16, paddingBottom: Math.max(insets.bottom, 12) }}>
        <PrimaryButton icon="check" label="Save Changes" onPress={save} />
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  prefix,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText?: (value: string) => void;
  prefix?: string;
  editable?: boolean;
}) {
  return (
    <View style={styles.field}>
      <AppText variant="labelMd">{label}</AppText>
      <View style={styles.inputRow}>
        {prefix !== undefined ? <AppText color={colors.onSurfaceVariant} variant="bodyMd">{prefix}</AppText> : null}
        <TextInput
          editable={editable}
          onChangeText={onChangeText}
          style={[styles.input, !editable && styles.locked]}
          value={value}
        />
      </View>
    </View>
  );
}

function Toggle({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.toggle}>
      <AppText style={styles.grow} variant="labelMd">{label}</AppText>
      <Switch
        onValueChange={onValueChange}
        thumbColor={colors.onPrimary}
        trackColor={{ false: colors.secondaryContainer, true: colors.primaryContainer }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  bar: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  content: { padding: 16, gap: 14 },
  photoBlock: { alignItems: 'center', gap: 8 },
  avatar: { width: 112, height: 112, borderRadius: 56 },
  field: { gap: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 48, borderRadius: radii.md, borderWidth: 1, borderColor: 'rgba(192,201,194,0.6)', backgroundColor: colors.surfaceContainerLowest, paddingHorizontal: 12 },
  input: { flex: 1, color: colors.onSurface, fontFamily: fontFamilies.regular, fontSize: 14, paddingVertical: 10 },
  locked: { color: colors.onSurfaceVariant },
  bio: { minHeight: 90, textAlignVertical: 'top', borderRadius: radii.md, borderWidth: 1, borderColor: 'rgba(192,201,194,0.6)', backgroundColor: colors.surfaceContainerLowest, padding: 12, color: colors.onSurface, fontFamily: fontFamilies.regular, fontSize: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.md, padding: 12 },
  grow: { flex: 1 },
});
