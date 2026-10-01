import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { Header } from '../components/Header';
import { useNavigation, NavigationProp, useIsFocused } from '@react-navigation/native';
import { useTasks } from '../hooks/useTasks';
import { useLibrary } from '../hooks/useLibrary';
import { useMoods, useMonthlyMoods } from '../hooks/useMoods';
import { useDateContext } from '../context/DateContext';
import Svg, { Circle } from 'react-native-svg';

const getHeartColor = (heartIndex: number, currentRating: number) => {
  if (currentRating < heartIndex) return theme.colors.onSurfaceVariant;
  if (currentRating === 1) return '#8B0000'; // Dark Red
  if (currentRating === 2) return theme.colors.secondary; // Orange
  return theme.colors.primary; // Green
};

const getMoodColor = (rating: number) => {
  if (rating === 1) return '#8B0000'; // Dark Red
  if (rating === 2) return theme.colors.secondary; // Orange
  if (rating === 3) return theme.colors.primary; // Green
  return 'transparent'; // No color
};

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const isFocused = useIsFocused();
  const { selectedDate, setSelectedDate } = useDateContext();
  
  const [currentCalDate, setCurrentCalDate] = useState(new Date(selectedDate));
  
  const year = currentCalDate.getFullYear();
  const month = currentCalDate.getMonth(); // 0-11
  
  const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;

  const { tasks, refresh: refreshTasks } = useTasks(selectedDate);
  const { resources, refresh: refreshLibrary } = useLibrary();
  const { rating, saveMood, refresh: refreshMood } = useMoods(selectedDate);
  const { moods, refreshMonth } = useMonthlyMoods(yearMonth);

  useEffect(() => {
    if (isFocused) {
      refreshTasks();
      refreshLibrary();
      refreshMood();
      refreshMonth();
    }
  }, [isFocused, selectedDate, refreshTasks, refreshLibrary, refreshMood, refreshMonth, yearMonth]);

  const completedTasks = tasks.filter(t => t.is_completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Monday=0

  const handlePrevMonth = () => {
    setCurrentCalDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentCalDate(new Date(year, month + 1, 1));
  };

  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  const renderCalendarDays = () => {
    const cells = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.calDayEmpty} />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayRating = moods[dateStr];
      const isSelected = dateStr === selectedDate;
      
      let dotColor = getMoodColor(dayRating);
      
      cells.push(
        <TouchableOpacity 
          key={`day-${d}`} 
          style={[
            styles.calDay, 
            isSelected && styles.calDaySelected,
            { borderColor: dayRating ? dotColor : 'rgba(38, 40, 46, 0.6)' }
          ]}
          onPress={() => setSelectedDate(dateStr)}
        >
          <Text style={[
            styles.calDayText, 
            isSelected && styles.calDayTextSelected,
            dayRating ? { color: dotColor } : {}
          ]}>{d}</Text>
        </TouchableOpacity>
      );
    }
    
    // Add trailing empty cells so the last row has exactly 7 elements
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      const trailingEmpty = 7 - remainder;
      for (let i = 0; i < trailingEmpty; i++) {
        cells.push(<View key={`empty-end-${i}`} style={styles.calDayEmpty} />);
      }
    }
    
    return cells;
  };

  const handleSaveMood = async (level: number) => {
    await saveMood(level);
    refreshMonth();
  };

  // SVG Circle Progress
  const circleRadius = 36;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (taskProgress / 100) * circleCircumference;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header subtitle="Ana Sayfa" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Görev Disiplini & Güne Puanım */}
        <View style={styles.row}>
          <TouchableOpacity style={[styles.card, { flex: 1, justifyContent: 'space-between' }]} onPress={() => navigation.navigate('Tasks')}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Görev Disiplini</Text>
              <Text style={styles.cardBadge}>{completedTasks} / {totalTasks}</Text>
            </View>
            <View style={styles.progressBox}>
              <View style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                <Svg width="100" height="100" viewBox="0 0 100 100">
                  <Circle
                    cx="50"
                    cy="50"
                    r={circleRadius}
                    stroke="rgba(38, 40, 46, 0.6)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <Circle
                    cx="50"
                    cy="50"
                    r={circleRadius}
                    stroke={theme.colors.primary}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="50, 50"
                  />
                </Svg>
                <Text style={styles.progressTextAbs}>{taskProgress}%</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <View style={{ flex: 1, gap: theme.spacing.sm }}>
            <View style={[styles.card, { flex: 1, justifyContent: 'center' }]}>
              <Text style={[styles.cardTitle, { marginBottom: 12, textAlign: 'center' }]}>Güne Puanım</Text>
              <View style={styles.heartRow}>
                {[1, 2, 3].map(level => (
                  <TouchableOpacity key={level} onPress={() => handleSaveMood(level)}>
                    <Icon name="favorite" size={32} color={getHeartColor(level, rating)} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Butonlar Grid */}
        <View style={styles.grid2x2}>
          <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('Library')}>
            <View style={styles.navCardHeader}>
              <View style={styles.navIconBox}><Icon name="menu-book" size={18} color={theme.colors.primary} /></View>
              <Icon name="arrow-forward" size={14} color={theme.colors.onSurfaceVariant} />
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
              <Text style={styles.navSub}>Hızlı Hedefler</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('Reminders')}>
            <View style={styles.navCardHeader}>
              <View style={styles.navIconBox}><Icon name="notifications-active" size={18} color={theme.colors.primary} /></View>
              <Icon name="arrow-forward" size={14} color={theme.colors.onSurfaceVariant} />
            </View>
            <View>
              <Text style={styles.navTitle}>Hatırlatıcı</Text>
              <Text style={styles.navSub}>Alarmlar</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('Focus')}>
            <View style={styles.navCardHeader}>
              <View style={styles.navIconBox}><Icon name="timer" size={18} color={theme.colors.primary} /></View>
              <Icon name="arrow-forward" size={14} color={theme.colors.onSurfaceVariant} />
            </View>
            <View>
              <Text style={styles.navTitle}>Odak</Text>
              <Text style={styles.navSub}>Pomodoro</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Aylık Performans */}
        <View style={styles.cardLarge}>
          <View style={styles.cardHeaderLarge}>
            <View style={styles.rowCenter}><Icon name="calendar-month" size={20} color={theme.colors.primary} /><Text style={styles.cardTitleLarge}>Aylık Performans</Text></View>
            <View style={styles.monthSelector}>
              <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 4 }}><Icon name="chevron-left" size={20} color={theme.colors.onSurfaceVariant} /></TouchableOpacity>
              <Text style={styles.monthText}>{monthNames[month]} {year}</Text>
              <TouchableOpacity onPress={handleNextMonth} style={{ padding: 4 }}><Icon name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} /></TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.calendarGrid}>
            {['P', 'S', 'Ç', 'P', 'C', 'C', 'P'].map((d, i) => (
              <Text key={i} style={styles.calHeader}>{d}</Text>
            ))}
            {renderCalendarDays()}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: theme.spacing.margin, paddingBottom: 24, gap: theme.spacing.md },
  
  row: { flexDirection: 'row', gap: theme.spacing.sm },
  card: { backgroundColor: theme.colors.surfaceContainerLow, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.colors.surfaceBorderLight },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { ...theme.typography.titleMd, color: theme.colors.primary, fontWeight: 'bold' },
  cardBadge: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, backgroundColor: theme.colors.background, paddingHorizontal: 4, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.surfaceBorderLight },
  progressBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  progressTextAbs: { position: 'absolute', ...theme.typography.headlineMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  
  heartRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: theme.colors.background, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(38, 40, 46, 0.5)' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  
  grid2x2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  navCard: { flexGrow: 1, flexBasis: '45%', backgroundColor: theme.colors.surfaceContainerLow, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.colors.surfaceBorderLight, minHeight: 96, justifyContent: 'space-between' },
  navCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  navIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.surfaceBorderLight },
  navTitle: { ...theme.typography.labelMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  navSub: { fontSize: 10, color: theme.colors.onSurfaceVariant, marginTop: 2 },
  
  cardLarge: { backgroundColor: theme.colors.surfaceContainerLow, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.colors.surfaceBorderLight },
  cardHeaderLarge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  cardTitleLarge: { ...theme.typography.titleLg, color: theme.colors.primary, fontWeight: 'bold' },
  monthSelector: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.surfaceBorderLight, borderRadius: 8 },
  monthText: { ...theme.typography.labelMd, color: theme.colors.onSurface, fontWeight: 'bold', paddingHorizontal: 4 },
  
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
  calHeader: { width: '13%', textAlign: 'center', ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  calDayEmpty: { width: '13%', height: 40, backgroundColor: 'transparent', borderRadius: 8 },
  calDay: { width: '13%', height: 40, backgroundColor: theme.colors.background, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(38, 40, 46, 0.6)', alignItems: 'center', justifyContent: 'center' },
  calDaySelected: { backgroundColor: theme.colors.surfaceContainerHigh, borderWidth: 2, borderColor: theme.colors.onSurface },
  calDayText: { ...theme.typography.labelMd, color: theme.colors.onSurfaceVariant },
  calDayTextSelected: { color: theme.colors.onSurface, fontWeight: 'bold' },
});
