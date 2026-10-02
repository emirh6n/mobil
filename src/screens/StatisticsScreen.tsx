import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { Header } from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { useStatistics } from '../hooks/useStatistics';
import { useDateContext } from '../context/DateContext';

export const StatisticsScreen = () => {
  const navigation = useNavigation();
  const { selectedDate } = useDateContext();
  const { loading, tasksCompleted, tasksTotal, calories, stepAvg, prs, libraryTotal, libraryCategories } = useStatistics(selectedDate);

  const [activeCategory, setActiveCategory] = useState('verimlilik');
  const [activeMuscle, setActiveMuscle] = useState('göğüs');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  const tasksPercent = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;
  const calPercent = Math.min(100, Math.round((calories / 2400) * 100));



  const renderTamamlamaGrafigi = () => {
    const weeks = [
      { label: '3H Önce', val: 0 },
      { label: '2H Önce', val: 0 },
      { label: 'Gçn H', val: 0 },
      { label: 'Bu H', val: tasksPercent },
    ];

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { marginLeft: 4 }]}>Tamamlama Grafiği (Son 4 Hafta)</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartContainer}>
            {weeks.map((w, idx) => (
              <View key={idx} style={styles.barCol}>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { height: `${w.val}%` }]} />
                </View>
                <Text style={styles.barLabel}>{w.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderVerimlilik = () => (
    <>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { marginLeft: 4 }]}>Odaklanma Süresi</Text>
        <View style={styles.odakCard}>
          <Text style={styles.odakValue}>0 dakika</Text>
          <Text style={styles.odakLabel}>Toplam Süre</Text>
        </View>
      </View>
      
      {renderTamamlamaGrafigi()}
      
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { marginLeft: 4 }]}>Not Takvim Tablosu</Text>
          <Text style={styles.sectionSubtitleSmall}>2026-09</Text>
        </View>
        <View style={styles.chartCard}>
          <View style={styles.calendarGrid}>
            {Array.from({length: 30}).map((_, i) => (
               <View key={i} style={styles.calDayBox}>
                 <Text style={styles.calDayText}>{i + 1}</Text>
               </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { marginLeft: 4 }]}>Kütüphane</Text>
        <View style={styles.chartCard}>
          <View style={[styles.telemetryCardNew, { minHeight: 0, padding: 16 }]}>
            <Icon name="smartphone" size={24} color={theme.colors.primary} />
            <View style={{ marginTop: 24 }}>
               <Text style={styles.telemetryLabelNew}>Toplam İçerik</Text>
               <Text style={styles.telemetryValueNew}>{libraryTotal}</Text>
            </View>
          </View>
          
          {libraryCategories.length > 0 && (
            <View style={{ marginTop: 24, gap: 16 }}>
              {libraryCategories.slice(0, 4).map((cat, idx) => {
                const percentage = libraryTotal > 0 ? (cat.count / libraryTotal) * 100 : 0;
                return (
                  <View key={idx}>
                    <View style={styles.libBarTop}>
                      <Text style={styles.libBarLabel}>{cat.category}</Text>
                      <Text style={styles.libBarValue}>{cat.count}</Text>
                    </View>
                    <View style={styles.libBarBg}>
                       <View style={[styles.libBarFill, { width: `${percentage}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </>
  );

  const renderSpor = () => {
    const muscles = ['Göğüs', 'Sırt', 'Omuz', 'Kol', 'Bacak', 'Karın'];
    
    const muscleExercises: Record<string, string[]> = {
      göğüs: ['Bench Press', 'Incline Press', 'Dumbbell Press', 'Cable Fly'],
      sırt: ['Pull Up', 'Lat Pulldown', 'Barbell Row', 'Deadlift'],
      omuz: ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Shrug'],
      kol: ['Barbell Curl', 'Hammer Curl', 'Triceps Extension', 'Dips'],
      bacak: ['Squat', 'Leg Press', 'Lunge', 'Leg Extension'],
      karın: ['Crunch', 'Plank', 'Leg Raise']
    };

    const currentExercises = muscleExercises[activeMuscle] || [];

    const filteredPrs = prs.filter(pr => {
      if (activeExercise) return pr.exercise_name === activeExercise;
      return currentExercises.includes(pr.exercise_name);
    });

    const handleMuscleSelect = (m: string) => {
      setActiveMuscle(m);
      setActiveExercise(null);
    };

    const handleExerciseSelect = (e: string) => {
      if (activeExercise === e) setActiveExercise(null);
      else setActiveExercise(e);
    };

    return (
      <>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginLeft: 4 }]}>Hareket</Text>
          <View style={[styles.telemetryCardNew, { minHeight: 0 }]}>
            <Icon name="show-chart" size={24} color={theme.colors.primary} />
            <View style={{ marginTop: 24 }}>
              <Text style={styles.telemetryLabelNew}>Adım Ortalaması</Text>
              <Text style={styles.telemetryValueNew}>{stepAvg}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.chartCard, { padding: 20, marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Kişisel Rekorlar (PR)</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
            {muscles.map(m => (
              <TouchableOpacity 
                key={m} 
                style={[styles.prChip, activeMuscle === m.toLowerCase() && styles.prChipActive]}
                onPress={() => handleMuscleSelect(m.toLowerCase())}
              >
                <Text style={[styles.prChipText, activeMuscle === m.toLowerCase() && styles.prChipTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
            {currentExercises.map(e => (
              <TouchableOpacity 
                key={e} 
                style={[styles.prChip, activeExercise === e && styles.prChipActive]}
                onPress={() => handleExerciseSelect(e)}
              >
                <Text style={[styles.prChipText, activeExercise === e && styles.prChipTextActive]}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {filteredPrs.length > 0 ? (
            <View style={[styles.prList, { marginTop: 16 }]}>
              {filteredPrs.map((pr, idx) => {
                const getMonthName = (m: string) => {
                  if (!m) return '';
                  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                  const i = parseInt(m, 10) - 1;
                  return months[i] || m;
                };
                return (
                  <View key={idx} style={styles.prItem}>
                    <View style={styles.prItemLeft}>
                      <View style={styles.prIconBox}><Icon name="fitness-center" size={20} color={theme.colors.primary} /></View>
                      <View>
                        <Text style={styles.prTitle}>{pr.exercise_name}</Text>
                        {pr.month && <Text style={styles.prSub}>{getMonthName(pr.month)} - {pr.date}</Text>}
                      </View>
                    </View>
                    <View style={styles.prItemRight}>
                      <Text style={styles.prValue}>{pr.max_weight} <Text style={styles.prUnit}>kg</Text></Text>
                      <Text style={styles.prSubRight}>{pr.sets} x {pr.reps} Tekrar</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 24, marginBottom: 8 }}>
              Kayıtlı rekor bulunamadı.
            </Text>
          )}
        </View>
      </>
    );
  };



  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header subtitle="İstatistik" hideBackButton />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Date Row */}
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

        {/* Category Tabs */}
        <View style={[styles.tabContainer, { marginTop: 16 }]}>
          {['verimlilik', 'spor'].map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.tabBtn, activeCategory === cat && styles.tabBtnActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.tabBtnText, activeCategory === cat && styles.tabBtnTextActive]}>
                {cat === 'verimlilik' ? 'Verimlilik' : 'Spor'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dynamic Sections */}
        {activeCategory === 'verimlilik' && renderVerimlilik()}

        {activeCategory === 'spor' && renderSpor()}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.margin, backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceBorder,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  iconBox: { width: 48, height: 48, borderRadius: theme.rounded.default, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  headerTextContainer: { justifyContent: 'center' },
  headerTitle: { ...theme.typography.headlineLgMobile, color: theme.colors.primary, lineHeight: 30 },
  headerSubtitle: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  dateBtn: {
    height: 36, paddingHorizontal: theme.spacing.sm, borderRadius: theme.rounded.full,
    backgroundColor: theme.colors.cardBg, borderWidth: 1, borderColor: theme.colors.surfaceBorder,
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginRight: 4,
  },
  dateBtnText: { ...theme.typography.labelMd, color: theme.colors.onSurface },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.cardBg, borderWidth: 1, borderColor: theme.colors.surfaceBorder, alignItems: 'center', justifyContent: 'center' },
  
  scrollContent: { padding: theme.spacing.margin, paddingBottom: 120, gap: theme.spacing.md },
  
  subheadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  subheadLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subheadLabel: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, letterSpacing: 1 },
  subheadRight: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.surfaceContainerHigh, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  subheadDateText: { ...theme.typography.labelMd, color: theme.colors.onSurface },
  
  tabContainer: { flexDirection: 'row', backgroundColor: theme.colors.surfaceContainerLowest, padding: 4, borderRadius: 12 },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tabBtnActive: { backgroundColor: theme.colors.primary },
  tabBtnText: { ...theme.typography.labelMd, color: theme.colors.onSurfaceVariant },
  tabBtnTextActive: { color: theme.colors.onPrimary, fontWeight: 'bold' },
  
  section: { gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },
  sectionTitle: { ...theme.typography.titleMd, color: theme.colors.primary },
  sectionSubtitle: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  
  grid2: { flexDirection: 'row', gap: 12 },
  telemetryCardNew: { flex: 1, backgroundColor: theme.colors.surfaceContainer, borderWidth: 1, borderColor: theme.colors.surfaceBorder, borderRadius: 16, padding: 16, justifyContent: 'space-between' },
  telemetryLabelNew: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, marginBottom: 4, fontWeight: 'bold' },
  telemetryValueNew: { ...theme.typography.headlineLgMobile, color: theme.colors.onSurface, fontWeight: 'bold' },
  
  chartCard: { backgroundColor: theme.colors.surfaceContainer, borderWidth: 1, borderColor: theme.colors.surfaceBorder, borderRadius: 16, padding: 24, marginTop: 8 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160 },
  barCol: { alignItems: 'center' },
  barBg: { width: 28, height: 120, borderRadius: 14, backgroundColor: 'rgba(159, 253, 80, 0.15)', justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', backgroundColor: theme.colors.primary, borderRadius: 14 },
  barLabel: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, marginTop: 12, fontSize: 10 },
  
  odakCard: { backgroundColor: theme.colors.surfaceContainer, borderWidth: 1, borderColor: theme.colors.surfaceBorder, borderRadius: 16, padding: 32, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  odakValue: { ...theme.typography.headlineLg, color: theme.colors.primary, fontWeight: 'bold', fontSize: 36 },
  odakLabel: { ...theme.typography.labelMd, color: theme.colors.onSurfaceVariant, marginTop: 8 },

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionSubtitleSmall: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },

  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  calDayBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  calDayText: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },

  libBarTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  libBarLabel: { ...theme.typography.labelMd, color: theme.colors.onSurfaceVariant },
  libBarValue: { ...theme.typography.labelMd, color: theme.colors.onSurfaceVariant },
  libBarBg: { height: 8, backgroundColor: 'rgba(159, 253, 80, 0.15)', borderRadius: 4, overflow: 'hidden' },
  libBarFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 4 },
  

  prChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.surfaceContainerHigh, borderWidth: 1, borderColor: theme.colors.surfaceBorder },
  prChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  prChipText: { ...theme.typography.labelMd, color: theme.colors.onSurfaceVariant },
  prChipTextActive: { color: theme.colors.onPrimary, fontWeight: 'bold' },
  
  prList: { gap: 8 },
  prItem: { backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prIconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: theme.colors.cardBg, borderWidth: 1, borderColor: theme.colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  prTitle: { ...theme.typography.titleMd, color: theme.colors.onSurface },
  prSub: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  prItemRight: { alignItems: 'flex-end' },
  prValue: { ...theme.typography.titleLg, color: theme.colors.primary, fontWeight: 'bold' },
  prUnit: { ...theme.typography.labelSm, color: theme.colors.onSurface, fontWeight: 'normal' },
  prSubRight: { ...theme.typography.labelSm, color: theme.colors.secondary },
});
