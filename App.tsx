import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StatusBar } from 'react-native';
import { initDatabase } from './src/database/database';
import { DateProvider } from './src/context/DateContext';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

const App = () => {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();
        // Keep splash screen visible for at least 2 seconds for better user experience
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setDbReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!dbReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <DateProvider>
        <RootNavigator />
      </DateProvider>
    </SafeAreaProvider>
  );
};


export default App;
