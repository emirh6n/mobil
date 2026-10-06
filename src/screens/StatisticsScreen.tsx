import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { Header } from '../components/Header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useStatistics } from '../hooks/useStatistics';
import { useDateContext } from '../context/DateContext';

export const StatisticsScreen = () => {
  const navigation = useNavigation();
  const { selectedDate } = useDateContext();
  const { loading, tasksCompleted, tasksTotal, stepAvg, prs, libraryTotal, libraryCategories, noteDays, focusTimeStr, taskWeeks, bodyHistory, refresh } = useStatistics(selectedDate);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const [activeCategory, setActiveCategory] = useState('verimlilik');
  const [activeMuscle, setActiveMuscle] = useState('tümü');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [bodyHistoryExpanded, setBodyHistoryExpanded] = useState(false);
  const renderTamamlamaGrafigi = () => {
    const weeks = [
      { label: '3H Önce', val: taskWeeks[0] },
      { label: '2H Önce', val: taskWeeks[1] },
      { label: 'Gçn H', val: taskWeeks[2] },
      { label: 'Bu H', val: taskWeeks[3] },
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

  const renderVerimlilik = () => {
    const currentMonthPrefix = selectedDate.substring(0, 7);
    const [yearStr, monthStr] = currentMonthPrefix.split('-');
    const daysInMonth = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0).getDate(); 
    
    return (
    <>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { marginLeft: 4 }]}>Odaklanma Süresi</Text>
        <View style={styles.odakCard}>
          <Text style={styles.odakValue}>{focusTimeStr}</Text>
          <Text style={styles.odakLabel}>Toplam Süre</Text>
        </View>
      </View>
      
      {renderTamamlamaGrafigi()}
      
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { marginLeft: 4 }]}>Not Takvim Tablosu</Text>
          <Text style={styles.sectionSubtitleSmall}>{currentMonthPrefix}</Text>
        </View>
        <View style={styles.chartCard}>
          <View style={styles.calendarGrid}>
            {Array.from({length: daysInMonth}).map((_, i) => {
               const day = i + 1;
               const hasNote = noteDays?.includes(day);
               return (
                 <View key={i} style={[styles.calDayBox, hasNote && { backgroundColor: theme.colors.primary }]}>
                   <Text style={[styles.calDayText, hasNote && { color: theme.colors.onPrimary, fontWeight: 'bold' }]}>{day}</Text>
                 </View>
               );
            })}
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
  };

  const renderSpor = () => {
    const muscles = ['Tümü', 'Göğüs', 'Sırt', 'Omuz', 'Kol', 'Bacak & Kalça', 'Boyun', 'Karın'];
    
    const muscleExercises: Record<string, string[]> = {
      göğüs: ['Machine Pec Deck / Cable Fly', 'Dips', 'Bench Press (Incline, Seated)', 'Seated Chest Press'],
      sırt: ['Dumbbell Shrugs', 'Pull Up', 'Pull Down', 'Barbell Row / Machine Row'],
      omuz: ['Lateral Raise (Cable/Dumbbell)', 'Shoulder Press / Overhead', 'Reverse Fly Machine', 'Cable Face Pull'],
      kol: ['Dumbbell Wrist Curls / Extensions', 'Bayesian Cable Curl', 'Preacher Curl', '(Seated) Tricep Extension', 'Skull Crusher'],
      'bacak & kalça': ['Standing Calf Raise', 'Deadlift (+Romanian)', 'Seated Leg Curl / Extension', 'Squat (Barbell, Bulgarian)', 'Barbell Hip Thrust', 'Walking Lunge', 'Glute Bridge'],
      boyun: ['Neck Curls / Extensions'],
      karın: ['Cable Crunch']
    };

    const currentExercises = activeMuscle === 'tümü' ? [] : (muscleExercises[activeMuscle.toLowerCase()] || []);

    const filteredPrs = prs.filter(pr => {
      if (activeExercise) return pr.exercise_name === activeExercise;
      if (activeMuscle === 'tümü') return true;
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
          
          {currentExercises.length > 0 && (
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
          )}
          
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
                  <View key={idx} style={styles.prItemCompact}>
                    <View style={styles.prItemLeft}>
                      <View style={styles.prIconBoxSmall}><Icon name="event" size={16} color={theme.colors.primary} /></View>
                      <View>
                        {pr.month ? (
                          <Text style={styles.prTitleCompact}>{pr.date} {getMonthName(pr.month)}</Text>
                        ) : (
                          <Text style={styles.prTitleCompact}>Tarihsiz</Text>
                        )}
                        <Text style={styles.prSubCompact}>{pr.sets} Set x {pr.reps} Tekrar</Text>
                      </View>
                    </View>
                    <View style={styles.prItemRight}>
                      <Text style={styles.prValueCompact}>{pr.max_weight} <Text style={styles.prUnitCompact}>kg</Text></Text>
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

          {/* Body Analysis History Section */}
          <View style={[styles.chartCard, { padding: 0, marginTop: 16 }]}>
            <TouchableOpacity 
              style={[styles.accordionHeader, { padding: 20 }]} 
              onPress={() => setBodyHistoryExpanded(!bodyHistoryExpanded)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Icon name="monitor-weight" size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>Vücut Analizi Geçmişi</Text>
              </View>
              <Icon name={bodyHistoryExpanded ? "expand-less" : "expand-more"} size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>

            {bodyHistoryExpanded && (
              <View style={{ padding: 20, paddingTop: 0 }}>
                {bodyHistory.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
                    {bodyHistory.map((item, idx) => {
                      const prev = bodyHistory[idx + 1];
                      
                      const renderDiff = (current: number | null | undefined, previous: number | null | undefined, unit: string) => {
                        if (current == null || previous == null) return null;
                        const diff = current - previous;
                        if (diff === 0) return null;
                        const sign = diff > 0 ? '+' : '';
                        // Using a neutral color because weight gain could be a goal (bulking) or weight loss could be a goal (cutting).
                        return (
                          <Text style={{ fontSize: 11, color: theme.colors.onSurfaceVariant, marginLeft: 6, fontWeight: '500' }}>
                            ({sign}{diff.toFixed(1)} {unit})
                          </Text>
                        );
                      };

                      return (
                        <View key={idx} style={styles.bodyHistoryCard}>
                          <View style={styles.bodyHistoryHeader}>
                            <Icon name="event" size={14} color={theme.colors.onSurfaceVariant} />
                            <Text style={styles.bodyHistoryDate}>{item.date}</Text>
                          </View>
                          <View style={styles.bodyHistoryRow}>
                            <Icon name="monitor-weight" size={20} color={theme.colors.primary} />
                            <Text style={styles.bodyHistoryValue}>{item.weight} <Text style={{fontSize: 12, color: theme.colors.onSurfaceVariant}}>kg</Text></Text>
                            {renderDiff(item.weight, prev?.weight, 'kg')}
                          </View>
                          <View style={styles.bodyHistoryRow}>
                            <Icon name="height" size={20} color={theme.colors.secondary} />
                            <Text style={styles.bodyHistoryValue}>{item.height} <Text style={{fontSize: 12, color: theme.colors.onSurfaceVariant}}>cm</Text></Text>
                            {renderDiff(item.height, prev?.height, 'cm')}
                          </View>
                          {item.body_fat != null && (
                            <View style={styles.bodyHistoryRow}>
                              <Icon name="analytics" size={20} color="#ff9800" />
                              <Text style={styles.bodyHistoryValue}>{item.body_fat} <Text style={{fontSize: 12, color: theme.colors.onSurfaceVariant}}>% Yağ</Text></Text>
                              {renderDiff(item.body_fat, prev?.body_fat, '%')}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                    <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', fontSize: 13, marginBottom: 12 }}>
                      Henüz vücut analizi kaydınız bulunmuyor. Görebilmek için ayarlar menüsünden biyometrik parametrelerinizi doldurunuz.
                    </Text>
                    <TouchableOpacity 
                      style={{ backgroundColor: theme.colors.surfaceContainerHighest, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                      onPress={() => (navigation.navigate as any)('Settings')}
                    >
                      <Icon name="settings" size={16} color={theme.colors.primary} />
                      <Text style={{ color: theme.colors.primary, fontWeight: '500', fontSize: 13 }}>Ayarlara Git</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </>
    );
  };



  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header subtitle="İstatistik" hideBackButton />

      {loading && tasksTotal === 0 && prs.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 12, color: theme.colors.onSurfaceVariant, fontSize: 14 }}>
            Verileriniz Hesaplanıyor...
          </Text>
        </View>
      ) : (
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={refresh} 
            tintColor={theme.colors.primary} 
            colors={[theme.colors.primary]} 
          />
        }
      >
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
      )}
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
  prItemCompact: { backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  prItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  prIconBoxSmall: { width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.cardBg, borderWidth: 1, borderColor: theme.colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  prTitleCompact: { ...theme.typography.titleMd, color: theme.colors.onSurface, fontSize: 14, fontWeight: 'bold' },
  prSubCompact: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, fontSize: 11, marginTop: 2 },
  prItemRight: { alignItems: 'flex-end' },
  prValueCompact: { ...theme.typography.titleLg, color: theme.colors.primary, fontWeight: 'bold', fontSize: 18 },
  prUnitCompact: { ...theme.typography.labelSm, color: theme.colors.onSurface, fontWeight: 'normal' },
  
  bodyHistoryCard: { backgroundColor: theme.colors.surfaceContainerLowest, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.surfaceBorderLight, minWidth: 140, gap: 12 },
  bodyHistoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceContainerHigh, paddingBottom: 8 },
  bodyHistoryDate: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  bodyHistoryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bodyHistoryValue: { ...theme.typography.titleMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
