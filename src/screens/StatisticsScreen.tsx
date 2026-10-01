import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useStatistics } from '../hooks/useStatistics';

export const StatisticsScreen = () => {
  const navigation = useNavigation();
  const todayDate = new Date().toISOString().split('T')[0];
  const { loading, tasksCompleted, tasksTotal, calories, prs } = useStatistics(todayDate);

  const [activeCategory, setActiveCategory] = useState('hepsi');
  const [activePeriod, setActivePeriod] = useState('bu-hafta');
  const [activeMuscle, setActiveMuscle] = useState('gogus');

  const tasksPercent = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;
  const calPercent = Math.min(100, Math.round((calories / 2400) * 100));

  const renderEnerji = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.sectionTitle}>Enerji & Görev</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Özet Telemetri</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.primary} />
      ) : (
        <View style={styles.grid2}>
          <View style={styles.telemetryCard}>
            <View style={styles.telemetryTop}>
              <View>
                <Text style={styles.telemetryLabel}>Kalori Dengesi</Text>
                <Text style={styles.telemetryValue}>{calories} <Text style={styles.telemetryUnit}>kcal</Text></Text>
              </View>
              <View style={styles.telemetryIconBox}>
                <Icon name="favorite" size={20} color={theme.colors.primary} />
              </View>
            </View>
            <View style={styles.telemetryBottom}>
              <View style={styles.telemetryBottomLeft}>
                <Icon name="trending-flat" size={14} color={theme.colors.primary} />
                <Text style={styles.telemetrySubLabel}>Hedef: 2,400</Text>
              </View>
              <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${calPercent}%` }]} /></View>
            </View>
          </View>
          <View style={styles.telemetryCard}>
            <View style={styles.telemetryTop}>
              <View>
                <Text style={styles.telemetryLabel}>Görev Başarısı</Text>
                <Text style={styles.telemetryValue}>%{tasksPercent} <Text style={styles.telemetryUnit}>tamam</Text></Text>
              </View>
              <View style={styles.telemetryIconBox}>
                <Icon name="check-box" size={20} color={theme.colors.primary} />
              </View>
            </View>
            <View style={styles.telemetryBottom}>
              <View style={styles.telemetryBottomLeft}>
                <Icon name={tasksPercent === 100 ? "flag" : "flag"} size={14} color={tasksPercent === 100 ? theme.colors.primary : theme.colors.error} />
                <Text style={styles.telemetrySubLabel}>{tasksCompleted}/{tasksTotal} Görev</Text>
              </View>
              <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${tasksPercent}%` }]} /></View>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderVerimlilik = () => (
    <View style={styles.grid2}>
      <View style={styles.verimlilikCard}>
        <View style={styles.verimlilikTop}>
          <Text style={styles.verimlilikTitle}>Odaklanma Süresi</Text>
          <View style={styles.verimlilikIconBox}><Icon name="timer" size={18} color={theme.colors.primary} /></View>
        </View>
        <View style={styles.verimlilikContent}>
          <Text style={styles.verimlilikValue}>0 <Text style={styles.verimlilikUnit}>dakika</Text></Text>
          <Text style={styles.verimlilikDesc}>Bugün kaydedilen toplam oturum</Text>
        </View>
      </View>
      <View style={styles.verimlilikCard}>
        <View style={styles.verimlilikTop}>
          <Text style={styles.verimlilikTitle}>Hareket & Telemetri</Text>
          <View style={styles.verimlilikIconBox}><Icon name="directions-walk" size={18} color={theme.colors.primary} /></View>
        </View>
        <View style={styles.verimlilikContent}>
          <Text style={[styles.verimlilikValue, { color: theme.colors.onSurface }]}>0 <Text style={[styles.verimlilikUnit, { color: theme.colors.primary }]}>Adım</Text></Text>
          <Text style={styles.verimlilikDesc}>Günlük Adım</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 8 }}>
            <Icon name="arrow-back" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
            <Icon name="bolt" size={32} color={theme.colors.primary} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { fontSize: 26 }]}>TRKN</Text>
            <Text style={styles.headerSubtitle}>İstatistik</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.dateBtn}>
            <Icon name="calendar-today" size={18} color={theme.colors.primary} />
            <Text style={styles.dateBtnText}>01 EKI</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Date Row */}
        <View style={styles.subheadRow}>
          <View style={styles.subheadLeft}>
            <Icon name="calendar-month" size={18} color={theme.colors.primary} />
            <Text style={styles.subheadLabel}>SEÇİLİ GÜN</Text>
          </View>
          <Text style={styles.subheadDateText}>{todayDate}</Text>
        </View>

        {/* Period Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {['bu-hafta', 'gecen-hafta', '2-hafta', '3-hafta'].map(period => (
            <TouchableOpacity 
              key={period} 
              style={[styles.periodChip, activePeriod === period && styles.periodChipActive]}
              onPress={() => setActivePeriod(period)}
            >
              <Text style={[styles.periodChipText, activePeriod === period && styles.periodChipTextActive]}>
                {period.replace('-', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Tabs */}
        <View style={styles.tabContainer}>
          {['giris', 'verimlilik', 'spor', 'hepsi'].map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.tabBtn, activeCategory === cat && styles.tabBtnActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.tabBtnText, activeCategory === cat && styles.tabBtnTextActive]}>
                {cat === 'hepsi' ? 'Tümü' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dynamic Sections */}
        {(activeCategory === 'hepsi' || activeCategory === 'giris') && renderEnerji()}
        {(activeCategory === 'hepsi' || activeCategory === 'verimlilik') && renderVerimlilik()}

        {/* PR Section */}
        {(activeCategory === 'hepsi' || activeCategory === 'spor') && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.pulseDot, { backgroundColor: theme.colors.secondary }]} />
                <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>Kişisel Rekorlar (PR)</Text>
              </View>
              <Text style={{ ...theme.typography.labelSm, color: theme.colors.secondary }}>Spor Merkezi</Text>
            </View>
            
            <View style={styles.prList}>
              {loading ? (
                 <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : prs.length === 0 ? (
                <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', padding: 12 }}>Henüz kaydedilmiş ağırlık rekoru yok.</Text>
              ) : (
                prs.map((pr, idx) => (
                  <View key={idx} style={styles.prItem}>
                    <View style={styles.prItemLeft}>
                      <View style={styles.prIconBox}><Icon name="fitness-center" size={20} color={theme.colors.primary} /></View>
                      <View>
                        <Text style={styles.prTitle}>{pr.exercise_name}</Text>
                      </View>
                    </View>
                    <View style={styles.prItemRight}>
                      <Text style={styles.prValue}>{pr.max_weight} <Text style={styles.prUnit}>kg</Text></Text>
                      <Text style={styles.prSubRight}>{pr.sets} x {pr.reps} Tekrar</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

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
  subheadDateText: { ...theme.typography.labelMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  
  chipRow: { gap: 8, paddingVertical: 4 },
  periodChip: { height: 36, paddingHorizontal: 16, borderRadius: 18, backgroundColor: theme.colors.surfaceContainerHigh, justifyContent: 'center', alignItems: 'center' },
  periodChipActive: { backgroundColor: theme.colors.primary },
  periodChipText: { ...theme.typography.labelMd, color: theme.colors.onSurfaceVariant },
  periodChipTextActive: { color: theme.colors.onPrimary, fontWeight: 'bold' },
  
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
  telemetryCard: { flex: 1, backgroundColor: theme.colors.cardBg, borderWidth: 1, borderColor: theme.colors.cardBorder, borderRadius: 12, padding: 12, justifyContent: 'space-between', minHeight: 110 },
  telemetryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  telemetryLabel: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  telemetryValue: { ...theme.typography.titleLg, color: theme.colors.onSurface, fontWeight: 'bold', marginTop: 4 },
  telemetryUnit: { ...theme.typography.labelMd, color: theme.colors.onSurfaceVariant, fontWeight: 'normal' },
  telemetryIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  telemetryBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(38, 40, 46, 0.5)', paddingTop: 8, marginTop: 12 },
  telemetryBottomLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  telemetrySubLabel: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  progressBarBg: { width: 48, height: 6, backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 3 },
  
  verimlilikCard: { flex: 1, backgroundColor: theme.colors.surfaceContainer, borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  verimlilikTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  verimlilikTitle: { ...theme.typography.titleMd, color: theme.colors.primary, fontSize: 14 },
  verimlilikIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  verimlilikContent: { backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: 8, padding: 16, alignItems: 'center' },
  verimlilikValue: { ...theme.typography.headlineLgMobile, color: theme.colors.primary },
  verimlilikUnit: { ...theme.typography.titleMd, fontWeight: '500' },
  verimlilikDesc: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' },
  
  card: { backgroundColor: theme.colors.cardBg, borderWidth: 1, borderColor: theme.colors.cardBorder, borderRadius: theme.rounded.md, padding: theme.spacing.md, gap: theme.spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { ...theme.typography.titleMd, color: theme.colors.onSurface },
  
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
