import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { Header } from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { useNutrition } from '../hooks/useNutrition';
import { useDateContext } from '../context/DateContext';

export const NutritionScreen = () => {
  const navigation = useNavigation();
  const { selectedDate } = useDateContext();
  const { protein, setProtein, routine, loading, saveProtein, addRoutineItem, toggleCheck, removeItem } = useNutrition(selectedDate);

  const [vitamin, setVitamin] = useState('');
  const [supplement, setSupplement] = useState('');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header subtitle="Besin" hideBackButton />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Date Selector */}
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

        {/* Card 1: Bugünün Rutini */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Icon name="track-changes" size={22} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Bugünün Rutini</Text>
            </View>
            <Icon name="fitness-center" size={20} color={theme.colors.onSurfaceVariant} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Günlük Protein (g)</Text>
            <View style={styles.proteinRow}>
              <View style={styles.proteinInputWrapper}>
                <TextInput 
                  style={styles.proteinInput} 
                  keyboardType="numeric" 
                  value={protein} 
                  onChangeText={setProtein} 
                />
                <Text style={styles.proteinUnit}>Gram</Text>
              </View>
              <TouchableOpacity style={styles.saveBtn} onPress={() => saveProtein(protein)} disabled={loading}>
                <Icon name="check" size={20} color={theme.colors.onPrimary} />
                <Text style={styles.saveBtnText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.routineListContainer}>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : routine.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Icon name="format-list-bulleted" size={30} color={theme.colors.onSurfaceVariant} />
                </View>
                <Text style={styles.emptyStateTitle}>Rutin Boş</Text>
                <Text style={styles.emptyStateDesc}>Aşağıdan vitamin veya supplement ekleyin.</Text>
              </View>
            ) : (
              <View style={styles.list}>
                {routine.map(item => (
                  <View key={item.id} style={styles.listItem}>
                    <View style={styles.listItemLeft}>
                      <View style={styles.listItemIconWrapper}>
                        <Icon name={item.icon as any} size={20} color={theme.colors.primary} />
                      </View>
                      <View style={styles.listItemTextContent}>
                        <Text style={[styles.listItemTitle, item.checked && styles.listItemTitleChecked]} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.listItemSub}>{item.category}</Text>
                      </View>
                    </View>
                    <View style={styles.listItemRight}>
                      <TouchableOpacity onPress={() => toggleCheck(item.id, item.checked)} style={styles.iconBtn}>
                        <Icon name={item.checked ? "check-circle" : "radio-button-unchecked"} size={22} color={item.checked ? theme.colors.primary : theme.colors.onSurfaceVariant} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.iconBtn}>
                        <Icon name="close" size={22} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Card 2: Vitamin Ekle */}
        <View style={styles.card}>
          <View style={styles.cardHeaderLeft}>
            <Icon name="medication" size={20} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Vitamin Ekle</Text>
          </View>
          <View style={styles.proteinRow}>
            <View style={[styles.proteinInputWrapper, { paddingHorizontal: 12 }]}>
              <Icon name="medical-services" size={20} color={theme.colors.onSurfaceVariant} />
              <TextInput 
                style={[styles.proteinInput, { flex: 1, textAlign: 'left', marginLeft: 8 }]} 
                placeholder="Örn. D Vitamini"
                placeholderTextColor={theme.colors.onSurfaceVariant + '80'}
                value={vitamin} 
                onChangeText={setVitamin} 
              />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={() => { addRoutineItem(vitamin, 'Vitamin & Mineral', 'medical-services'); setVitamin(''); }}>
              <Icon name="add" size={20} color={theme.colors.onPrimary} />
              <Text style={styles.saveBtnText}>Ekle</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <TouchableOpacity style={styles.chip} onPress={() => addRoutineItem('Omega-3', 'Vitamin & Mineral', 'medical-services')}><Text style={styles.chipText}>+ Omega-3</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => addRoutineItem('B12 Kompleks', 'Vitamin & Mineral', 'medical-services')}><Text style={styles.chipText}>+ B12 Kompleks</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => addRoutineItem('Magnezyum', 'Vitamin & Mineral', 'medical-services')}><Text style={styles.chipText}>+ Magnezyum</Text></TouchableOpacity>
          </ScrollView>
        </View>

        {/* Card 3: Supplement Ekle */}
        <View style={styles.card}>
          <View style={styles.cardHeaderLeft}>
            <Icon name="science" size={20} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Supplement Ekle</Text>
          </View>
          <View style={styles.proteinRow}>
            <View style={[styles.proteinInputWrapper, { paddingHorizontal: 12 }]}>
              <Icon name="science" size={20} color={theme.colors.onSurfaceVariant} />
              <TextInput 
                style={[styles.proteinInput, { flex: 1, textAlign: 'left', marginLeft: 8 }]} 
                placeholder="Örn. Kreatin"
                placeholderTextColor={theme.colors.onSurfaceVariant + '80'}
                value={supplement} 
                onChangeText={setSupplement} 
              />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={() => { addRoutineItem(supplement, 'Supplement', 'science'); setSupplement(''); }}>
              <Icon name="add" size={20} color={theme.colors.onPrimary} />
              <Text style={styles.saveBtnText}>Ekle</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <TouchableOpacity style={styles.chip} onPress={() => addRoutineItem('Whey Protein', 'Supplement', 'science')}><Text style={styles.chipText}>+ Whey Protein</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => addRoutineItem('Kreatin Monohidrat', 'Supplement', 'science')}><Text style={styles.chipText}>+ Kreatin Monohidrat</Text></TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => addRoutineItem('Pre-Workout', 'Supplement', 'science')}><Text style={styles.chipText}>+ Pre-Workout</Text></TouchableOpacity>
          </ScrollView>
        </View>

        {/* Insight Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Icon name="lightbulb" size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Hidrasyon ve Emilim</Text>
            <Text style={styles.bannerDesc}>Kreatin ve vitamin alımlarınızı günlük en az 2.5L su ile destekleyiniz.</Text>
          </View>
        </View>

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
  iconBox: {
    width: 48, height: 48, borderRadius: theme.rounded.default,
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
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
  
  scrollContent: { padding: theme.spacing.margin, paddingBottom: 120, gap: theme.spacing.md },
  
  subheadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  subheadLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subheadLabel: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, letterSpacing: 1 },
  subheadRight: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.surfaceContainerHigh, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },
  subheadDateText: { ...theme.typography.labelMd, color: theme.colors.onSurface },
  
  card: { backgroundColor: theme.colors.surfaceContainerLow, borderWidth: 1, borderColor: theme.colors.cardBorder, borderRadius: theme.rounded.md, padding: theme.spacing.md, gap: theme.spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { ...theme.typography.titleLg, color: theme.colors.primary, fontWeight: 'bold' },
  
  formGroup: { gap: 6 },
  inputLabel: { ...theme.typography.labelMd, color: theme.colors.onSurfaceVariant },
  proteinRow: { flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  proteinInputWrapper: { flex: 1, backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: theme.rounded.default, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  proteinInput: { ...theme.typography.titleLg, color: theme.colors.onSurface, fontWeight: 'bold' },
  proteinUnit: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, marginLeft: 4, textTransform: 'uppercase' },
  saveBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, height: 48, borderRadius: theme.rounded.default, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  saveBtnText: { ...theme.typography.labelLg, color: theme.colors.onPrimary },
  
  routineListContainer: { marginTop: 4 },
  emptyState: { backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: theme.rounded.md, padding: theme.spacing.xl, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyStateIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  emptyStateTitle: { ...theme.typography.titleMd, color: theme.colors.onSurface },
  emptyStateDesc: { ...theme.typography.bodySm, color: theme.colors.onSurfaceVariant, textAlign: 'center' },
  
  list: { gap: 8 },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: theme.rounded.default },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  listItemIconWrapper: { width: 36, height: 36, borderRadius: 8, backgroundColor: theme.colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  listItemTextContent: { flex: 1 },
  listItemTitle: { ...theme.typography.labelLg, color: theme.colors.onSurface },
  listItemTitleChecked: { textDecorationLine: 'line-through', opacity: 0.5 },
  listItemSub: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  listItemRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  
  chipRow: { gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: theme.colors.surfaceContainerHigh },
  chipText: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.colors.surfaceContainerLow, borderWidth: 1, borderColor: theme.colors.cardBorder, borderRadius: theme.rounded.md, padding: theme.spacing.md },
  bannerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  bannerTextContainer: { flex: 1 },
  bannerTitle: { ...theme.typography.labelMd, color: theme.colors.onSurface },
  bannerDesc: { ...theme.typography.bodySm, color: theme.colors.onSurfaceVariant },
});
