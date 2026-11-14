import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii } from '../constants/theme';
import { AppText } from '../components/AppText';
import { Icon, type IconName } from '../components/Icon';
import { useCommunity } from '../hooks/useCommunity';
import type { AppNotification, NoticeFilter } from '../types/community';
import type { MainStackParamList, MainTabParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Notifications'>,
  NativeStackScreenProps<MainStackParamList>
>;

const filters: { id: NoticeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'replies', label: 'Mentions & Replies' },
  { id: 'alerts', label: 'Alerts' },
];

function iconFor(kind: AppNotification['kind']): IconName {
  if (kind === 'like') {
    return 'heart';
  }
  if (kind === 'comment') {
    return 'comment';
  }
  if (kind === 'event') {
    return 'calendar';
  }
  if (kind === 'community') {
    return 'account-plus';
  }
  return 'alert';
}

export function NotificationsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { notifications, unreadCount, markAllNotificationsRead, markNotificationRead } = useCommunity();
  const [filter, setFilter] = useState<NoticeFilter>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const visible = notifications.filter((item) => {
    if (unreadOnly && !item.unread) {
      return false;
    }
    if (filter === 'replies') {
      return item.kind === 'comment';
    }
    if (filter === 'alerts') {
      return item.kind === 'alert' || item.kind === 'event';
    }
    return true;
  });

  const sections = ['Today', 'Earlier'] as const;

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: tabBarHeight + 24, paddingHorizontal: 16, gap: 10 }}
      style={styles.screen}
    >
      <View style={styles.header}>
        <View style={styles.row}>
          <AppText color={colors.primary} variant="headlineLg">Notifications</AppText>
          <View style={styles.badge}>
            <AppText color={colors.onPrimary} variant="labelSm">
              {unreadCount === 0 ? 'All read' : `${unreadCount} new`}
            </AppText>
          </View>
        </View>
        <View style={styles.row}>
          <Pressable onPress={markAllNotificationsRead} style={styles.iconBtn}>
            <Icon color={colors.primary} name="check-all" size={18} />
          </Pressable>
          <Pressable onPress={() => setUnreadOnly((value) => !value)} style={styles.iconBtn}>
            <Icon color={unreadOnly ? colors.primary : colors.onSurfaceVariant} name="tune-variant" size={20} />
          </Pressable>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map((item) => {
          const active = item.id === filter;
          return (
            <Pressable key={item.id} onPress={() => setFilter(item.id)} style={[styles.chip, active ? styles.chipOn : styles.chipOff]}>
              <AppText color={active ? colors.onPrimary : colors.onSurfaceVariant} variant="labelMd">{item.label}</AppText>
            </Pressable>
          );
        })}
      </ScrollView>
      {visible.length === 0 ? (
        <View style={styles.empty}>
          <Icon color={colors.primary} name="bell-check-outline" size={28} />
          <AppText variant="headlineSm">You are caught up</AppText>
          <AppText color={colors.onSurfaceVariant} variant="bodySm">
            {unreadOnly ? 'No unread items in this filter.' : 'No notifications in this filter yet.'}
          </AppText>
        </View>
      ) : null}
      {sections.map((section) => {
        const items = visible.filter((item) => item.section === section);
        if (items.length === 0) {
          return null;
        }
        return (
          <View key={section} style={styles.section}>
            <AppText color={colors.onSurfaceVariant} variant="labelSm">{section.toUpperCase()}</AppText>
            {items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  markNotificationRead(item.id);
                  if (item.postId !== undefined) {
                    navigation.navigate('PostDetails', { postId: item.postId });
                  }
                }}
                style={[styles.card, item.unread ? styles.unread : styles.read]}
              >
                <View style={styles.avatar}>
                  <Icon color={item.kind === 'alert' ? colors.error : colors.primary} name={iconFor(item.kind)} size={20} />
                </View>
                <View style={styles.grow}>
                  <AppText variant="bodyMd">{item.body}</AppText>
                  {item.preview !== undefined ? (
                    <AppText color={colors.onSurfaceVariant} variant="bodySm">{item.preview}</AppText>
                  ) : null}
                  <AppText color={colors.primary} variant="labelSm">{item.timeLabel}</AppText>
                </View>
                {item.unread ? <View style={styles.dot} /> : null}
              </Pressable>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { backgroundColor: colors.primaryContainer, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 3 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  filters: { gap: 8 },
  chip: { borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 8 },
  chipOn: { backgroundColor: colors.primary },
  chipOff: { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: 'rgba(192,201,194,0.6)' },
  section: { gap: 8 },
  card: { flexDirection: 'row', gap: 10, borderRadius: radii.xl, padding: 12, borderWidth: 1 },
  unread: { backgroundColor: colors.surfaceContainerLow, borderColor: 'rgba(192,201,194,0.5)' },
  read: { backgroundColor: colors.surfaceContainerLowest, borderColor: 'rgba(192,201,194,0.3)' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  grow: { flex: 1, gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
  empty: { alignItems: 'flex-start', gap: 6, paddingVertical: 20 },
});
