import { Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCommunity } from '../hooks/useCommunity';
import { colors, radii } from '../constants/theme';
import type { MainTabParamList } from '../types/navigation';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

const tabs: Record<
  keyof MainTabParamList,
  { label: string; icon: IconName; activeIcon: IconName }
> = {
  Home: { label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  Discover: { label: 'Discover', icon: 'compass-outline', activeIcon: 'compass' },
  CreatePost: {
    label: 'Create',
    icon: 'plus-circle-outline',
    activeIcon: 'plus-circle',
  },
  Notifications: {
    label: 'Alerts',
    icon: 'bell-outline',
    activeIcon: 'bell',
  },
  Profile: {
    label: 'Profile',
    icon: 'account-outline',
    activeIcon: 'account',
  },
};

export function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useCommunity();
  if (state.routes[state.index]?.name === 'CreatePost') {
    return null;
  }
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const item = tabs[route.name as keyof MainTabParamList];
        const color = focused ? colors.primary : colors.onSurfaceVariant;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            key={route.key}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={({ pressed }) => {
              return [
                styles.item,
                focused && styles.itemActive,
                pressed && styles.pressed,
              ];
            }}
          >
            <View>
              <Icon
                color={color}
                name={focused ? item.activeIcon : item.icon}
                size={24}
              />
              {route.name === 'Notifications' && unreadCount > 0 ? (
                <View style={styles.badge}>
                  <AppText color={colors.onError} style={styles.badgeText} variant="labelSm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </AppText>
                </View>
              ) : null}
            </View>
            <AppText color={color} variant="labelSm">
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(192, 201, 194, 0.45)',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.pill,
    gap: 2,
  },
  itemActive: {
    backgroundColor: 'rgba(218, 226, 219, 0.7)',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
  pressed: {
    opacity: 0.8,
  },
});
