import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { theme } from '../theme/theme';

export const FocusScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header subtitle="Odak / Pomodoro" />
      <View style={styles.content}>
        <Text style={styles.text}>Bu ekran yakında eklenecek.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { ...theme.typography.titleMd, color: theme.colors.onSurfaceVariant }
});
