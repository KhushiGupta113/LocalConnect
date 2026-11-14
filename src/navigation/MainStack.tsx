import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { PostDetailsScreen } from '../screens/PostDetailsScreen';
import type { MainStackParamList } from '../types/navigation';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={MainTabs} name="Tabs" />
      <Stack.Screen component={PostDetailsScreen} name="PostDetails" />
      <Stack.Screen component={EditProfileScreen} name="EditProfile" />
    </Stack.Navigator>
  );
}
