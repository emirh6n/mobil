import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useNotes } from '../hooks/useNotes';

import { Header } from '../components/Header';
import { useDateContext } from '../context/DateContext';

export const NotesScreen = () => {
  const { selectedDate } = useDateContext();
  const { note, loading, saveStatus, saveNote } = useNotes(selectedDate);
  
  const [localNote, setLocalNote] = useState('');

  useEffect(() => {
    if (!loading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalNote(note);
    }
  }, [loading, note]);

  const handleSave = () => {
    saveNote(localNote);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header subtitle="Notlar" />

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

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardSub}>Bu not seçili güne özeldir.</Text>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              {saveStatus === 'saving' ? (
                <ActivityIndicator size="small" color={theme.colors.onPrimaryContainer} />
              ) : (
                <Text style={styles.saveBtnText}>{saveStatus === 'saved' ? 'Kaydedildi' : 'Kaydet'}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.editorBox, saveStatus === 'saved' && { borderColor: theme.colors.primary }]}>
            {loading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <TextInput 
                style={styles.editorInput}
                placeholder="Bugünün notunu yaz..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                multiline
                value={localNote}
                onChangeText={setLocalNote}
              />
            )}
          </View>

          {saveStatus === 'saved' && (
            <View style={styles.statusRow}>
              <Icon name="check-circle" size={18} color={theme.colors.primary} />
              <Text style={styles.statusText}>Başarıyla kaydedildi</Text>
            </View>
          )}
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
  
  subheadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  subheadLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subheadLabel: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, letterSpacing: 1 },
  subheadRight: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.surfaceContainerHigh, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },
  subheadDateText: { ...theme.typography.labelMd, color: theme.colors.onSurface },
  
  card: { backgroundColor: theme.colors.surfaceContainer, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.surfaceBorder, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardSub: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  saveBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, minWidth: 80, alignItems: 'center' },
  saveBtnText: { ...theme.typography.labelMd, color: theme.colors.onPrimaryContainer, fontWeight: 'bold' },
  
  editorBox: { backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.colors.surfaceBorder, minHeight: 160 },
  editorInput: { color: theme.colors.onSurface, ...theme.typography.bodyMd, flex: 1, textAlignVertical: 'top' },
  
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusText: { ...theme.typography.labelSm, color: theme.colors.primary },
});
