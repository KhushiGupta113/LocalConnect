import { useMemo, useRef, useState, type ComponentRef } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { laterPhase } from '../constants/copy';
import { images } from '../constants/images';
import { colors, fontFamilies, radii } from '../constants/theme';
import { AppText } from '../components/AppText';
import { CategoryChips } from '../components/CategoryChips';
import { Icon } from '../components/Icon';
import { PostCard } from '../components/PostCard';
import { useAuth } from '../hooks/useAuth';
import { useCommunity } from '../hooks/useCommunity';
import { presentPost } from '../services/feed';
import type { FeedCategory, FeedSort } from '../types/post';
import type { MainStackParamList, MainTabParamList } from '../types/navigation';

type HomeFeedScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<MainStackParamList>
>;

const places = ['Oakridge Commons', 'Maple Avenue', '4th Street', 'Gazebo Plots'];

function greetingFor(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return `Good morning, ${name}`;
  }
  if (hour < 17) {
    return `Good afternoon, ${name}`;
  }
  return `Good evening, ${name}`;
}

function firstName(fullName: string): string {
  const name = fullName.trim().split(/\s+/)[0];
  if (name === undefined || name.length === 0) {
    return 'Neighbor';
  }
  return name;
}

export function HomeFeedScreen({ navigation }: HomeFeedScreenProps) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { user } = useAuth();
  const { posts, toggleLike, refreshFeed } = useCommunity();
  const searchRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FeedCategory>('all');
  const [sort, setSort] = useState<FeedSort>('newest');
  const [placeIndex, setPlaceIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFeed();
    setRefreshing(false);
  };

  const visiblePosts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = posts.map((post) => presentPost(post, user)).filter((post) => {
      if (hiddenIds.includes(post.id)) {
        return false;
      }
      if (category !== 'all' && post.category !== category) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      const haystack = `${post.authorName} ${post.body} ${post.category}`.toLowerCase();
      return haystack.includes(needle);
    });
    return filtered.sort((left, right) => {
      if (sort === 'appreciated') {
        return right.appreciation - left.appreciation;
      }
      return left.sortIndex - right.sortIndex;
    });
  }, [category, hiddenIds, posts, query, sort, user]);

  const placeOptions = useMemo(() => {
    const home = user?.neighborhood ?? 'Oakridge Commons';
    const extras = places.filter((placeName) => {
      return placeName !== home;
    });
    return [home, ...extras];
  }, [user?.neighborhood]);
  const place = placeOptions[placeIndex % placeOptions.length] ?? placeOptions[0];
  const happeningCount = posts.filter((post) => {
    return !hiddenIds.includes(post.id);
  }).length;

  const displayName = firstName(user?.fullName ?? 'Maya');

  function cyclePlace() {
    setPlaceIndex((current) => {
      return (current + 1) % placeOptions.length;
    });
  }

  return (
    <View style={styles.screen}>
      <FlatList
        onRefresh={onRefresh}
        refreshing={refreshing}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: tabBarHeight + 88,
          paddingHorizontal: 16,
          gap: 16,
        }}
        data={visiblePosts}
        keyExtractor={(post) => {
          return post.id;
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <AppText variant="headlineSm">No matching posts</AppText>
            <AppText color={colors.onSurfaceVariant} variant="bodySm">
              Try another category or clear the search. Lost & Found and Free &
              For Sale do not have sample posts in this phase.
            </AppText>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.topBar}>
              <Pressable
                accessibilityLabel="Change location"
                accessibilityRole="button"
                onPress={cyclePlace}
                style={styles.placeButton}
              >
                <Icon color={colors.primary} name="map-marker" size={22} />
                <AppText color={colors.primary} variant="headlineSm">
                  {place}
                </AppText>
                <Icon color={colors.onSurfaceVariant} name="chevron-down" size={18} />
              </Pressable>
              <View style={styles.topActions}>
                <Pressable
                  accessibilityLabel="Search"
                  accessibilityRole="button"
                  onPress={() => {
                    searchRef.current?.focus();
                  }}
                  style={styles.iconButton}
                >
                  <Icon color={colors.primary} name="magnify" size={22} />
                </Pressable>
                <Pressable
                  accessibilityLabel="Open profile"
                  accessibilityRole="button"
                  onPress={() => {
                    navigation.navigate('Profile');
                  }}
                >
                  <Image source={images.maya} style={styles.avatar} />
                </Pressable>
              </View>
            </View>
            <View style={styles.greetingRow}>
              <View style={styles.greetingCopy}>
                <AppText variant="headlineMd">{greetingFor(displayName)} 👋</AppText>
                <AppText color={colors.onSurfaceVariant} variant="bodySm">
                  {happeningCount} neighborhood happenings today
                </AppText>
              </View>
              <View style={styles.activePill}>
                <View style={styles.activeDot} />
                <AppText color={colors.primary} variant="labelMd">
                  Community Active
                </AppText>
              </View>
            </View>
            <View style={styles.search}>
              <Icon color={colors.onSurfaceVariant} name="magnify" size={20} />
              <TextInput
                onChangeText={setQuery}
                placeholder="Search posts, events, neighbors..."
                placeholderTextColor="rgba(64, 73, 68, 0.7)"
                ref={searchRef}
                style={styles.searchInput}
                value={query}
              />
              <Pressable
                accessibilityLabel="Sort feed"
                accessibilityRole="button"
                onPress={() => {
                  Alert.alert('Sort feed', 'Choose how this device orders the sample posts.', [
                    {
                      text: 'Newest',
                      onPress: () => {
                        setSort('newest');
                      },
                    },
                    {
                      text: 'Most appreciated',
                      onPress: () => {
                        setSort('appreciated');
                      },
                    },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }}
              >
                <Icon color={colors.onSurfaceVariant} name="tune-variant" size={20} />
              </Pressable>
            </View>
            <CategoryChips onSelect={setCategory} selected={category} />
          </View>
        }
        renderItem={({ item }) => {
          return (
            <PostCard
              onComments={(post) => {
                navigation.navigate('PostDetails', { postId: post.id });
              }}
              onOpen={(post) => {
                navigation.navigate('PostDetails', { postId: post.id });
              }}
              onMore={(post) => {
                Alert.alert(post.authorName, 'Hide this post from the feed on this device.', [
                  {
                    text: 'Hide post',
                    style: 'destructive',
                    onPress: () => {
                      setHiddenIds((current) => {
                        return [...current, post.id];
                      });
                    },
                  },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
              onOpenAttachment={() => {
                Alert.alert('Attachment', laterPhase.attachment);
              }}
              onShare={(post) => {
                Share.share({
                  message: `${post.authorName}: ${post.body}`,
                }).catch(() => {
                  return undefined;
                });
              }}
              onToggleAppreciation={toggleLike}
              post={item}
            />
          );
        }}
      />
      <Pressable
        accessibilityLabel="Create post"
        accessibilityRole="button"
        onPress={() => {
          navigation.navigate('CreatePost');
        }}
        style={[styles.fab, { bottom: tabBarHeight + 16 }]}
      >
        <Icon color={colors.onPrimary} name="plus" size={22} />
        <AppText color={colors.onPrimary} variant="labelLg">
          Create Post
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  headerBlock: {
    gap: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  placeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(192, 201, 194, 0.6)',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  greetingCopy: {
    flex: 1,
    gap: 2,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(192, 201, 194, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.tertiaryFixedDim,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(192, 201, 194, 0.55)',
    paddingHorizontal: 14,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    paddingVertical: 10,
  },
  empty: {
    gap: 6,
    paddingVertical: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
});
