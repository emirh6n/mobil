import React, { useEffect, useState, Component, ErrorInfo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StatusBar, View, Text } from 'react-native';
import { initDatabase } from './src/database/database';
import { DateProvider } from './src/context/DateContext';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121316', padding: 20 }}>
          <Text style={{ color: '#ffb4ab', fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Bir Hata Oluştu</Text>
          <Text style={{ color: '#e3e2e6', textAlign: 'center' }}>Uygulamada beklenmeyen bir sorun oluştu. Lütfen uygulamayı yeniden başlatın.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

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
      <ErrorBoundary>
        <DateProvider>
          <RootNavigator />
        </DateProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;
