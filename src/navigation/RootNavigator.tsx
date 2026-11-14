import { useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthStack } from './AuthStack';
import { GateProvider } from './gate';
import { MainStack } from './MainStack';

export function RootNavigator() {
  const { user } = useAuth();
  const [stage, setStage] = useState<'splash' | 'app'>('splash');
  const [splashWaitsForTap, setSplashWaitsForTap] = useState(false);

  const returnToSplash = useCallback(() => {
    setSplashWaitsForTap(true);
    setStage('splash');
  }, []);

  const continueFromSplash = useCallback(() => {
    setStage('app');
  }, []);

  if (stage === 'splash') {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen
          autoAdvance={!splashWaitsForTap}
          onContinue={continueFromSplash}
        />
      </>
    );
  }

  return (
    <GateProvider onReturnToSplash={returnToSplash}>
      <StatusBar style="dark" />
      <NavigationContainer key={user === null ? 'auth' : 'main'}>
        {user === null ? <AuthStack /> : <MainStack />}
      </NavigationContainer>
    </GateProvider>
  );
}
