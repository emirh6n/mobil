import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useReminders } from '../hooks/useReminders';
import { useImportantDates } from '../hooks/useImportantDates';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Header } from '../components/Header';

export const RemindersScreen = () => {
  const navigation = useNavigation();
  const { reminders, loading: remindersLoading, addReminder, toggleReminder, deleteReminder, updateReminder } = useReminders();
  const { dates, loading: datesLoading, addDate, deleteDate, updateDate } = useImportantDates();

  const [editingAlarmId, setEditingAlarmId] = useState<number | null>(null);
  const [alarmTimeDate, setAlarmTimeDate] = useState(new Date());
  const [alarmDate, setAlarmDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [alarmLabel, setAlarmLabel] = useState('');
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'custom'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isHardMode, setIsHardMode] = useState(false);
  
  const [editingDateId, setEditingDateId] = useState<number | null>(null);
  const [dateTitle, setDateTitle] = useState('');
  const [dateTargetDate, setDateTargetDate] = useState(new Date());
  const [dateTargetTime, setDateTargetTime] = useState(new Date());
  const [showDateTargetDatePicker, setShowDateTargetDatePicker] = useState(false);
  const [showDateTargetTimePicker, setShowDateTargetTimePicker] = useState(false);

  const formatTime = (d: Date) => {
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleAddAlarm = () => {
    if (!alarmLabel.trim()) return;
    const timeStr = formatTime(alarmTimeDate);
    
    let daysStr = '[]';
    if (frequency === 'once') daysStr = JSON.stringify([formatDate(alarmDate)]);
    else if (frequency === 'daily') daysStr = JSON.stringify(['all']);
    else if (frequency === 'custom') daysStr = JSON.stringify(selectedDays);

    if (editingAlarmId) {
      updateReminder(editingAlarmId, timeStr, alarmLabel, isHardMode, daysStr);
      setEditingAlarmId(null);
    } else {
      addReminder(timeStr, alarmLabel, isHardMode, daysStr);
    }
    
    setAlarmLabel('');
    setIsHardMode(false);
    setFrequency('daily');
    setSelectedDays([]);
  };

  const handleAddDate = () => {
    if (!dateTitle.trim()) return;
    const dVal = formatDate(dateTargetDate);
    const tVal = formatTime(dateTargetTime);
    if (editingDateId) {
      updateDate(editingDateId, dateTitle, dVal, tVal, '');
      setEditingDateId(null);
    } else {
      addDate(dateTitle, dVal, tVal, '');
    }
    setDateTitle('');
    setDateTargetDate(new Date());
    setDateTargetTime(new Date());
  };

  const handleEditAlarm = (alarm: any) => {
    setEditingAlarmId(alarm.id);
    setAlarmLabel(alarm.label);
    setIsHardMode(alarm.is_hard_mode);
    
    const [hh, mm] = alarm.time.split(':');
    const d = new Date();
    d.setHours(parseInt(hh, 10));
    d.setMinutes(parseInt(mm, 10));
    setAlarmTimeDate(d);
    
    try {
      const parsedDays = JSON.parse(alarm.days || '[]');
      if (parsedDays.length === 1 && parsedDays[0] === 'all') {
        setFrequency('daily');
      } else if (parsedDays.length === 1 && typeof parsedDays[0] === 'string' && parsedDays[0].includes('-')) {
        setFrequency('once');
        setAlarmDate(new Date(parsedDays[0]));
      } else {
        setFrequency('custom');
        setSelectedDays(parsedDays);
      }
    } catch {
      setFrequency('daily');
    }
  };

  const handleEditDate = (date: any) => {
    setEditingDateId(date.id);
    setDateTitle(date.title);
    setDateTargetDate(new Date(date.target_date));
    
    const [hh, mm] = (date.target_time || '12:00').split(':');
    const d = new Date();
    d.setHours(parseInt(hh, 10) || 12);
    d.setMinutes(parseInt(mm, 10) || 0);
    setDateTargetTime(d);
  };

  const confirmDeleteAlarm = (id: number) => {
    Alert.alert('Alarmı Sil', 'Bu alarmı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteReminder(id) }
    ]);
  };

  const confirmDeleteDate = (id: number) => {
    Alert.alert('Tarihi Sil', 'Bu tarihi silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteDate(id) }
    ]);
  };

  const activeRemindersCount = reminders.filter(r => r.is_active).length;

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(d => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex]);
    }
  };

  const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header subtitle="Hatırlatıcılar" />

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
              <TouchableOpacity key={alarm.id} style={[styles.alarmItem, { marginBottom: 8 }]} onPress={() => handleEditAlarm(alarm)} onLongPress={() => confirmDeleteAlarm(alarm.id)}>
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.cardTitle}>{editingAlarmId ? 'Alarmı Güncelle' : 'Yeni Alarm'}</Text>
            {editingAlarmId && (
              <TouchableOpacity onPress={() => { setEditingAlarmId(null); setAlarmLabel(''); setIsHardMode(false); setFrequency('daily'); }}>
                <Icon name="close" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.grid2}>
            <TouchableOpacity style={styles.inputBox} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.inputLabel}>Saat</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputField}>{formatTime(alarmTimeDate)}</Text>
                <Icon name="schedule" size={18} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Etiket</Text>
              <TextInput style={styles.inputField} placeholder="Yazınız" placeholderTextColor={theme.colors.onSurfaceVariant} value={alarmLabel} onChangeText={setAlarmLabel} />
            </View>
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={alarmTimeDate}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={(event, selectedDate) => {
                setShowTimePicker(false);
                if (selectedDate) setAlarmTimeDate(selectedDate);
              }}
            />
          )}

          <View style={{ gap: 8 }}>
            <Text style={styles.inputLabel}>Sıklık</Text>
            <View style={styles.freqRow}>
              <TouchableOpacity style={[styles.freqBtn, frequency === 'once' && styles.freqBtnActive]} onPress={() => setFrequency('once')}>
                <Text style={[styles.freqBtnText, frequency === 'once' && styles.freqBtnTextActive]}>Tek Seferlik</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.freqBtn, frequency === 'daily' && styles.freqBtnActive]} onPress={() => setFrequency('daily')}>
                <Text style={[styles.freqBtnText, frequency === 'daily' && styles.freqBtnTextActive]}>Günlük</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.freqBtn, frequency === 'custom' && styles.freqBtnActive]} onPress={() => setFrequency('custom')}>
                <Text style={[styles.freqBtnText, frequency === 'custom' && styles.freqBtnTextActive]}>Seçili Günler</Text>
              </TouchableOpacity>
            </View>
          </View>

          {frequency === 'once' && (
            <TouchableOpacity style={styles.inputBox} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.inputLabel}>Tarih</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputField}>{formatDate(alarmDate)}</Text>
                <Icon name="event" size={18} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={alarmDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setAlarmDate(selectedDate);
              }}
            />
          )}

          {frequency === 'custom' && (
            <View style={styles.weekRow}>
              {WEEKDAYS.map((day, i) => {
                const isActive = selectedDays.includes(i);
                return (
                  <TouchableOpacity key={day} style={[styles.dayCircle, isActive && styles.dayCircleActive]} onPress={() => toggleDay(i)}>
                    <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.hardModeBox}>
            <View>
              <Text style={styles.hardModeTitle}>Sert Mod</Text>
              <Text style={styles.hardModeDesc}>Görev tamamlanmadan alarm susmaz.</Text>
            </View>
            <Switch value={isHardMode} onValueChange={setIsHardMode} trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.error }} thumbColor={isHardMode ? theme.colors.onPrimary : '#fff'} />
          </View>



          <TouchableOpacity style={styles.submitBtn} onPress={handleAddAlarm} disabled={remindersLoading}>
            <Icon name={editingAlarmId ? "edit" : "add-alarm"} size={20} color={theme.colors.onPrimaryContainer} />
            <Text style={styles.submitBtnText}>{editingAlarmId ? 'Alarmı Güncelle' : 'Alarm Ekle'}</Text>
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
              <TouchableOpacity key={date.id} style={[styles.alarmItem, { marginBottom: 8 }]} onPress={() => handleEditDate(date)} onLongPress={() => confirmDeleteDate(date.id)}>
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

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <Text style={[styles.cardTitle, { fontSize: 14 }]}>{editingDateId ? 'Tarihi Güncelle' : 'Yeni Tarih Ekle'}</Text>
            {editingDateId && (
              <TouchableOpacity onPress={() => { setEditingDateId(null); setDateTitle(''); setDateTargetDate(new Date()); setDateTargetTime(new Date()); }}>
                <Icon name="close" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Başlık</Text>
            <TextInput style={styles.inputFieldFull} placeholder="Yazınız" placeholderTextColor={theme.colors.onSurfaceVariant} value={dateTitle} onChangeText={setDateTitle} />
          </View>

          <View style={styles.grid2}>
            <TouchableOpacity style={styles.inputBox} onPress={() => setShowDateTargetDatePicker(true)}>
              <Text style={styles.inputLabel}>Tarih</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputFieldFull}>{formatDate(dateTargetDate)}</Text>
                <Icon name="event" size={18} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inputBox} onPress={() => setShowDateTargetTimePicker(true)}>
              <Text style={styles.inputLabel}>Saat</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputFieldFull}>{formatTime(dateTargetTime)}</Text>
                <Icon name="schedule" size={18} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {showDateTargetDatePicker && (
            <DateTimePicker
              value={dateTargetDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDateTargetDatePicker(false);
                if (selectedDate) setDateTargetDate(selectedDate);
              }}
            />
          )}

          {showDateTargetTimePicker && (
            <DateTimePicker
              value={dateTargetTime}
              mode="time"
              is24Hour={true}
              display="spinner"
              onChange={(event, selectedDate) => {
                setShowDateTargetTimePicker(false);
                if (selectedDate) setDateTargetTime(selectedDate);
              }}
            />
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={handleAddDate} disabled={datesLoading}>
            <Icon name={editingDateId ? "edit" : "calendar-month"} size={20} color={theme.colors.onPrimaryContainer} />
            <Text style={styles.submitBtnText}>{editingDateId ? 'Tarihi Güncelle' : 'Tarih Ekle'}</Text>
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
  
  scrollContent: { padding: theme.spacing.margin, paddingBottom: 24, gap: 16 },
  
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
  
  freqRow: { flexDirection: 'row', gap: 8 },
  freqBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.surfaceBorder },
  freqBtnActive: { backgroundColor: 'rgba(159, 253, 80, 0.1)', borderColor: theme.colors.primary },
  freqBtnText: { fontSize: 12, color: theme.colors.onSurfaceVariant, fontWeight: '500' },
  freqBtnTextActive: { color: theme.colors.primary, fontWeight: 'bold' },
  
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  dayCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.surfaceContainerLowest, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.surfaceBorder },
  dayCircleActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  dayText: { fontSize: 11, color: theme.colors.onSurfaceVariant, fontWeight: '500' },
  dayTextActive: { color: theme.colors.onPrimary, fontWeight: 'bold' },
});
