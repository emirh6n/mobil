import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from '../screens/HomeScreen';
import { SportsScreen } from '../screens/SportsScreen';
import { NutritionScreen } from '../screens/NutritionScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { RemindersScreen } from '../screens/RemindersScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { Icon } from '../components/Icon';
import { theme } from '../theme/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: 'rgba(18, 19, 22, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(38, 40, 46, 0.6)',
        height: 80,
        paddingBottom: 20,
        paddingTop: 10,
        elevation: 20,
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      tabBarLabelStyle: {
        ...theme.typography.labelSm,
        marginTop: 4,
      },
    }}
  >
    <Tab.Screen 
      name="Ana Sayfa" 
      component={HomeScreen} 
      options={{
        tabBarIcon: ({ color, focused }) => (
          <View style={[
            { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
            focused && { backgroundColor: theme.colors.primaryContainer }
          ]}>
            <Icon name="dashboard" size={22} color={focused ? theme.colors.onPrimaryContainer : color} />
          </View>
        ),
      }}
    />
    <Tab.Screen 
      name="Spor" 
      component={SportsScreen} 
      options={{
        tabBarIcon: ({ color, focused }) => (
          <View style={[
            { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
            focused && { backgroundColor: theme.colors.primaryContainer }
          ]}>
            <Icon name="fitness-center" size={22} color={focused ? theme.colors.onPrimaryContainer : color} />
          </View>
        ),
      }}
    />
    <Tab.Screen 
      name="Besin" 
      component={NutritionScreen} 
      options={{
        tabBarIcon: ({ color, focused }) => (
          <View style={[
            { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
            focused && { backgroundColor: theme.colors.primaryContainer }
          ]}>
            <Icon name="restaurant" size={22} color={focused ? theme.colors.onPrimaryContainer : color} />
          </View>
        ),
      }}
    />
    <Tab.Screen 
      name="İstatistik" 
      component={StatisticsScreen} 
      options={{
        tabBarIcon: ({ color, focused }) => (
          <View style={[
            { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
            focused && { backgroundColor: theme.colors.primaryContainer }
          ]}>
            <Icon name="bar-chart" size={22} color={focused ? theme.colors.onPrimaryContainer : color} />
          </View>
        ),
      }}
    />
  </Tab.Navigator>
);

import { AlarmManager } from '../components/AlarmManager';

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <AlarmManager />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Tasks" component={TasksScreen} />
        <Stack.Screen name="Reminders" component={RemindersScreen} />
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="Notes" component={NotesScreen} />
        <Stack.Screen name="Focus" component={FocusScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
