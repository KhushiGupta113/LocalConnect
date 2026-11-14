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
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { images } from '../constants/images';
import { colors, fontFamilies, radii } from '../constants/theme';
import { AppText } from '../components/AppText';
import { Icon } from '../components/Icon';
import { NeighborhoodPicker } from '../components/NeighborhoodPicker';
import { useAuth } from '../hooks/useAuth';
import { useCommunity } from '../hooks/useCommunity';
import { pickPhoto } from '../services/photos';
import type { PostCategory } from '../types/post';
import type { MainTabParamList } from '../types/navigation';

const categories: { id: PostCategory; label: string }[] = [
  { id: 'general', label: 'General Update' },
  { id: 'alerts', label: 'Safety Alert' },
  { id: 'events', label: 'Local Event' },
  { id: 'recommendations', label: 'Recommendation' },
  { id: 'sale', label: 'Item for Sale' },
];

const limit = 500;

type Props = BottomTabScreenProps<MainTabParamList, 'CreatePost'>;

export function CreatePostScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { publish } = useCommunity();
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<PostCategory>('general');
  const [location, setLocation] = useState(user?.neighborhood ?? 'Oakridge Commons');
  const [photos, setPhotos] = useState<string[]>([]);
  const [urgent, setUrgent] = useState(false);
  const [poll, setPoll] = useState('');
  const [showPoll, setShowPoll] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const dirty = body.length > 0 || photos.length > 0 || poll.length > 0;

  async function addPhoto() {
    if (photos.length >= 4) {
      setError('You can attach up to 4 photos.');
      return;
    }
    setPicking(true);
    setError(null);
    const result = await pickPhoto();
    setPicking(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    if ('uri' in result) {
      setPhotos((current) => [...current, result.uri]);
    }
  }

  function leave() {
    if (!dirty) {
      navigation.navigate('Home');
      return;
    }
    Alert.alert('Discard post?', 'This draft stays only until you leave the screen.', [
      { text: 'Keep editing', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => navigation.navigate('Home'),
      },
    ]);
  }

  async function onPublish() {
    const message = await publish({
      body,
      category,
      location,
      photos,
      urgent,
      poll: poll.trim().length > 0 ? poll.trim() : undefined,
    });
    if (message !== null) {
      setError(message);
      return;
    }
    setBody('');
    setPhotos([]);
    setPoll('');
    setUrgent(false);
    navigation.navigate('Home');
  }

  const photo = user?.photoUri !== undefined ? { uri: user.photoUri } : images.maya;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable onPress={leave}><AppText color={colors.onSurfaceVariant} variant="labelLg">Cancel</AppText></Pressable>
        <AppText color={colors.primary} variant="headlineSm">New Community Post</AppText>
        <Pressable onPress={onPublish} style={styles.publish}><AppText color={colors.onPrimary} variant="labelLg">Publish</AppText></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.author}>
          <Image source={photo} style={styles.avatar} />
          <View style={styles.grow}>
            <AppText variant="labelLg">{user?.fullName ?? 'Neighbor'}</AppText>
            <AppText color={colors.onSurfaceVariant} variant="labelSm">{user?.role ?? 'Resident'}</AppText>
          </View>
          <Pressable onPress={() => setPickerOpen(true)} style={styles.placeChip}>
            <Icon color={colors.primary} name="map-marker" size={14} />
            <AppText numberOfLines={1} variant="labelMd">{location}</AppText>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {categories.map((item) => {
            const active = item.id === category;
            return (
              <Pressable key={item.id} onPress={() => setCategory(item.id)} style={[styles.chip, active ? styles.chipOn : styles.chipOff]}>
                <AppText color={active ? colors.onPrimary : colors.onSurface} variant="labelMd">{item.label}</AppText>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.composer}>
          <TextInput
            maxLength={limit}
            multiline
            onChangeText={setBody}
            placeholder="What's happening in your neighborhood?"
            placeholderTextColor="rgba(64,73,68,0.55)"
            style={styles.composerInput}
            value={body}
          />
          <View style={styles.counterRow}>
            <AppText color={colors.primary} variant="labelSm">Visible to neighbors nearby</AppText>
            <AppText color={body.length > 450 ? colors.error : colors.onSurfaceVariant} variant="labelSm">
              {body.length} / {limit}
            </AppText>
          </View>
        </View>
        {error !== null ? <AppText color={colors.error} variant="bodySm">{error}</AppText> : null}
        <View style={styles.rowBetween}>
          <AppText color={colors.onSurfaceVariant} variant="labelSm">Attachments</AppText>
          <AppText color={colors.primary} variant="labelSm">{photos.length} / 4 photos</AppText>
        </View>
        <View style={styles.photoGrid}>
          {photos.map((uri, index) => (
            <View key={uri} style={styles.preview}>
              <Image source={{ uri }} style={styles.previewImage} />
              <Pressable
                onPress={() => setPhotos((current) => current.filter((item) => item !== uri))}
                style={styles.remove}
              >
                <Icon color={colors.onPrimary} name="close" size={14} />
              </Pressable>
              <AppText color={colors.onSurface} style={styles.photoLabel} variant="labelSm">Photo {index + 1}</AppText>
            </View>
          ))}
          {photos.length < 4 ? (
            <Pressable onPress={() => { void addPhoto(); }} style={styles.addPhoto}>
              <Icon color={colors.primary} name="image-plus" size={22} />
              <AppText variant="labelMd">{picking ? 'Opening library…' : 'Add Photos'}</AppText>
              <AppText color={colors.onSurfaceVariant} variant="labelSm">JPEG or PNG</AppText>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.list}>
          <View style={styles.listRow}>
            <Icon color={colors.primary} name="map-marker" size={20} />
            <View style={styles.grow}>
              <AppText variant="labelLg">Location</AppText>
              <AppText color={colors.primary} variant="labelSm">{location}</AppText>
            </View>
            <Pressable onPress={() => setPickerOpen(true)}><Icon name="pencil" size={18} /></Pressable>
          </View>
          <View style={styles.listRow}>
            <Icon color={colors.error} name="alert" size={20} />
            <View style={styles.grow}>
              <AppText variant="labelLg">Mark as Urgent Alert</AppText>
              <AppText color={colors.onSurfaceVariant} variant="bodySm">Shows this post as a safety notice.</AppText>
            </View>
            <Switch
              onValueChange={setUrgent}
              thumbColor={colors.onPrimary}
              trackColor={{ false: colors.secondaryContainer, true: colors.primaryContainer }}
              value={urgent}
            />
          </View>
          <Pressable onPress={() => setShowPoll(true)} style={styles.listRow}>
            <Icon color={colors.primary} name="poll" size={20} />
            <View style={styles.grow}>
              <AppText variant="labelLg">Poll</AppText>
              <AppText color={colors.onSurfaceVariant} variant="bodySm">
                {poll.length > 0 ? poll : 'Ask neighbors one question'}
              </AppText>
            </View>
            <Icon name="chevron-right" size={20} />
          </Pressable>
        </View>
        {showPoll ? (
          <View style={styles.pollBox}>
            <TextInput
              onChangeText={setPoll}
              placeholder="What should the block decide?"
              placeholderTextColor="rgba(64,73,68,0.55)"
              style={styles.pollInput}
              value={poll}
            />
            <Pressable onPress={() => setShowPoll(false)}><AppText color={colors.primary} variant="labelMd">Done</AppText></Pressable>
          </View>
        ) : null}
        <View style={styles.notice}>
          <Icon color={colors.primary} name="shield-check" size={18} />
          <AppText color={colors.onSurfaceVariant} style={styles.grow} variant="bodySm">
            Keep discussions constructive. Advertising belongs in Item for Sale.
          </AppText>
        </View>
      </ScrollView>
      <View style={[styles.tools, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <Pressable onPress={() => { void addPhoto(); }}><Icon name="image-outline" size={22} /></Pressable>
        <Pressable onPress={() => setPickerOpen(true)}><Icon color={colors.primary} name="map-marker" size={22} /></Pressable>
        <Pressable
          onPress={() => {
            setBody((current) => `${current}${current.length > 0 ? ' ' : ''}@Elena`);
          }}
        >
          <Icon name="account-plus-outline" size={22} />
        </Pressable>
        <Pressable onPress={() => setBody((current) => `${current} 🌱`)}>
          <Icon name="emoticon-happy-outline" size={22} />
        </Pressable>
        <AppText color={colors.onSurfaceVariant} variant="labelSm">
          {dirty ? 'Draft kept on this screen' : 'Nothing to save yet'}
        </AppText>
      </View>
      <NeighborhoodPicker
        onClose={() => setPickerOpen(false)}
        onSelect={(item) => {
          setLocation(item.name);
          setPickerOpen(false);
        }}
        selectedName={location}
        visible={pickerOpen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  bar: { height: 56, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceContainerLowest },
  publish: { backgroundColor: colors.primaryContainer, borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 8 },
  content: { padding: 16, gap: 14 },
  author: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surfaceContainerLow, borderRadius: radii.md, padding: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  grow: { flex: 1 },
  placeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: 140, backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 6 },
  chips: { gap: 8 },
  chip: { borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8 },
  chipOn: { backgroundColor: colors.primaryContainer },
  chipOff: { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant },
  composer: { backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.md, borderWidth: 1, borderColor: 'rgba(192,201,194,0.5)', padding: 14, gap: 8 },
  composerInput: { minHeight: 110, textAlignVertical: 'top', color: colors.onSurface, fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 24 },
  counterRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.outlineVariant, paddingTop: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  preview: { width: '48%', aspectRatio: 4 / 3, borderRadius: radii.md, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  remove: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.inverseSurface, alignItems: 'center', justifyContent: 'center' },
  photoLabel: { position: 'absolute', left: 8, bottom: 8, backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2 },
  addPhoto: { width: '48%', aspectRatio: 4 / 3, borderRadius: radii.md, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.surfaceContainerLow },
  list: { backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.md, borderWidth: 1, borderColor: 'rgba(192,201,194,0.45)' },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.outlineVariant },
  pollBox: { gap: 8 },
  pollInput: { minHeight: 44, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radii.md, paddingHorizontal: 12, color: colors.onSurface, fontFamily: fontFamilies.regular },
  notice: { flexDirection: 'row', gap: 10, backgroundColor: colors.surfaceContainer, borderRadius: radii.md, padding: 14 },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingTop: 10, backgroundColor: colors.surfaceContainerLowest, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.outlineVariant },
});
