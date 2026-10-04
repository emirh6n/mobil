import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, FlatList, Alert } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { Header } from '../components/Header';
import { useWorkouts } from '../hooks/useWorkouts';
import { useNavigation } from '@react-navigation/native';
import { useDateContext } from '../context/DateContext';
import db from '../database/database';

const EXERCISE_DATA = {
  'Göğüs': ['Machine Pec Deck / Cable Fly', 'Dips', 'Bench Press (Incline, Seated)', 'Seated Chest Press'],
  'Sırt': ['Dumbbell Shrugs', 'Pull Up', 'Pull Down', 'Barbell Row / Machine Row'],
  'Omuz': ['Lateral Raise (Cable/Dumbbell)', 'Shoulder Press / Overhead', 'Reverse Fly Machine', 'Cable Face Pull'],
  'Kol': ['Dumbbell Wrist Curls / Extensions', 'Bayesian Cable Curl', 'Preacher Curl', '(Seated) Tricep Extension', 'Skull Crusher'],
  'Bacak & Kalça': ['Standing Calf Raise', 'Deadlift (+Romanian)', 'Seated Leg Curl / Extension', 'Squat (Barbell, Bulgarian)', 'Barbell Hip Thrust', 'Walking Lunge', 'Glute Bridge'],
  'Boyun': ['Neck Curls / Extensions'],
  'Karın': ['Cable Crunch']
};

