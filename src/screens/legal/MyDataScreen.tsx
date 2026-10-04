import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { theme } from '../../theme/theme';
import { Icon } from '../../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { t } from '../../legal/i18n';
import db from '../../database/database';
// Import alarm module to clear alarms if needed
import { NativeModules } from 'react-native';
const { ExpoAlarmModule } = NativeModules;

export const MyDataScreen = () => {
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);

  const handleExport = async () => {
    try {
      const dbFile = `${FileSystem.documentDirectory}SQLite/trkn_app.sqlite`;
      const fileInfo = await FileSystem.getInfoAsync(dbFile);
      if (!fileInfo.exists) {
        Alert.alert(t('error'), 'Database file not found.');
        return;
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(dbFile, { dialogTitle: 'Export Backup' });
      } else {
        Alert.alert(t('error'), 'Sharing not supported on this device.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t('error'), 'Failed to export data.');
    }
  };

  const handleDeleteAll = async () => {
    try {
      // Basic reset logic: delete the database file or drop tables.
      // Easiest is to drop tables or just clear them.
      await db.execute('DELETE FROM Reminders;');
      await db.execute('DELETE FROM Tasks;');
      await db.execute('DELETE FROM Moods;');
      await db.execute('DELETE FROM Settings;');
      await db.execute('DELETE FROM Steps;');
      await db.execute('DELETE FROM Workouts;');
      await db.execute('DELETE FROM WorkoutExercises;');
      await db.execute('DELETE FROM BodyMetrics;');

      // Cancel any native alarms
      if (ExpoAlarmModule && ExpoAlarmModule.cancelAlarm) {
        // You'd ideally fetch active alarm IDs and cancel, but here we can just do a broad reset if module supports it
        // Or we assume deleting DB handles it if we sync
      }
      
      setModalVisible(false);
      Alert.alert(t('success'), t('dataDeleted'));
    } catch (error) {
      console.error(error);
      Alert.alert(t('error'), 'Failed to delete data.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('myData')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.bodyText}>{t('myDataDesc')}</Text>

        <TouchableOpacity style={styles.actionCard} onPress={handleExport}>
          <View style={styles.iconBox}><Icon name="download-for-offline" size={24} color={theme.colors.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{t('exportData')}</Text>
            <Text style={styles.cardDesc}>{t('exportDataDesc')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionCard, { borderColor: theme.colors.error }]} onPress={() => setModalVisible(true)}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(255,0,0,0.1)' }]}><Icon name="delete-forever" size={24} color={theme.colors.error} /></View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.colors.error }]}>{t('deleteAllData')}</Text>
            <Text style={styles.cardDesc}>{t('deleteAllDataDesc')}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Delete Warning Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Icon name="warning" size={32} color={theme.colors.error} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.modalTitleText}>{t('deleteWarningTitle')}</Text>
              </View>
            </View>
            <Text style={styles.modalText}>{t('deleteWarningMessage')}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnSecondaryText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDanger} onPress={handleDeleteAll}>
                <Icon name="delete" size={18} color={theme.colors.onErrorContainer} />
                <Text style={styles.btnDangerText}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.margin, paddingVertical: 12, backgroundColor: 'rgba(18, 19, 22, 0.85)' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...theme.typography.headlineLgMobile, color: theme.colors.onSurface, fontSize: 18 },
  scrollContent: { padding: theme.spacing.margin, gap: 16 },
  bodyText: { ...theme.typography.bodyMd, color: theme.colors.onSurfaceVariant, marginBottom: 12 },
  actionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: theme.colors.surfaceContainer, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.surfaceContainerHigh, gap: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { ...theme.typography.titleMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  cardDesc: { ...theme.typography.bodySm, color: theme.colors.onSurfaceVariant, marginTop: 4 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalBox: { backgroundColor: theme.colors.surfaceContainerHigh, width: '100%', maxWidth: 360, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.colors.outlineVariant },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  modalTitleText: { ...theme.typography.titleLg, color: theme.colors.error, fontWeight: 'bold' },
  modalText: { ...theme.typography.bodyMd, color: theme.colors.onSurfaceVariant, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  btnSecondary: { flex: 1, height: 44, borderRadius: 12, backgroundColor: theme.colors.surfaceContainerHighest, justifyContent: 'center', alignItems: 'center' },
  btnSecondaryText: { ...theme.typography.labelMd, color: theme.colors.onSurfaceVariant },
  btnDanger: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: 12, backgroundColor: theme.colors.errorContainer },
  btnDangerText: { ...theme.typography.labelMd, color: theme.colors.onErrorContainer, fontWeight: 'bold' },
});
