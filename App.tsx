import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StatusBar } from 'react-native';
import { initDatabase } from './src/database/database';

const App = () => {
  const [dbReady, setDbReady] = React.useState(false);

  useEffect(() => {
    initDatabase().then(() => {
      setDbReady(true);
    });
  }, []);

  if (!dbReady) {
    return null; // Or a splash screen
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <RootNavigator />
    </SafeAreaProvider>
  );
};

export default App;
