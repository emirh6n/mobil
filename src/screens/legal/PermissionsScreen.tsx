import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, AppState, AppStateStatus, PermissionsAndroid } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme';
import { Icon } from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { t } from '../../legal/i18n';
// If using expo-sensors for Pedometer
import { Pedometer } from 'expo-sensors';

type PermissionStatus = 'granted' | 'denied' | 'restricted' | 'unsupported' | 'checking';

export const PermissionsScreen = () => {
  const navigation = useNavigation<any>();

  const [notifStatus, setNotifStatus] = useState<PermissionStatus>('checking');
  const [activityStatus, setActivityStatus] = useState<PermissionStatus>('checking');
  const [exactAlarmStatus, setExactAlarmStatus] = useState<PermissionStatus>('checking');

  const checkPermissions = async () => {
    // 1. Notifications
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const status = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      setNotifStatus(status ? 'granted' : 'denied');
    } else {
      // Assuming granted on older Android unless we use specific push modules.
      // On iOS, we'd need a specific module to check. Since we rely on standard React Native,
      // we'll leave it as 'checking' or assume 'granted' for simplicity if no specific lib is found.
      setNotifStatus('granted'); 
    }

    // 2. Activity (Pedometer)
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (isAvailable) {
        const perm = await Pedometer.getPermissionsAsync();
        setActivityStatus(perm.granted ? 'granted' : 'denied');
      } else {
        setActivityStatus('unsupported');
      }
    } catch {
      setActivityStatus('unsupported');
    }

    // 3. Exact Alarm (Android 12+)
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      // AlarmManager exact alarm check usually requires native bridging.
      // We assume it's granted if the app can schedule, but we can't perfectly check without a module.
      // We will just prompt them to check settings.
      setExactAlarmStatus('checking');
    } else if (Platform.OS === 'android') {
      setExactAlarmStatus('granted');
    } else {
      setExactAlarmStatus('unsupported');
    }
  };

  useEffect(() => {
    checkPermissions();
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkPermissions();
      }
    });
    return () => subscription.remove();
  }, []);

  const openSettings = () => {
    Linking.openSettings().catch(() => {});
  };

  const renderStatus = (status: PermissionStatus) => {
    let color = theme.colors.onSurfaceVariant;
    if (status === 'granted') color = theme.colors.primary;
    if (status === 'denied') color = theme.colors.error;
    
    return <Text style={[styles.statusText, { color }]}>{t(status as any)}</Text>;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('permissions')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.bodyText}>{t('permissionsDesc')}</Text>

        <View style={styles.permCard}>
          <View style={styles.permHeader}>
            <View style={styles.permHeaderLeft}>
              <Icon name="notifications" size={20} color={theme.colors.primary} />
              <Text style={styles.permTitle}>{t('permNotifications')}</Text>
            </View>
            {renderStatus(notifStatus)}
          </View>
          <Text style={styles.permDesc}>{t('permNotificationsDesc')}</Text>
        </View>

        <View style={styles.permCard}>
          <View style={styles.permHeader}>
            <View style={styles.permHeaderLeft}>
              <Icon name="directions-run" size={20} color={theme.colors.secondary} />
              <Text style={styles.permTitle}>{t('permActivity')}</Text>
            </View>
            {renderStatus(activityStatus)}
          </View>
          <Text style={styles.permDesc}>{t('permActivityDesc')}</Text>
        </View>

        {Platform.OS === 'android' && (
          <View style={styles.permCard}>
            <View style={styles.permHeader}>
              <View style={styles.permHeaderLeft}>
                <Icon name="alarm" size={20} color="#3b82f6" />
                <Text style={styles.permTitle}>{t('permExactAlarm')}</Text>
              </View>
              {renderStatus(exactAlarmStatus)}
            </View>
            <Text style={styles.permDesc}>{t('permExactAlarmDesc')}</Text>
          </View>
        )}

        <View style={styles.permCard}>
          <View style={styles.permHeader}>
            <View style={styles.permHeaderLeft}>
              <Icon name="battery-charging-full" size={20} color={theme.colors.error} />
              <Text style={styles.permTitle}>{t('permBattery')}</Text>
            </View>
          </View>
          <Text style={styles.permDesc}>{t('permBatteryDesc')}</Text>
        </View>

        <TouchableOpacity style={styles.settingsBtn} onPress={openSettings}>
          <Icon name="settings" size={20} color={theme.colors.onPrimaryContainer} />
          <Text style={styles.settingsBtnText}>{t('openSettings')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.margin, paddingVertical: 12, backgroundColor: 'rgba(18, 19, 22, 0.85)' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...theme.typography.headlineLgMobile, color: theme.colors.onSurface, fontSize: 18 },
  scrollContent: { padding: theme.spacing.margin, paddingBottom: 40, gap: 16 },
  bodyText: { ...theme.typography.bodyMd, color: theme.colors.onSurfaceVariant, marginBottom: 8 },
  
  permCard: { backgroundColor: theme.colors.surfaceContainer, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.colors.surfaceContainerHigh },
  permHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  permHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  permTitle: { ...theme.typography.titleMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  statusText: { ...theme.typography.labelSm, fontWeight: 'bold' },
  permDesc: { ...theme.typography.bodySm, color: theme.colors.onSurfaceVariant, lineHeight: 20 },
  
  settingsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: theme.colors.primaryContainer, paddingVertical: 14, borderRadius: 12, marginTop: 16 },
  settingsBtnText: { ...theme.typography.labelLg, color: theme.colors.onPrimaryContainer, fontWeight: 'bold' }
});
