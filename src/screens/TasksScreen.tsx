import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useTasks } from '../hooks/useTasks';

import { Header } from '../components/Header';
import { useDateContext } from '../context/DateContext';

export const TasksScreen = () => {
  const { selectedDate } = useDateContext();
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks(selectedDate);
  
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleAddTask = () => {
    if (!title.trim()) return;
    addTask(title, desc, selectedDate);
    setTitle('');
    setDesc('');
  };

  const pendingTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header subtitle="Görev Disiplini" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.subheadRow}>
          <View style={styles.subheadLeft}>
            <Icon name="calendar-month" size={18} color={theme.colors.primary} />
            <Text style={styles.subheadLabel}>SEÇİLİ GÜN</Text>
          </View>
          <View style={styles.subheadRight}>
            <View style={styles.pulseDot} />
            <Text style={styles.subheadDateText}>{selectedDate}</Text>
          </View>
        </View>

        {/* Task Lists */}
        <View style={styles.taskListContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <>
              {/* Pending */}
              <View style={styles.listSection}>
                <View style={styles.listHeader}>
                  <Text style={styles.listTitle}>Bekleyen Görevler</Text>
                  <Text style={styles.listSub}>Bugün</Text>
                </View>
                <View style={styles.list}>
                  {pendingTasks.length === 0 && <Text style={styles.emptyText}>Bekleyen görev yok.</Text>}
                  {pendingTasks.map(t => (
                    <TouchableOpacity key={t.id} style={styles.taskItem} onPress={() => toggleTask(t.id, t.is_completed)} onLongPress={() => deleteTask(t.id)}>
                      <View style={styles.checkbox} />
                      <View style={styles.taskTextContent}>
                        <Text style={styles.taskTitle}>{t.title}</Text>
                        {!!t.description && <Text style={styles.taskDesc}>{t.description}</Text>}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.divider} />

              {/* Completed */}
              <View style={styles.listSection}>
                <View style={styles.listHeader}>
                  <Text style={[styles.listTitle, { color: theme.colors.onSurfaceVariant }]}>Tamamlanan Görevler</Text>
                </View>
                <View style={styles.list}>
                  {completedTasks.length === 0 && <Text style={styles.emptyText}>Henüz tamamlanan görev yok.</Text>}
                  {completedTasks.map(t => (
                    <TouchableOpacity key={t.id} style={styles.taskItem} onPress={() => toggleTask(t.id, t.is_completed)} onLongPress={() => deleteTask(t.id)}>
                      <View style={[styles.checkbox, styles.checkboxChecked]}><Icon name="check" size={16} color={theme.colors.onPrimary} /></View>
                      <View style={styles.taskTextContent}>
                        <Text style={[styles.taskTitle, styles.taskTitleCompleted]}>{t.title}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>

        {/* New Task Form */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <View style={styles.formHeaderLeft}>
              <View style={styles.pulseDot} />
              <Text style={styles.formTitle}>Hızlı Görev Ekle</Text>
            </View>
            <Text style={styles.formSub}>Gelişmiş Form</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Görev Başlığı</Text>
            <TextInput 
              style={styles.textInput} 
              placeholder="Başlık" 
              placeholderTextColor={theme.colors.onSurfaceVariant + '80'}
              value={title}
              onChangeText={setTitle}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Açıklama / Hedef</Text>
            <TextInput 
              style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]} 
              placeholder="Detaylar..." 
              placeholderTextColor={theme.colors.onSurfaceVariant + '80'}
              multiline
              value={desc}
              onChangeText={setDesc}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleAddTask} disabled={loading}>
            <Icon name="add-task" size={20} color={theme.colors.onPrimaryContainer} />
            <Text style={styles.submitBtnText}>Görevi Kaydet</Text>
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
  headerSubtitle: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.surfaceContainerHigh, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.surfaceBorder },
  dateBadgeText: { ...theme.typography.labelSm, color: theme.colors.primary, fontWeight: 'bold' },
  iconBtn: { padding: 8 },
  
  scrollContent: { padding: theme.spacing.margin, paddingBottom: 100, gap: 16 },
  
  subheadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  subheadLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subheadLabel: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, letterSpacing: 1 },
  subheadRight: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.surfaceContainerHigh, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },
  subheadDateText: { ...theme.typography.labelMd, color: theme.colors.onSurface },
  
  taskListContainer: { gap: 16 },
  listSection: { gap: 12 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  listTitle: { ...theme.typography.labelMd, color: theme.colors.onSurface, fontWeight: 'bold', textTransform: 'uppercase' },
  listSub: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  list: { gap: 8 },
  emptyText: { ...theme.typography.bodySm, color: theme.colors.onSurfaceVariant, paddingHorizontal: 4 },
  divider: { height: 1, backgroundColor: 'rgba(46, 48, 56, 0.6)', marginVertical: 8 },
  
  taskItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: theme.colors.surfaceContainerLowest, padding: 12, borderRadius: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.outlineVariant, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  taskTextContent: { flex: 1 },
  taskTitle: { ...theme.typography.bodyMd, color: theme.colors.onSurface, fontWeight: '500' },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: theme.colors.onSurfaceVariant },
  taskDesc: { ...theme.typography.bodySm, color: theme.colors.onSurfaceVariant, marginTop: 4 },
  
  formCard: { backgroundColor: theme.colors.surfaceContainer, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.surfaceBorder, gap: 12 },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(38, 40, 46, 0.6)', paddingBottom: 8 },
  formHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },
  formTitle: { ...theme.typography.labelMd, color: theme.colors.onSurface, fontWeight: 'bold', textTransform: 'uppercase' },
  formSub: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  
  inputGroup: { gap: 4 },
  inputLabel: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, fontWeight: '600' },
  textInput: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.surfaceBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: theme.colors.onSurface, ...theme.typography.bodyMd },
  
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.colors.primary, height: 48, borderRadius: 12, marginTop: 8 },
  submitBtnText: { ...theme.typography.labelLg, color: theme.colors.onPrimaryContainer, fontWeight: 'bold' },
});
