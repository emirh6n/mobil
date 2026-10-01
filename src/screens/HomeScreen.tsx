import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useNavigation, NavigationProp, useIsFocused } from '@react-navigation/native';
import { useTasks } from '../hooks/useTasks';
import { useLibrary } from '../hooks/useLibrary';
import { useMoods } from '../hooks/useMoods';

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const isFocused = useIsFocused();
  const todayDate = new Date().toISOString().split('T')[0];
  
  const { tasks, refresh: refreshTasks } = useTasks(todayDate);
  const { resources, refresh: refreshLibrary } = useLibrary();
  const { rating, saveMood, refresh: refreshMood } = useMoods(todayDate);

  useEffect(() => {
    if (isFocused) {
      refreshTasks();
      refreshLibrary();
      refreshMood();
    }
  }, [isFocused, refreshTasks, refreshLibrary, refreshMood]);

  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Icon name="bolt" size={28} color={theme.colors.primary} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>TRKN</Text>
            <Text style={styles.headerSubtitle}>Ana Sayfa</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.dateBtn}>
            <Icon name="calendar-today" size={18} color={theme.colors.primary} />
            <Text style={styles.dateBtnText}>01 EKI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
            <Icon name="settings" size={22} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Görev Disiplini & Diğer */}
        <View style={styles.row}>
          
          <View style={[styles.card, { flex: 1 }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Görev Disiplini</Text>
              <Text style={styles.cardBadge}>{completedTasks} / {totalTasks}</Text>
            </View>
            <View style={styles.progressBox}>
              <Text style={styles.progressText}>{taskProgress}%</Text>
            </View>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Tasks')}>
              <Icon name="flag" size={16} color={theme.colors.primary} />
              <Text style={styles.actionBtnText}>Hedeflerini Gör</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ flex: 1, gap: theme.spacing.sm }}>
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { marginBottom: 8 }]}>Güne Puanım</Text>
              <View style={styles.heartRow}>
                {[1, 2, 3].map(level => (
                  <TouchableOpacity key={level} onPress={() => saveMood(level)}>
                    <Icon name="favorite" size={24} color={rating >= level ? theme.colors.error : theme.colors.onSurfaceVariant} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.rowCenter}><Icon name="timer" size={16} color={theme.colors.primary} /><Text style={styles.cardTitle}>Odak</Text></View>
                <Text style={styles.cardBadge}>Pomodoro</Text>
              </View>
              <View style={styles.timerRow}>
                <Text style={styles.timerText}>25:00</Text>
                <TouchableOpacity style={styles.playBtn}>
                  <Icon name="play-arrow" size={16} color={theme.colors.onPrimaryContainer} />
                  <Text style={styles.playBtnText}>Başlat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
        </View>

        {/* 3 Buton */}
        <View style={styles.grid3}>
          <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('Library')}>
            <View style={styles.navCardHeader}>
              <View style={styles.navIconBox}><Icon name="menu-book" size={18} color={theme.colors.primary} /></View>
              <Text style={styles.navBadge}>{resources.length}</Text>
            </View>
            <View>
              <Text style={styles.navTitle}>Kütüphane</Text>
              <Text style={styles.navSub}>Antrenman Notları</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('Notes')}>
            <View style={styles.navCardHeader}>
              <View style={styles.navIconBox}><Icon name="edit-note" size={18} color={theme.colors.primary} /></View>
              <Icon name="arrow-forward" size={14} color={theme.colors.onSurfaceVariant} />
            </View>
            <View>
              <Text style={styles.navTitle}>Notlar</Text>
              <Text style={styles.navSub}>1 Ekim Hedefleri</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('Reminders')}>
            <View style={styles.navCardHeader}>
              <View style={styles.navIconBox}><Icon name="notifications-active" size={18} color={theme.colors.primary} /></View>
              <View style={styles.dot} />
            </View>
            <View>
              <Text style={styles.navTitle}>Hatırlatıcı</Text>
              <Text style={styles.navSub}>07:30 Koşu</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Aylık Performans */}
        <View style={styles.cardLarge}>
          <View style={styles.cardHeaderLarge}>
            <View style={styles.rowCenter}><Icon name="calendar-month" size={20} color={theme.colors.primary} /><Text style={styles.cardTitleLarge}>Aylık Performans</Text></View>
            <View style={styles.monthSelector}>
              <TouchableOpacity><Icon name="chevron-left" size={18} color={theme.colors.onSurfaceVariant} /></TouchableOpacity>
              <Text style={styles.monthText}>Ekim 2026</Text>
              <TouchableOpacity><Icon name="chevron-right" size={18} color={theme.colors.onSurfaceVariant} /></TouchableOpacity>
            </View>
          </View>
          
          {/* Calendar placeholder */}
          <View style={styles.calendarGrid}>
            {['P', 'S', 'Ç', 'P', 'C', 'C', 'P'].map((d, i) => (
              <Text key={i} style={styles.calHeader}>{d}</Text>
            ))}
            {/* Days placeholders */}
            {[...Array(3)].map((_, i) => <View key={`e-${i}`} style={styles.calDayEmpty} />)}
            <View style={styles.calDayActive}><Text style={styles.calDayTextActive}>1</Text><View style={styles.dotPrimary} /></View>
            <View style={styles.calDay}><Text style={styles.calDayText}>2</Text></View>
            <View style={styles.calDay}><Text style={styles.calDayText}>3</Text></View>
            <View style={styles.calDay}><Text style={styles.calDayText}>4</Text></View>
            {/* ... other days ... */}
          </View>
          
          <View style={styles.legendRow}>
            <View style={styles.legendItem}><View style={styles.dotPrimary} /><Text style={styles.legendText}>Tamamlandı</Text></View>
            <View style={styles.legendItem}><View style={[styles.dotPrimary, {backgroundColor: theme.colors.primaryContainer}]} /><Text style={styles.legendText}>Kısmi</Text></View>
            <View style={styles.legendItem}><View style={[styles.dotPrimary, {backgroundColor: theme.colors.error}]} /><Text style={styles.legendText}>Eksik</Text></View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.margin, backgroundColor: 'rgba(18, 19, 22, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(38, 40, 46, 0.6)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  iconBox: { width: 40, height: 40, borderRadius: theme.rounded.xl, backgroundColor: theme.colors.surfaceContainerLow, borderWidth: 1, borderColor: theme.colors.surfaceBorder, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  headerTextContainer: { justifyContent: 'center' },
  headerTitle: { ...theme.typography.headlineMd, color: theme.colors.primary, lineHeight: 28 },
  headerSubtitle: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  dateBtn: { height: 36, paddingHorizontal: theme.spacing.sm, borderRadius: theme.rounded.full, backgroundColor: theme.colors.surfaceContainerLow, borderWidth: 1, borderColor: theme.colors.surfaceBorderLight, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginRight: 4 },
  dateBtnText: { ...theme.typography.labelMd, color: theme.colors.onSurface },
  settingsBtn: { width: 40, height: 40, borderRadius: theme.rounded.full, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  
  scrollContent: { padding: theme.spacing.margin, paddingBottom: 120, gap: theme.spacing.md },
  
  row: { flexDirection: 'row', gap: theme.spacing.sm },
  card: { backgroundColor: theme.colors.surfaceContainerLow, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.colors.surfaceBorderLight },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { ...theme.typography.titleMd, color: theme.colors.primary, fontWeight: 'bold' },
  cardBadge: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, backgroundColor: theme.colors.background, paddingHorizontal: 4, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.surfaceBorderLight },
  progressBox: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 80 },
  progressText: { ...theme.typography.headlineMd, color: theme.colors.primary, fontWeight: 'bold' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.surfaceBorderLight, borderRadius: 8, paddingVertical: 8 },
  actionBtnText: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  
  heartRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: theme.colors.background, padding: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(38, 40, 46, 0.5)' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  timerText: { ...theme.typography.headlineMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  playBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.primaryContainer, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  playBtnText: { ...theme.typography.labelSm, color: theme.colors.onPrimaryContainer, fontWeight: 'bold' },
  
  grid3: { flexDirection: 'row', gap: theme.spacing.sm },
  navCard: { flex: 1, backgroundColor: theme.colors.surfaceContainerLow, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.colors.surfaceBorderLight, minHeight: 96, justifyContent: 'space-between' },
  navCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  navIconBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.surfaceBorderLight },
  navBadge: { ...theme.typography.labelSm, color: theme.colors.primary, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: 'rgba(38, 40, 46, 0.6)', paddingHorizontal: 4, borderRadius: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary },
  navTitle: { ...theme.typography.labelMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  navSub: { fontSize: 10, color: theme.colors.onSurfaceVariant, marginTop: 2 },
  
  cardLarge: { backgroundColor: theme.colors.surfaceContainerLow, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.colors.surfaceBorderLight },
  cardHeaderLarge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  cardTitleLarge: { ...theme.typography.titleLg, color: theme.colors.primary, fontWeight: 'bold' },
  monthSelector: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.surfaceBorderLight, borderRadius: 8, padding: 2 },
  monthText: { ...theme.typography.labelMd, color: theme.colors.onSurface, fontWeight: 'bold', paddingHorizontal: 4 },
  
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  calHeader: { width: '12%', textAlign: 'center', ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  calDayEmpty: { width: '12%', height: 40, backgroundColor: 'rgba(18, 19, 22, 0.2)', borderRadius: 8 },
  calDay: { width: '12%', height: 40, backgroundColor: theme.colors.background, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(38, 40, 46, 0.6)', alignItems: 'center', justifyContent: 'center' },
  calDayActive: { width: '12%', height: 40, backgroundColor: theme.colors.surfaceContainerHigh, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(159, 253, 80, 0.4)', alignItems: 'center', justifyContent: 'center' },
  calDayText: { ...theme.typography.labelMd, color: theme.colors.onSurface },
  calDayTextActive: { ...theme.typography.labelMd, color: theme.colors.primary, fontWeight: 'bold' },
  dotPrimary: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary, marginTop: 2 },
  
  legendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 16, paddingTop: 8, borderTopWidth: 0 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
});
