import { StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors, fontFamilies } from './src/constants/theme';
import { AuthProvider } from './src/hooks/useAuth';
import { CommunityProvider } from './src/hooks/useCommunity';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    [fontFamilies.regular]: PlusJakartaSans_400Regular,
    [fontFamilies.medium]: PlusJakartaSans_500Medium,
    [fontFamilies.semibold]: PlusJakartaSans_600SemiBold,
    [fontFamilies.bold]: PlusJakartaSans_700Bold,
  });

  const ready = fontsLoaded || fontError !== null;

  if (!ready) {
    return <View style={styles.boot} />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CommunityProvider>
          <RootNavigator />
        </CommunityProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.primaryContainer,
  },
});
