import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useReminders } from '../hooks/useReminders';
import { useImportantDates } from '../hooks/useImportantDates';

export const RemindersScreen = () => {
  const navigation = useNavigation();
  const { reminders, loading: remindersLoading, addReminder, toggleReminder, deleteReminder } = useReminders();
  const { dates, loading: datesLoading, addDate, deleteDate } = useImportantDates();

  const [alarmTime, setAlarmTime] = useState('07:30');
  const [alarmLabel, setAlarmLabel] = useState('Sabah Koşusu');
  const [isHardMode, setIsHardMode] = useState(false);
  
  const [dateTitle, setDateTitle] = useState('');
  const [dateVal, setDateVal] = useState('01.10.2026');
  const [timeVal, setTimeVal] = useState('19:59');
  const [dateNote, setDateNote] = useState('');

  const handleAddAlarm = () => {
    if (!alarmTime.trim() || !alarmLabel.trim()) return;
    addReminder(alarmTime, alarmLabel, isHardMode, '[]');
    setAlarmTime('07:30');
    setAlarmLabel('Sabah Koşusu');
    setIsHardMode(false);
  };

  const handleAddDate = () => {
    if (!dateTitle.trim() || !dateVal.trim()) return;
    addDate(dateTitle, dateVal, timeVal, dateNote);
    setDateTitle('');
    setDateVal('');
    setTimeVal('');
    setDateNote('');
  };

  const activeRemindersCount = reminders.filter(r => r.is_active).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hatırlatıcılar</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.dateBadge}>
            <Icon name="calendar-today" size={14} color={theme.colors.primary} />
            <Text style={styles.dateBadgeText}>01 EKI</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name="settings" size={20} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Alarmlar */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Alarmlar</Text>
            <Text style={styles.cardSub}>{activeRemindersCount} Aktif</Text>
          </View>
          
          {remindersLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : reminders.length === 0 ? (
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>Kayıtlı alarm yok.</Text>
          ) : (
            reminders.map(alarm => (
              <TouchableOpacity key={alarm.id} style={[styles.alarmItem, { marginBottom: 8 }]} onLongPress={() => deleteReminder(alarm.id)}>
                <View style={styles.alarmLeft}>
                  <View style={styles.alarmIconBox}>
                    <Icon name="alarm" size={20} color={theme.colors.primary} />
                  </View>
                  <View>
                    <View style={styles.alarmTimeRow}>
                      <Text style={[styles.alarmTime, !alarm.is_active && { color: theme.colors.onSurfaceVariant }]}>{alarm.time}</Text>
                      {alarm.is_hard_mode && (
                        <View style={styles.alarmBadge}><Text style={[styles.alarmBadgeText, { color: theme.colors.error }]}>Sert Mod</Text></View>
                      )}
                    </View>
                    <Text style={styles.alarmLabelText}>{alarm.label}</Text>
                  </View>
                </View>
                <Switch 
                  value={alarm.is_active} 
                  onValueChange={() => toggleReminder(alarm.id, alarm.is_active)}
                  trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }} 
                  thumbColor={alarm.is_active ? theme.colors.onPrimary : '#fff'} 
                />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Yeni Alarm */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Yeni Alarm</Text>
          <View style={styles.grid2}>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Saat</Text>
              <View style={styles.inputRow}>
                <TextInput style={styles.inputField} value={alarmTime} onChangeText={setAlarmTime} />
                <Icon name="schedule" size={18} color={theme.colors.primary} />
              </View>
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Etiket</Text>
              <TextInput style={styles.inputField} value={alarmLabel} onChangeText={setAlarmLabel} />
            </View>
          </View>

          <View style={styles.hardModeBox}>
            <View>
              <Text style={styles.hardModeTitle}>Sert Mod</Text>
              <Text style={styles.hardModeDesc}>Görev tamamlanmadan alarm susmaz.</Text>
            </View>
            <Switch value={isHardMode} onValueChange={setIsHardMode} trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.error }} thumbColor={isHardMode ? theme.colors.onPrimary : '#fff'} />
          </View>

          {isHardMode && (
            <View style={styles.challengeRow}>
              <TouchableOpacity style={styles.challengeBtnActive}>
                <Icon name="calculate" size={16} color={theme.colors.primary} />
                <Text style={styles.challengeBtnTextActive}>Matematik</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.challengeBtn}>
                <Icon name="vibration" size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.challengeBtnText}>Sallama</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={handleAddAlarm} disabled={remindersLoading}>
            <Icon name="add-alarm" size={20} color={theme.colors.onPrimaryContainer} />
            <Text style={styles.submitBtnText}>Alarm Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Önemli Tarihler */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Önemli Tarihler</Text>
            <Text style={styles.cardSub}>{dates.length} KAYIT</Text>
          </View>

          {datesLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : dates.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}><Icon name="event-busy" size={24} color={theme.colors.onSurfaceVariant} /></View>
              <Text style={styles.emptyTitle}>Tarih Yok</Text>
              <Text style={styles.emptyDesc}>Beklenen önemli bir tarih eklenmemiş.</Text>
            </View>
          ) : (
            dates.map(date => (
              <TouchableOpacity key={date.id} style={[styles.alarmItem, { marginBottom: 8 }]} onLongPress={() => deleteDate(date.id)}>
                <View style={styles.alarmLeft}>
                  <View style={[styles.alarmIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
                    <Icon name="event" size={20} color="#3b82f6" />
                  </View>
                  <View>
                    <View style={styles.alarmTimeRow}>
                      <Text style={[styles.alarmTime, { fontSize: 16 }]}>{date.target_date}</Text>
                      {date.target_time ? <View style={[styles.alarmBadge, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}><Text style={[styles.alarmBadgeText, { color: '#3b82f6' }]}>{date.target_time}</Text></View> : null}
                    </View>
                    <Text style={[styles.alarmLabelText, { color: theme.colors.onSurface }]}>{date.title}</Text>
                    {!!date.note && <Text style={{ fontSize: 11, color: theme.colors.onSurfaceVariant, marginTop: 2 }}>{date.note}</Text>}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Başlık</Text>
            <TextInput style={styles.inputFieldFull} placeholder="Örn: Doktor Randevusu" placeholderTextColor={theme.colors.onSurfaceVariant} value={dateTitle} onChangeText={setDateTitle} />
          </View>

          <View style={styles.grid2}>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Tarih</Text>
              <TextInput style={styles.inputFieldFull} placeholder="YYYY-MM-DD" placeholderTextColor={theme.colors.onSurfaceVariant} value={dateVal} onChangeText={setDateVal} />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Saat</Text>
              <TextInput style={styles.inputFieldFull} placeholder="HH:MM" placeholderTextColor={theme.colors.onSurfaceVariant} value={timeVal} onChangeText={setTimeVal} />
            </View>
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Not</Text>
            <TextInput style={[styles.inputFieldFull, { height: 60, textAlignVertical: 'top' }]} placeholder="Ek not..." placeholderTextColor={theme.colors.onSurfaceVariant} multiline value={dateNote} onChangeText={setDateNote} />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleAddDate} disabled={datesLoading}>
            <Icon name="calendar-month" size={20} color={theme.colors.onPrimaryContainer} />
            <Text style={styles.submitBtnText}>Tarih Ekle</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.margin, paddingVertical: 12, backgroundColor: 'rgba(18, 19, 22, 0.85)', borderBottomWidth: 1, borderBottomColor: 'rgba(38, 40, 46, 0.6)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { ...theme.typography.titleLg, color: theme.colors.onSurface, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.surfaceContainerHigh, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.surfaceBorder },
  dateBadgeText: { ...theme.typography.labelSm, color: theme.colors.primary, fontWeight: 'bold' },
  iconBtn: { padding: 8 },
  
  scrollContent: { padding: theme.spacing.margin, paddingBottom: 100, gap: 16 },
  
  card: { backgroundColor: theme.colors.surfaceContainer, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.surfaceBorder, gap: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { ...theme.typography.labelMd, color: theme.colors.primary, fontWeight: 'bold', textTransform: 'uppercase' },
  cardSub: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  
  alarmItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.surfaceContainerLowest, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.outlineVariant },
  alarmLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alarmIconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(159, 253, 80, 0.1)', borderWidth: 1, borderColor: 'rgba(159, 253, 80, 0.2)', alignItems: 'center', justifyContent: 'center' },
  alarmTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alarmTime: { ...theme.typography.titleLg, color: theme.colors.onSurface, fontWeight: 'bold' },
  alarmBadge: { backgroundColor: 'rgba(159, 253, 80, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  alarmBadgeText: { fontSize: 10, color: theme.colors.primary, fontWeight: 'bold' },
  alarmLabelText: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, marginTop: 4 },
  
  grid2: { flexDirection: 'row', gap: 12 },
  inputBox: { flex: 1, backgroundColor: theme.colors.surfaceContainerLowest, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.surfaceBorder },
  inputLabel: { fontSize: 10, color: theme.colors.onSurfaceVariant, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  inputField: { color: theme.colors.onSurface, fontWeight: 'bold', fontSize: 14, padding: 0 },
  inputFieldFull: { color: theme.colors.onSurface, fontWeight: '500', fontSize: 13, padding: 0, marginTop: 4 },
  
  hardModeBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.8)', padding: 12, borderRadius: 12 },
  hardModeTitle: { ...theme.typography.labelMd, color: theme.colors.error, fontWeight: 'bold' },
  hardModeDesc: { fontSize: 11, color: theme.colors.onSurfaceVariant, marginTop: 2 },
  
  challengeRow: { flexDirection: 'row', gap: 8 },
  challengeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.surfaceBorder },
  challengeBtnText: { fontSize: 12, color: theme.colors.onSurfaceVariant, fontWeight: '500' },
  challengeBtnActive: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(159, 253, 80, 0.1)', borderWidth: 1, borderColor: theme.colors.primary },
  challengeBtnTextActive: { fontSize: 12, color: theme.colors.primary, fontWeight: 'bold' },
  
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.colors.primary, height: 48, borderRadius: 12 },
  submitBtnText: { ...theme.typography.labelLg, color: theme.colors.onPrimaryContainer, fontWeight: 'bold' },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.outlineVariant },
  emptyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { ...theme.typography.labelMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  emptyDesc: { fontSize: 12, color: theme.colors.onSurfaceVariant, marginTop: 4 },
});
