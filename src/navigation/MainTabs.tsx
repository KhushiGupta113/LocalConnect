import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabBar } from '../components/MainTabBar';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { HomeFeedScreen } from '../screens/HomeFeedScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import type { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => {
        return <MainTabBar {...props} />;
      }}
    >
      <Tab.Screen component={HomeFeedScreen} name="Home" />
      <Tab.Screen component={DiscoverScreen} name="Discover" />
      <Tab.Screen component={CreatePostScreen} name="CreatePost" />
      <Tab.Screen component={NotificationsScreen} name="Notifications" />
      <Tab.Screen component={ProfileScreen} name="Profile" />
    </Tab.Navigator>
  );
}
