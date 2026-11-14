import { Alert, Image, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { images } from '../constants/images';
import { colors, radii } from '../constants/theme';
import { AppText } from '../components/AppText';
import { Icon } from '../components/Icon';
import { PostCard } from '../components/PostCard';
import { useAuth } from '../hooks/useAuth';
import { useCommunity } from '../hooks/useCommunity';
import { discoverEvents } from '../services/discover';
import { presentPost } from '../services/feed';
import type { MainStackParamList, MainTabParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<MainStackParamList>
>;

type Tab = 'posts' | 'saved' | 'activity';

export function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { user, signOut } = useAuth();
  const { posts, rsvpIds, toggleLike } = useCommunity();
  const [tab, setTab] = useState<Tab>('posts');
  const mine = posts
    .filter((post) => post.viewerOwned === true)
    .map((post) => presentPost(post, user));
  const saved = posts.filter((post) => post.saved === true).map((post) => presentPost(post, user));
  const activity = discoverEvents.filter((event) => rsvpIds.includes(event.id));
  const photo = user?.photoUri !== undefined ? { uri: user.photoUri } : images.maya;
  const shown = tab === 'posts' ? mine : saved;

  function open(postId: string) {
    navigation.navigate('PostDetails', { postId });
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: tabBarHeight + 24, paddingHorizontal: 16, gap: 14 }}
      style={styles.screen}
    >
      <View style={styles.top}>
        <AppText color={colors.primary} variant="headlineSm">Profile</AppText>
        <View style={styles.row}>
          <Pressable
            onPress={() => {
              Share.share({ message: `${user?.fullName ?? 'Neighbor'} on LocalConnect` }).catch(() => undefined);
            }}
          >
            <Icon name="share-variant" size={22} />
          </Pressable>
          <Pressable
            onPress={() => {
              Alert.alert('Account', 'Sign out of this session on this device?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign out', style: 'destructive', onPress: signOut },
              ]);
            }}
          >
            <Icon name="cog-outline" size={22} />
          </Pressable>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Image source={photo} style={styles.avatar} />
          <View style={styles.role}><AppText color={colors.primary} variant="labelSm">{user?.role ?? 'Resident'}</AppText></View>
        </View>
        <AppText variant="headlineMd">{user?.fullName ?? 'Neighbor'}</AppText>
        <AppText color={colors.onSurfaceVariant} variant="labelMd">@{user?.handle ?? 'neighbor'}</AppText>
        <AppText color={colors.primaryContainer} variant="labelMd">{user?.neighborhood}</AppText>
        <AppText color={colors.onSurfaceVariant} variant="bodyMd">{user?.bio}</AppText>
        {user !== null && user.street.length > 0 ? (
          <AppText color={colors.onSurfaceVariant} variant="bodySm">
            {user.streetPrivate ? 'Street shared with your block' : user.street}
          </AppText>
        ) : null}
        <View style={styles.stats}>
          <Stat label="Posts" value={String(mine.length)} />
          <Stat label="Neighbors" value={String(user?.neighborCount ?? 0)} />
          <Stat label="Following" value={String(user?.followingCount ?? 0)} />
        </View>
        <View style={styles.actions}>
          <Pressable onPress={() => navigation.navigate('EditProfile')} style={styles.edit}>
            <Icon color={colors.primary} name="pencil" size={16} />
            <AppText color={colors.primary} variant="labelLg">Edit Profile</AppText>
          </Pressable>
          <Pressable
            onPress={() => {
              Share.share({ message: `${user?.fullName ?? 'Neighbor'} • ${user?.neighborhood ?? ''}` }).catch(() => undefined);
            }}
            style={styles.share}
          >
            <AppText variant="labelLg">Share Profile</AppText>
          </Pressable>
        </View>
      </View>
      <View style={styles.tabs}>
        {(['posts', 'saved', 'activity'] as const).map((item) => (
          <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.tabOn]}>
            <AppText color={tab === item ? colors.primary : colors.onSurfaceVariant} variant="labelMd">
              {item === 'posts' ? 'My Posts' : item === 'saved' ? 'Saved' : 'Activity'}
            </AppText>
          </Pressable>
        ))}
      </View>
      {tab === 'activity' ? (
        activity.length === 0 ? (
          <Empty text="RSVP from Discover and those events show up here." />
        ) : (
          activity.map((event) => (
            <View key={event.id} style={styles.activity}>
              <AppText variant="labelLg">{event.title}</AppText>
              <AppText color={colors.onSurfaceVariant} variant="bodySm">{event.when}</AppText>
            </View>
          ))
        )
      ) : shown.length === 0 ? (
        <Empty text={tab === 'saved' ? 'Save a post from its details screen.' : 'Posts you publish will show up here.'} />
      ) : (
        shown.map((post) => (
          <PostCard
            key={post.id}
            onComments={() => open(post.id)}
            onMore={() => open(post.id)}
            onOpen={() => open(post.id)}
            onOpenAttachment={() => open(post.id)}
            onShare={(item) => {
              Share.share({ message: item.body }).catch(() => undefined);
            }}
            onToggleAppreciation={toggleLike}
            post={post}
          />
        ))
      )}
      <Pressable onPress={signOut} style={styles.signOut}>
        <AppText color={colors.error} variant="labelLg">Sign out</AppText>
      </Pressable>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="headlineSm">{value}</AppText>
      <AppText color={colors.onSurfaceVariant} variant="labelSm">{label}</AppText>
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return <AppText color={colors.onSurfaceVariant} variant="bodyMd">{text}</AppText>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  card: { backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.xl, borderWidth: 1, borderColor: 'rgba(192,201,194,0.55)', padding: 16, gap: 6 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  role: { backgroundColor: colors.surfaceContainer, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  stats: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.outlineVariant, marginTop: 8, paddingTop: 10 },
  stat: { flex: 1, alignItems: 'center' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  edit: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6, backgroundColor: colors.surfaceContainer, borderRadius: radii.pill, paddingVertical: 12 },
  share: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill, borderWidth: 1, borderColor: colors.outlineVariant, paddingVertical: 12 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(192,201,194,0.5)' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabOn: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  activity: { backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.md, padding: 14, gap: 4 },
  signOut: { alignItems: 'center', paddingVertical: 8 },
});