export const SportsScreen = () => {
  const navigation = useNavigation();
  const { selectedDate } = useDateContext();
  const { workouts, loading, addWorkoutExercise, deleteWorkout } = useWorkouts(selectedDate);

  const [muscleGroup, setMuscleGroup] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  
  const [muscleModalVisible, setMuscleModalVisible] = useState(false);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  
  // Pedometer State
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [pastStepCount, setPastStepCount] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [isSyncEnabled, setIsSyncEnabled] = useState(false);
  const pedometerSub = React.useRef<any>(null);
  
  const currentExercises = muscleGroup && EXERCISE_DATA[muscleGroup as keyof typeof EXERCISE_DATA] ? EXERCISE_DATA[muscleGroup as keyof typeof EXERCISE_DATA] : [];
  
  // Cleanup for pedometer subscription
  React.useEffect(() => {
    return () => {
      if (pedometerSub.current) {
        pedometerSub.current.remove();
      }
    };
  }, []);

  // Save steps to DB
  React.useEffect(() => {
    const saveSteps = async () => {
      const totalSteps = pastStepCount + currentStepCount;
      if (totalSteps > 0 && selectedDate) {
        try {
          await db.execute(
            'INSERT INTO Steps (date, count, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(date) DO UPDATE SET count = excluded.count, updated_at = CURRENT_TIMESTAMP',
            [selectedDate, totalSteps]
          );
        } catch (e) {
          console.error("Adım kaydetme hatası", e);
        }
      }
    };
    
    // Yalnızca sync açıksa kaydet
    if (isSyncEnabled) {
      saveSteps();
    }
  }, [pastStepCount, currentStepCount, selectedDate, isSyncEnabled]);

  const enablePedometer = async () => {
    try {
      const { status } = await Pedometer.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Reddedildi', 'Adım sayar verilerine erişim izni vermeniz gerekiyor.');
        return;
      }

      const isAvailable = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(String(isAvailable));

      if (isAvailable) {
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        try {
          const pastResult = await Pedometer.getStepCountAsync(start, end);
          if (pastResult) {
            setPastStepCount(pastResult.steps);
          }
        } catch (stepErr) {
          console.warn("Geçmiş adımlar alınamadı:", stepErr);
        }

        pedometerSub.current = Pedometer.watchStepCount(result => {
          setCurrentStepCount(result.steps);
        });

        setIsSyncEnabled(true);
      } else {
        Alert.alert('Hata', 'Cihazınızda adım sayar sensörü bulunmuyor veya desteklenmiyor.');
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Hata', 'Adım sayar başlatılamadı: ' + (e.message || 'Bilinmeyen hata'));
    }
  };

  const calculatedCalories = React.useMemo(() => {
    const s = parseFloat(sets) || 0;
    const r = parseFloat(reps) || 0;
    const w = parseFloat(weight) || 0;
    if (s > 0 && r > 0) {
      return Math.max(1, Math.round((s * r * (w > 0 ? w * 0.04 : 1.2)) + (s * 3)));
    }
    return 0;
  }, [sets, reps, weight]);

  const totalCaloriesBurned = React.useMemo(() => {
    let total = 0;
    workouts.forEach(workout => {
      workout.exercises?.forEach(ex => {
        const s = ex.sets || 0;
        const r = parseFloat(ex.reps) || 0;
        const w = parseFloat(ex.weight) || 0;
        if (s > 0 && r > 0) {
          total += Math.max(1, Math.round((s * r * (w > 0 ? w * 0.04 : 1.2)) + (s * 3)));
        }
      });
    });
    return total;
  }, [workouts]);

  const { totalSets, muscleDistribution } = React.useMemo(() => {
    let tSets = 0;
    const distribution: Record<string, number> = {};

    workouts.forEach(workout => {
      const mg = workout.muscle_group || 'Diğer';
      if (!distribution[mg]) distribution[mg] = 0;
      
      workout.exercises?.forEach(ex => {
        const s = ex.sets || 0;
        distribution[mg] += s;
        tSets += s;
      });
    });

    return { totalSets: tSets, muscleDistribution: distribution };
  }, [workouts]);

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
      <Header subtitle="Spor Merkezi" hideBackButton />

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
            <TouchableOpacity style={styles.selectBox} onPress={() => setMuscleModalVisible(true)}>
              <Text style={[styles.selectText, !muscleGroup && { color: theme.colors.onSurfaceVariant }]}>
                {muscleGroup || 'Seçiniz'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Egzersiz</Text>
            <TouchableOpacity 
              style={styles.selectBox} 
              onPress={() => muscleGroup ? setExerciseModalVisible(true) : alert('Lütfen önce hedef kas grubu seçin.')}
            >
              <Text style={[styles.selectText, !exerciseName && { color: theme.colors.onSurfaceVariant }]}>
                {exerciseName || 'Seçiniz'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
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

        {/* Total Calories Card */}
        <View style={styles.totalCaloriesCard}>
          <View style={styles.totalCaloriesLeft}>
            <View style={styles.totalCaloriesIconWrapper}>
              <Icon name="whatshot" size={24} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.totalCaloriesTitle}>Toplam Yakılan</Text>
              <Text style={styles.totalCaloriesSub}>Bugünkü antrenmanlardan</Text>
            </View>
          </View>
          <View style={styles.totalCaloriesRight}>
            <Text style={styles.totalCaloriesValue}>{totalCaloriesBurned}</Text>
            <Text style={styles.totalCaloriesUnit}>kcal</Text>
          </View>
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

        {/* Regional Set Distribution Card */}
        {totalSets > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Icon name="pie-chart" size={20} color={theme.colors.primary} />
                <Text style={styles.cardTitle}>Bölgesel Set Dağılımı</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: theme.colors.surfaceContainerHigh }]}>
                <Text style={[styles.badgeText, { color: theme.colors.onSurfaceVariant }]}>Toplam {totalSets} Set</Text>
              </View>
            </View>
            
            <View style={{ gap: 12, marginTop: 8 }}>
              {Object.entries(muscleDistribution).sort((a, b) => b[1] - a[1]).map(([mg, count]) => {
                const percent = Math.round((count / totalSets) * 100);
                return (
                  <View key={mg}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ ...theme.typography.labelMd, color: theme.colors.onSurface }}>{mg}</Text>
                      <Text style={{ ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant }}>{count} set (%{percent})</Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: theme.colors.surfaceContainerHigh, borderRadius: 4, overflow: 'hidden' }}>
                      <View style={{ width: `${percent}%`, height: '100%', backgroundColor: theme.colors.primary, borderRadius: 4 }} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Pedometer Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Icon name="directions-run" size={20} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Günlük Aktivite</Text>
            </View>
            {isSyncEnabled && (
              <View style={[styles.badge, { backgroundColor: 'rgba(159, 253, 80, 0.15)' }]}>
                <Text style={styles.badgeText}>Senkronize Edildi</Text>
              </View>
            )}
          </View>

          {!isSyncEnabled ? (
            <View style={styles.pedometerPromo}>
              <View style={styles.pedometerPromoIcon}>
                <Icon name="sync" size={28} color={theme.colors.onSurfaceVariant} />
              </View>
              <Text style={styles.pedometerPromoText}>Adım, mesafe ve yakılan kalori verilerinizi takip etmek için cihazınızın adım sayar sensörüne erişim izni verin.</Text>
              <TouchableOpacity style={styles.syncBtn} onPress={enablePedometer}>
                <Icon name="check-circle" size={18} color={theme.colors.onPrimary} />
                <Text style={styles.syncBtnText}>Telefon Senkronizasyonunu Aç</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.compactPedometerContainer}>
              <View style={styles.compactPedometerItem}>
                <View style={[styles.compactIconWrapper, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                  <Icon name="do-not-step" size={20} color="#06b6d4" />
                </View>
                <View>
                  <Text style={styles.compactPedometerValue}>{pastStepCount + currentStepCount}</Text>
                  <Text style={styles.compactPedometerLabel}>Adım</Text>
                </View>
              </View>
              
              <View style={styles.compactDivider} />
              
              <View style={styles.compactPedometerItem}>
                <View style={[styles.compactIconWrapper, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                  <Icon name="map" size={20} color="#06b6d4" />
                </View>
                <View>
                  <Text style={styles.compactPedometerValue}>{((pastStepCount + currentStepCount) * 0.762 / 1000).toFixed(2)}</Text>
                  <Text style={styles.compactPedometerLabel}>km</Text>
                </View>
              </View>
              
              <View style={styles.compactDivider} />
              
              <View style={styles.compactPedometerItem}>
                <View style={[styles.compactIconWrapper, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                  <Icon name="local-fire-department" size={20} color="#06b6d4" />
                </View>
                <View>
                  <Text style={styles.compactPedometerValue}>{Math.round((pastStepCount + currentStepCount) * 0.04)}</Text>
                  <Text style={styles.compactPedometerLabel}>kcal</Text>
                </View>
              </View>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Muscle Group Modal */}
      <Modal visible={muscleModalVisible} transparent animationType="fade" onRequestClose={() => setMuscleModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kas Grubu Seçin</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {Object.keys(EXERCISE_DATA).map(mg => (
                <TouchableOpacity 
                  key={mg} 
                  style={styles.modalItem}
                  onPress={() => {
                    setMuscleGroup(mg);
                    setExerciseName(''); // Reset exercise when muscle changes
                    setMuscleModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, muscleGroup === mg && { color: theme.colors.primary, fontWeight: 'bold' }]}>{mg}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setMuscleModalVisible(false)}>
              <Text style={styles.modalCloseText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Exercise Modal */}
      <Modal visible={exerciseModalVisible} transparent animationType="fade" onRequestClose={() => setExerciseModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Egzersiz Seçin</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {currentExercises.map(ex => (
                <TouchableOpacity 
                  key={ex} 
                  style={styles.modalItem}
                  onPress={() => {
                    setExerciseName(ex);
                    setExerciseModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, exerciseName === ex && { color: theme.colors.primary, fontWeight: 'bold' }]}>{ex}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setExerciseModalVisible(false)}>
              <Text style={styles.modalCloseText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  
  scrollContent: { padding: theme.spacing.margin, paddingBottom: 24, gap: theme.spacing.md },
  
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
  
  totalCaloriesCard: { backgroundColor: theme.colors.surfaceContainerLow, borderRadius: theme.rounded.md, padding: theme.spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: theme.colors.surfaceBorder },
  totalCaloriesLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  totalCaloriesIconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(159, 253, 80, 0.1)', alignItems: 'center', justifyContent: 'center' },
  totalCaloriesTitle: { ...theme.typography.titleMd, color: theme.colors.onSurface },
  totalCaloriesSub: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant },
  totalCaloriesRight: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  totalCaloriesValue: { ...theme.typography.headlineMd, color: theme.colors.primary, fontWeight: 'bold' },
  totalCaloriesUnit: { ...theme.typography.labelMd, color: theme.colors.primary },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surfaceContainer, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, maxHeight: '80%' },
  modalTitle: { ...theme.typography.titleLg, color: theme.colors.onSurface, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  modalItemText: { ...theme.typography.bodyLg, color: theme.colors.onSurfaceVariant, textAlign: 'center' },
  modalCloseBtn: { marginTop: 16, paddingVertical: 14, backgroundColor: theme.colors.surfaceContainerHigh, borderRadius: 12, alignItems: 'center' },
  modalCloseText: { ...theme.typography.labelLg, color: theme.colors.onSurface, fontWeight: 'bold' },
  
  pedometerPromo: { alignItems: 'center', backgroundColor: theme.colors.surfaceContainerLowest, padding: 20, borderRadius: theme.rounded.md, gap: 12 },
  pedometerPromoIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  pedometerPromoText: { ...theme.typography.bodySm, color: theme.colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
  syncBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, gap: 8, marginTop: 4 },
  syncBtnText: { ...theme.typography.labelMd, color: theme.colors.onPrimary, fontWeight: 'bold' },
  
  compactPedometerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.surfaceContainerLowest, padding: 16, borderRadius: theme.rounded.md, borderWidth: 1, borderColor: theme.colors.surfaceBorder, marginTop: 4 },
  compactPedometerItem: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center' },
  compactIconWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(159, 253, 80, 0.1)', alignItems: 'center', justifyContent: 'center' },
  compactPedometerValue: { ...theme.typography.titleMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  compactPedometerLabel: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, marginTop: -2 },
  compactDivider: { width: 1, height: 32, backgroundColor: theme.colors.surfaceBorder },
});
