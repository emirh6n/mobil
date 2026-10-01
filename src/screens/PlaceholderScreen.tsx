import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const PlaceholderScreen = ({ route }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{route.name} Ekranı (Yakında)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...theme.typography.titleMd,
    color: theme.colors.onSurfaceVariant,
  },
});
