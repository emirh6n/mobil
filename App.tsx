import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StatusBar, View, Image, Text, StyleSheet } from 'react-native';
import { initDatabase } from './src/database/database';
import { DateProvider } from './src/context/DateContext';

const App = () => {
  const [dbReady, setDbReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initDatabase().then(() => {
      setDbReady(true);
    });
    
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  if (showSplash || !dbReady) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
        <Image source={require('./assets/logo.jpg')} style={styles.splashLogo} />
        <Text style={styles.splashText}>TRKN Studio</Text>
      </View>
    );
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

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 24,
  },
  splashText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9FFD50',
    letterSpacing: 2,
  }
});

export default App;
