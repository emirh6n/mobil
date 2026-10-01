import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useWorkouts } from '../hooks/useWorkouts';
import { useNavigation } from '@react-navigation/native';

export const SportsScreen = () => {
  const navigation = useNavigation();
  const todayDate = new Date().toISOString().split('T')[0];
  const { workouts, loading, addWorkoutExercise, deleteWorkout } = useWorkouts(todayDate);

  const [muscleGroup, setMuscleGroup] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  
  const calculatedCalories = React.useMemo(() => {
    const s = parseFloat(sets) || 0;
    const r = parseFloat(reps) || 0;
    const w = parseFloat(weight) || 0;
    if (s > 0 && r > 0) {
      return Math.max(1, Math.round((s * r * (w > 0 ? w * 0.04 : 1.2)) + (s * 3)));
    }
    return 0;
  }, [sets, reps, weight]);

  const handleSubmit = () => {
    if (!muscleGroup.trim() || !exerciseName.trim() || !sets.trim() || !reps.trim()) return;
    addWorkoutExercise(muscleGroup, exerciseName, parseInt(sets, 10) || 0, reps, weight);
    setExerciseName('');
    setSets('');
    setReps('');
    setWeight('');
  };

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
            <Text style={styles.headerSubtitle}>Spor Merkezi</Text>
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
        {/* Date Selector */}
        <View style={styles.subheadRow}>
          <View style={styles.subheadLeft}>
            <Icon name="calendar-month" size={18} color={theme.colors.primary} />
            <Text style={styles.subheadLabel}>SEÇİLİ GÜN</Text>
          </View>
          <View style={styles.subheadRight}>
            <View style={styles.pulseDot} />
            <Text style={styles.subheadDateText}>{todayDate}</Text>
          </View>
        </View>

        {/* Workout Form Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Icon name="fitness-center" size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Ağırlık & Makine</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Kuvvet Antrenmanı</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Hedef kas grubu</Text>
            <View style={styles.selectBox}>
              <TextInput style={styles.selectText} placeholder="Örn: Göğüs, Sırt" placeholderTextColor={theme.colors.onSurfaceVariant} value={muscleGroup} onChangeText={setMuscleGroup} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Egzersiz</Text>
            <View style={styles.selectBox}>
              <TextInput style={styles.selectText} placeholder="Örn: Bench Press" placeholderTextColor={theme.colors.onSurfaceVariant} value={exerciseName} onChangeText={setExerciseName} />
            </View>
          </View>

          <View style={styles.telemetryMatrix}>
            <View style={styles.telemetryCol}>
              <Text style={styles.telemetryLabel}>Set</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.numericInput} 
                  placeholder="." 
                  placeholderTextColor={theme.colors.onSurfaceVariant + '80'}
                  keyboardType="numeric"
                  value={sets}
                  onChangeText={setSets}
                />
              </View>
            </View>
            <View style={styles.telemetryCol}>
              <Text style={styles.telemetryLabel}>Tekrar</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.numericInput} 
                  placeholder="." 
                  placeholderTextColor={theme.colors.onSurfaceVariant + '80'}
                  keyboardType="numeric"
                  value={reps}
                  onChangeText={setReps}
                />
              </View>
            </View>
            <View style={styles.telemetryCol}>
              <Text style={styles.telemetryLabel}>Ağırlık (kg)</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.numericInput} 
                  placeholder="." 
                  placeholderTextColor={theme.colors.onSurfaceVariant + '80'}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>
          </View>

          <View style={styles.calorieWell}>
            <View style={styles.calorieWellLeft}>
              <Icon name="local-fire-department" size={20} color={theme.colors.primary} />
              <Text style={styles.calorieWellText}>Tahmini kalori</Text>
            </View>
            <View style={styles.calorieWellRight}>
              <Text style={styles.calorieValue}>{calculatedCalories}</Text>
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            <Icon name="bolt" size={22} color={theme.colors.onPrimary} />
            <Text style={styles.submitBtnText}>Sisteme işle ve kaloriye ekle</Text>
          </TouchableOpacity>
        </View>

        {/* History Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Icon name="history" size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Bugünün Antrenmanları</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
              <Text style={[styles.badgeText, { color: theme.colors.onSurfaceVariant }]}>{workouts.length} Kayıt</Text>
            </View>
          </View>
          
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : workouts.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Icon name="sports-gymnastics" size={24} color={theme.colors.onSurfaceVariant} />
              </View>
              <Text style={styles.emptyStateTitle}>Bugün henüz antrenman kaydı yok.</Text>
              <Text style={styles.emptyStateDesc}>Yukarıdaki formu kullanarak ilk setinizi kaydedin.</Text>
            </View>
          ) : (
            workouts.map(workout => (
              <View key={workout.id} style={{ backgroundColor: theme.colors.surfaceContainerLowest, padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.surfaceBorder }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ ...theme.typography.labelMd, color: theme.colors.primary, fontWeight: 'bold' }}>{workout.name}</Text>
                  <TouchableOpacity onPress={() => deleteWorkout(workout.id)}>
                    <Icon name="delete" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
                {workout.exercises && workout.exercises.map(ex => (
                  <View key={ex.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, color: theme.colors.onSurface }}>{ex.exercise_name}</Text>
                    <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>{ex.sets} set, {ex.reps} tekrar {ex.weight ? `(${ex.weight} kg)` : ''}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
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
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5,
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
  
  card: { backgroundColor: theme.colors.cardBg, borderWidth: 1, borderColor: theme.colors.cardBorder, borderRadius: theme.rounded.md, padding: theme.spacing.md, gap: theme.spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 4 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { ...theme.typography.titleMd, color: theme.colors.onSurface },
  badge: { backgroundColor: 'rgba(159, 253, 80, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { ...theme.typography.labelSm, color: theme.colors.primary },
  
  formGroup: { gap: 4 },
  inputLabel: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  selectBox: {
    backgroundColor: theme.colors.surfaceContainerLowest, height: 48, borderRadius: theme.rounded.default,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12,
  },
  selectText: { ...theme.typography.bodyMd, color: theme.colors.onSurface },
  
  telemetryMatrix: { flexDirection: 'row', gap: 8, paddingTop: 4 },
  telemetryCol: { flex: 1, gap: 4 },
  telemetryLabel: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, textAlign: 'center' },
  inputWrapper: { backgroundColor: theme.colors.surfaceContainerLowest, height: 48, borderRadius: theme.rounded.default, justifyContent: 'center' },
  numericInput: { ...theme.typography.titleLg, color: theme.colors.primary, textAlign: 'center', width: '100%', height: '100%' },
  
  calorieWell: { backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: theme.rounded.default, padding: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  calorieWellLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  calorieWellText: { ...theme.typography.bodySm, color: theme.colors.onSurfaceVariant, fontWeight: '500' },
  calorieWellRight: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  calorieValue: { ...theme.typography.titleLg, color: theme.colors.primary },
  calorieUnit: { ...theme.typography.labelSm, color: theme.colors.primary },
  
  submitBtn: { width: '100%', height: 56, backgroundColor: theme.colors.primary, borderRadius: theme.rounded.default, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnText: { ...theme.typography.labelLg, color: theme.colors.onPrimary },
  
  emptyState: { backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: theme.rounded.default, padding: theme.spacing.lg, alignItems: 'center', justifyContent: 'center', gap: 6 },
  emptyStateIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyStateTitle: { ...theme.typography.bodyMd, color: theme.colors.onSurface, fontWeight: '500' },
  emptyStateDesc: { ...theme.typography.bodySm, color: theme.colors.onSurfaceVariant },
});
