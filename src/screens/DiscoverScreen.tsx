import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { images } from '../constants/images';
import { colors, fontFamilies, radii } from '../constants/theme';
import { AppText } from '../components/AppText';
import { Icon } from '../components/Icon';
import { useAuth } from '../hooks/useAuth';
import { useCommunity } from '../hooks/useCommunity';
import {
  discoverEvents,
  discoverGroups,
  discoverHubs,
  discoverTopics,
  radiusOptions,
  type DiscoverEvent,
} from '../services/discover';

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { user } = useAuth();
  const { joinedGroupIds, rsvpIds, toggleGroup, toggleRsvp } = useCommunity();
  const [query, setQuery] = useState('');
  const [radius, setRadius] = useState(2);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [hubId, setHubId] = useState<DiscoverEvent['hub'] | null>(null);
  const [showAll, setShowAll] = useState(false);

  const needle = query.trim().toLowerCase();
  const topic = discoverTopics.find((item) => item.id === topicId)?.label.toLowerCase() ?? '';

  const events = useMemo(() => {
    return discoverEvents.filter((event) => {
      if (event.miles > radius) {
        return false;
      }
      if (hubId !== null && event.hub !== hubId && event.hub !== 'events') {
        return false;
      }
      if (hubId === 'market' || hubId === 'skills' || hubId === 'pets') {
        return event.hub === hubId;
      }
      const blob = `${event.title} ${event.when} ${event.note}`.toLowerCase();
      if (needle.length > 0 && !blob.includes(needle)) {
        return false;
      }
      if (topic.length > 0 && topicId === 'safety' && event.hub !== 'civic') {
        return false;
      }
      return true;
    });
  }, [hubId, needle, radius, topic, topicId]);

  const groups = useMemo(() => {
    return discoverGroups.filter((group) => {
      if (group.miles > radius) {
        return false;
      }
      if (hubId !== null && group.hub !== hubId) {
        return false;
      }
      const blob = `${group.name} ${group.summary}`.toLowerCase();
      if (needle.length > 0 && !blob.includes(needle)) {
        return false;
      }
      if (topicId === 'dogs' && group.hub !== 'pets') {
        return false;
      }
      if (topicId === 'tools' && group.hub !== 'skills') {
        return false;
      }
      return true;
    });
  }, [hubId, needle, radius, topicId]);

  const topics = discoverTopics.filter((item) => {
    if (needle.length === 0) {
      return true;
    }
    return item.label.toLowerCase().includes(needle);
  });
  const visibleEvents = showAll ? events : events.slice(0, 2);
  const place = user?.neighborhood ?? 'Oakridge Commons';

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: tabBarHeight + 24,
        gap: 22,
      }}
      style={styles.screen}
    >
      <View style={styles.pad}>
        <View style={styles.top}>
          <Icon color={colors.primary} name="map-marker" size={22} />
          <AppText color={colors.primary} style={styles.grow} variant="headlineSm">
            {place}
          </AppText>
        </View>
        <View style={styles.search}>
          <Icon color={colors.onSurfaceVariant} name="magnify" size={20} />
          <TextInput
            onChangeText={setQuery}
            placeholder="Search Oakridge Commons & nearby..."
            placeholderTextColor="rgba(64,73,68,0.6)"
            style={styles.input}
            value={query}
          />
        </View>
        <View style={styles.rowBetween}>
          <Pressable
            onPress={() => {
              const index = radiusOptions.indexOf(radius);
              const next = radiusOptions[(index + 1) % radiusOptions.length] ?? 2;
              setRadius(next);
            }}
            style={styles.radius}
          >
            <Icon color={colors.primary} name="navigation-variant" size={16} />
            <AppText color={colors.primary} variant="labelMd">
              Within {radius} {radius === 1 ? 'mile' : 'miles'}
            </AppText>
            <Icon color={colors.primary} name="chevron-down" size={16} />
          </Pressable>
          <AppText color={colors.onSurfaceVariant} variant="labelSm">
            420+ active neighbors
          </AppText>
        </View>
      </View>

      <View>
        <View style={[styles.rowBetween, styles.pad]}>
          <View style={styles.row}>
            <Icon color={colors.primary} name="trending-up" size={18} />
            <AppText variant="headlineSm">Trending Topics</AppText>
          </View>
          <AppText color={colors.onSurfaceVariant} variant="labelSm">
            Updated hourly
          </AppText>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {topics.map((item) => {
            const active = item.id === topicId;
            return (
              <Pressable
                key={item.id}
                onPress={() => setTopicId(active ? null : item.id)}
                style={[styles.chip, active ? styles.chipOn : styles.chipOff]}
              >
                <AppText color={active ? colors.onPrimary : colors.onSurface} variant="labelMd">
                  {item.label}
                </AppText>
                {item.alert === true ? <View style={styles.alertDot} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
        {topics.length === 0 ? (
          <AppText color={colors.onSurfaceVariant} style={styles.pad} variant="bodySm">
            No topics match that search.
          </AppText>
        ) : null}
      </View>

      <View style={[styles.pad, styles.section]}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Icon color={colors.primary} name="calendar" size={20} />
            <AppText variant="headlineSm">Nearby Activities & Events</AppText>
          </View>
          <Pressable onPress={() => setShowAll((value) => !value)}>
            <AppText color={colors.primary} variant="labelMd">
              {showAll ? 'Show less' : 'See all'}
            </AppText>
          </Pressable>
        </View>
        {visibleEvents.length === 0 ? (
          <AppText color={colors.onSurfaceVariant} variant="bodySm">
            No activities inside {radius} {radius === 1 ? 'mile' : 'miles'}. Try a wider radius.
          </AppText>
        ) : null}
        {visibleEvents.map((event) => {
          const going = rsvpIds.includes(event.id);
          if (event.featured === true) {
            return (
              <View key={event.id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <View style={styles.row}>
                    <View style={styles.iconBubble}>
                      <Icon color={colors.primary} name="flower" size={20} />
                    </View>
                    <View>
                      <AppText color={colors.primary} variant="labelSm">Community Service</AppText>
                      <AppText color={colors.onSurfaceVariant} variant="labelSm">{event.when}</AppText>
                    </View>
                  </View>
                  <Pressable onPress={() => toggleRsvp(event.id)}>
                    <Icon color={going ? colors.primary : colors.onSurfaceVariant} name={going ? 'bookmark' : 'bookmark-outline'} size={22} />
                  </Pressable>
                </View>
                <AppText variant="headlineSm">{event.title}</AppText>
                <AppText color={colors.onSurfaceVariant} variant="bodySm">{event.summary}</AppText>
                <Image source={images.garden} style={styles.hero} />
                <View style={styles.rowBetween}>
                  <AppText color={colors.onSurfaceVariant} variant="labelSm">
                    {event.going + (going ? 1 : 0)} neighbors going
                  </AppText>
                  <Pressable onPress={() => toggleRsvp(event.id)} style={styles.rsvp}>
                    <AppText color={colors.onPrimary} variant="labelLg">{going ? 'Going' : 'RSVP'}</AppText>
                  </Pressable>
                </View>
              </View>
            );
          }
          return (
            <View key={event.id} style={styles.compact}>
              <View style={styles.iconBubble}>
                <Icon color={colors.primary} name={event.hub === 'civic' ? 'shield-outline' : 'coffee'} size={20} />
              </View>
              <View style={styles.grow}>
                <AppText color={colors.onSurfaceVariant} variant="labelSm">{event.when}</AppText>
                <AppText variant="labelLg">{event.title}</AppText>
                <AppText color={colors.onSurfaceVariant} variant="labelSm">{event.note}</AppText>
              </View>
              <Pressable onPress={() => toggleRsvp(event.id)} style={styles.details}>
                <AppText color={colors.primary} variant="labelMd">{going ? 'Going' : 'Details'}</AppText>
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={[styles.pad, styles.section]}>
        <View style={styles.row}>
          <Icon color={colors.primary} name="shape-outline" size={20} />
          <AppText variant="headlineSm">Browse by Categories</AppText>
        </View>
        <View style={styles.grid}>
          {discoverHubs.map((hub) => {
            const active = hub.id === hubId;
            return (
              <Pressable
                key={hub.id}
                onPress={() => setHubId(active ? null : hub.id)}
                style={[styles.hub, hub.tint === 'strong' ? styles.hubStrong : styles.hubSoft, active && styles.hubActive]}
              >
                <View style={styles.hubIcon}>
                  <Icon color={colors.primary} name={hub.icon} size={18} />
                </View>
                <AppText color={colors.primary} variant="labelLg">{hub.title}</AppText>
                <AppText color={colors.onSurfaceVariant} variant="labelSm">{hub.meta}</AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.rowBetween, styles.pad]}>
          <View style={styles.row}>
            <Icon color={colors.primary} name="account-multiple-plus" size={20} />
            <AppText variant="headlineSm">Local Groups to Join</AppText>
          </View>
          <AppText color={colors.onSurfaceVariant} variant="labelSm">Suggested</AppText>
        </View>
        {groups.length === 0 ? (
          <AppText color={colors.onSurfaceVariant} style={styles.pad} variant="bodySm">
            No groups match this search.
          </AppText>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {groups.map((group) => {
              const joined = joinedGroupIds.includes(group.id);
              return (
                <View key={group.id} style={styles.group}>
                  <View style={styles.row}>
                    <Image source={images.garden} style={styles.groupImage} />
                    <View style={styles.grow}>
                      <AppText variant="labelLg">{group.name}</AppText>
                      <AppText color={colors.onSurfaceVariant} variant="labelSm">{group.members} members</AppText>
                    </View>
                  </View>
                  <AppText color={colors.onSurfaceVariant} variant="bodySm">{group.summary}</AppText>
                  <View style={styles.rowBetween}>
                    <AppText color={colors.primary} variant="labelSm">{group.activity}</AppText>
                    <Pressable onPress={() => toggleGroup(group.id)} style={[styles.join, joined && styles.joinOn]}>
                      <AppText color={joined ? colors.primary : colors.onPrimary} variant="labelMd">
                        {joined ? 'Joined' : 'Join'}
                      </AppText>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  pad: { paddingHorizontal: 16, gap: 10 },
  section: { gap: 12 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  grow: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.md, borderWidth: 1, borderColor: 'rgba(192,201,194,0.6)', paddingHorizontal: 12, minHeight: 46 },
  input: { flex: 1, color: colors.onSurface, fontFamily: fontFamilies.regular, fontSize: 14, paddingVertical: 8 },
  radius: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceContainer, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 },
  chips: { gap: 8, paddingHorizontal: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8 },
  chipOn: { backgroundColor: colors.primary },
  chipOff: { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: 'rgba(192,201,194,0.7)' },
  alertDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.error },
  card: { backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.xl, borderWidth: 1, borderColor: 'rgba(192,201,194,0.55)', padding: 14, gap: 8 },
  compact: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.xl, borderWidth: 1, borderColor: 'rgba(192,201,194,0.55)', padding: 14 },
  iconBubble: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  hero: { height: 128, borderRadius: radii.md, width: '100%' },
  rsvp: { backgroundColor: colors.primaryContainer, borderRadius: radii.pill, paddingHorizontal: 18, paddingVertical: 8 },
  details: { backgroundColor: colors.surfaceContainer, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  hub: { width: '48%', minHeight: 120, borderRadius: radii.xl, borderWidth: 1, borderColor: 'rgba(192,201,194,0.55)', padding: 14, justifyContent: 'space-between' },
  hubStrong: { backgroundColor: colors.surfaceContainerLow },
  hubSoft: { backgroundColor: colors.surfaceContainerLowest },
  hubActive: { borderColor: colors.primaryContainer },
  hubIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  group: { width: 250, backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.xl, borderWidth: 1, borderColor: 'rgba(192,201,194,0.55)', padding: 14, gap: 10 },
  groupImage: { width: 48, height: 48, borderRadius: 12 },
  join: { backgroundColor: colors.primary, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 6 },
  joinOn: { backgroundColor: colors.surfaceContainer },
});
