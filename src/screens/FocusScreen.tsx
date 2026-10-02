import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { theme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useDateContext } from '../context/DateContext';
import { useFocus } from '../hooks/useFocus';

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const FocusScreen = () => {
  const { selectedDate } = useDateContext();
  const { totalFocusSeconds, addFocusTime } = useFocus(selectedDate);

  const [activeTab, setActiveTab] = useState<'stopwatch' | 'countdown'>('stopwatch');

  // Stopwatch state
  const [swIsRunning, setSwIsRunning] = useState(false);
  const [swSeconds, setSwSeconds] = useState(0);
  const swInterval = useRef<NodeJS.Timeout | null>(null);

  // Countdown state
  const [cdHours, setCdHours] = useState('');
  const [cdMinutes, setCdMinutes] = useState('25');
  const [cdIsRunning, setCdIsRunning] = useState(false);
  const [cdSeconds, setCdSeconds] = useState(0);
  const [cdIntended, setCdIntended] = useState(0);
  const cdInterval = useRef<NodeJS.Timeout | null>(null);

  const liveTotalFocus = totalFocusSeconds + swSeconds + (cdIntended > 0 ? cdIntended - cdSeconds : 0);

  // --- Stopwatch Logic ---
  const startStopwatch = () => {
    setSwIsRunning(true);
    swInterval.current = setInterval(() => {
      setSwSeconds(prev => prev + 1);
    }, 1000);
  };

  const pauseStopwatch = () => {
    setSwIsRunning(false);
    if (swInterval.current) clearInterval(swInterval.current);
  };

  const resetStopwatch = () => {
    pauseStopwatch();
    if (swSeconds > 0) addFocusTime(swSeconds);
    setSwSeconds(0);
  };

  // --- Countdown Logic ---
  const startCd = () => {
    let secs = cdSeconds;
    if (secs === 0 || cdIntended === 0 || secs === cdIntended) {
      const h = parseInt(cdHours, 10) || 0;
      const m = parseInt(cdMinutes, 10) || 0;
      secs = (h * 3600) + (m * 60);
      if (secs <= 0) return;
      setCdIntended(secs);
      setCdSeconds(secs);
    }
    
    setCdIsRunning(true);
    cdInterval.current = setInterval(() => {
      setCdSeconds(prev => {
        if (prev <= 1) {
          if (cdInterval.current) clearInterval(cdInterval.current);
          setCdIsRunning(false);
          addFocusTime(secs); // add the initial target since it completed
          setCdIntended(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseCd = () => {
    setCdIsRunning(false);
    if (cdInterval.current) clearInterval(cdInterval.current);
  };

  const resetCd = () => {
    pauseCd();
    const focused = cdIntended - cdSeconds;
    if (focused > 0) {
      addFocusTime(focused);
    }
    setCdSeconds(0);
    setCdIntended(0);
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (swInterval.current) clearInterval(swInterval.current);
      if (cdInterval.current) clearInterval(cdInterval.current);
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header subtitle="Odaklanma" />

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

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'stopwatch' && styles.tabBtnActive]}
            onPress={() => setActiveTab('stopwatch')}
          >
            <Icon name="timer" size={20} color={activeTab === 'stopwatch' ? theme.colors.primary : theme.colors.onSurfaceVariant} />
            <Text style={[styles.tabText, activeTab === 'stopwatch' && styles.tabTextActive]}>Kronometre</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'countdown' && styles.tabBtnActive]}
            onPress={() => setActiveTab('countdown')}
          >
            <Icon name="hourglass-empty" size={20} color={activeTab === 'countdown' ? theme.colors.primary : theme.colors.onSurfaceVariant} />
            <Text style={[styles.tabText, activeTab === 'countdown' && styles.tabTextActive]}>Geri Sayım</Text>
          </TouchableOpacity>
        </View>

        {/* Timer Card */}
        <View style={styles.timerCard}>
          {activeTab === 'stopwatch' ? (
            <View style={styles.timerContent}>
              <Text style={styles.timerDisplay}>{formatTime(swSeconds)}</Text>
              <Text style={styles.timerSubtitle}>Serbest çalışma süresi</Text>
              {!swIsRunning && swSeconds === 0 ? (
                <View style={styles.actionBtnWrapper}>
                  <TouchableOpacity style={[styles.actionBtn, styles.actionBtnStart]} onPress={startStopwatch}>
                    <Icon name="play-arrow" size={28} color={theme.colors.onPrimary} />
                    <Text style={styles.actionBtnText}>Başlat</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.timerControlsGroup}>
                  <View style={styles.timerControlRow}>
                    <TouchableOpacity 
                      style={[styles.controlBtnSmall, swIsRunning ? styles.actionBtnPause : styles.actionBtnStart]} 
                      onPress={swIsRunning ? pauseStopwatch : startStopwatch}
                    >
                      <Icon name={swIsRunning ? "pause" : "play-arrow"} size={28} color={swIsRunning ? theme.colors.onSurface : theme.colors.onPrimary} />
                      <Text style={swIsRunning ? styles.actionBtnTextDark : styles.actionBtnText}>{swIsRunning ? "Durdur" : "Devam Et"}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.controlBtnSmall, styles.actionBtnReset]} onPress={resetStopwatch}>
                      <Icon name="refresh" size={24} color={theme.colors.onSurface} />
                      <Text style={styles.actionBtnTextDark}>Sıfırla</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.timerContent}>
              {!cdIsRunning && cdIntended === 0 ? (
                <View style={styles.cdSetup}>
                  <Text style={styles.timerSubtitle}>Hedef Süre</Text>
                  
                  <View style={styles.timeInputRow}>
                    <View style={styles.timeInputGroup}>
                      <TextInput 
                        style={styles.cdInput} 
                        value={cdHours} 
                        onChangeText={setCdHours} 
                        keyboardType="numeric" 
                        maxLength={2}
                        placeholder="00"
                        placeholderTextColor={theme.colors.onSurfaceVariant + '80'}
                      />
                      <Text style={styles.timeInputLabel}>SAAT</Text>
                    </View>
                    
                    <Text style={styles.timeColon}>:</Text>
                    
                    <View style={styles.timeInputGroup}>
                      <TextInput 
                        style={styles.cdInput} 
                        value={cdMinutes} 
                        onChangeText={setCdMinutes} 
                        keyboardType="numeric" 
                        maxLength={2}
                        placeholder="00"
                        placeholderTextColor={theme.colors.onSurfaceVariant + '80'}
                      />
                      <Text style={styles.timeInputLabel}>DAKİKA</Text>
                    </View>
                  </View>

                  <View style={styles.actionBtnWrapper}>
                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnStart]} onPress={startCd}>
                      <Icon name="play-arrow" size={28} color={theme.colors.onPrimary} />
                      <Text style={styles.actionBtnText}>Başlat</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.timerContent}>
                  <Text style={styles.timerDisplay}>{formatTime(cdSeconds)}</Text>
                  <Text style={styles.timerSubtitle}>Hedefe kalan süre</Text>
                  
                  <View style={styles.timerControlsGroup}>
                    <View style={styles.timerControlRow}>
                      <TouchableOpacity 
                        style={[styles.controlBtnSmall, cdIsRunning ? styles.actionBtnPause : styles.actionBtnStart]} 
                        onPress={cdIsRunning ? pauseCd : startCd}
                      >
                        <Icon name={cdIsRunning ? "pause" : "play-arrow"} size={28} color={cdIsRunning ? theme.colors.onSurface : theme.colors.onPrimary} />
                        <Text style={cdIsRunning ? styles.actionBtnTextDark : styles.actionBtnText}>{cdIsRunning ? "Durdur" : "Devam Et"}</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity style={[styles.controlBtnSmall, styles.actionBtnReset]} onPress={resetCd}>
                        <Icon name="refresh" size={24} color={theme.colors.onSurface} />
                        <Text style={styles.actionBtnTextDark}>Sıfırla</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Total Focus Summary */}
        <View style={styles.summaryCard}>
          <Icon name="flare" size={20} color={theme.colors.primary} />
          <Text style={styles.summaryTitle}>Toplam Odaklanma:</Text>
          <Text style={styles.summaryValue}>{formatTime(liveTotalFocus)}</Text>
        </View>

        {/* Live Focus Ecosystem */}
        <View style={styles.ecoCard}>
          <View style={styles.ecoHeader}>
            <Icon name="psychology" size={20} color={theme.colors.primary} />
            <Text style={styles.ecoTitle}>Canlı Odak Ekosistemi</Text>
          </View>
          <View style={styles.ecoContent}>
            <View style={styles.ecoImagePlaceholder}>
              <Icon name="image" size={48} color={theme.colors.surfaceBorder} />
              <Text style={styles.ecoPlaceholderText}>
                {totalFocusSeconds === 0 
                  ? "Henüz odaklanmadınız. Ekosistem uyuyor." 
                  : `Ekosistem seviyesi (Süre: ${formatTime(totalFocusSeconds)})`}
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: theme.spacing.margin, paddingBottom: 120, gap: theme.spacing.md },
  
  subheadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  subheadLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subheadLabel: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, letterSpacing: 1 },
  subheadRight: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.surfaceContainerHigh, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },
  subheadDateText: { ...theme.typography.labelMd, color: theme.colors.onSurface },
  
  tabContainer: { flexDirection: 'row', backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: theme.rounded.full, padding: 4, borderWidth: 1, borderColor: theme.colors.surfaceBorder },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: theme.rounded.full, gap: 8 },
  tabBtnActive: { backgroundColor: theme.colors.surfaceContainerHigh },
  tabText: { ...theme.typography.labelMd, color: theme.colors.onSurfaceVariant },
  tabTextActive: { color: theme.colors.primary, fontWeight: 'bold' },
  
  timerCard: { backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: 24, padding: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.surfaceBorder, height: 320 },
  timerContent: { alignItems: 'center', width: '100%' },
  timerDisplay: { fontSize: 64, fontWeight: '200', color: theme.colors.onSurface, letterSpacing: 2, marginBottom: 8 },
  timerSubtitle: { ...theme.typography.bodyMd, color: theme.colors.onSurfaceVariant, marginBottom: 24 },
  
  cdSetup: { alignItems: 'center', width: '100%', height: '100%', justifyContent: 'space-between' },
  timeInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 },
  timeInputGroup: { alignItems: 'center', gap: 8 },
  cdInput: { fontSize: 56, fontWeight: '200', color: theme.colors.onSurface, borderBottomWidth: 2, borderBottomColor: theme.colors.primary, textAlign: 'center', width: 90, paddingBottom: 4 },
  timeInputLabel: { ...theme.typography.labelSm, color: theme.colors.onSurfaceVariant, letterSpacing: 1 },
  timeColon: { fontSize: 48, fontWeight: '200', color: theme.colors.onSurfaceVariant, paddingBottom: 24 },
  
  actionBtnWrapper: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 32, gap: 8, width: '100%' },
  actionBtnStart: { backgroundColor: theme.colors.primary },
  actionBtnPause: { backgroundColor: theme.colors.surfaceContainerHigh, borderWidth: 1, borderColor: theme.colors.surfaceBorder },
  actionBtnText: { ...theme.typography.titleMd, color: theme.colors.onPrimary, fontWeight: 'bold' },
  actionBtnTextDark: { ...theme.typography.titleMd, color: theme.colors.onSurface, fontWeight: 'bold' },
  
  timerControlsGroup: { width: '100%' },
  timerControlRow: { flexDirection: 'row', gap: 12, width: '100%' },
  controlBtnSmall: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 24, gap: 6 },
  actionBtnReset: { backgroundColor: theme.colors.surfaceContainerHighest },
  actionBtnSave: { backgroundColor: theme.colors.primary },
  
  summaryCard: { backgroundColor: theme.colors.surfaceContainerLow, borderRadius: theme.rounded.full, paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: theme.colors.surfaceBorder },
  summaryTitle: { ...theme.typography.labelLg, color: theme.colors.onSurfaceVariant },
  summaryValue: { ...theme.typography.titleMd, color: theme.colors.primary, fontWeight: 'bold' },
  
  ecoCard: { backgroundColor: theme.colors.cardBg, borderRadius: theme.rounded.md, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.cardBorder },
  ecoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  ecoTitle: { ...theme.typography.titleMd, color: theme.colors.onSurface },
  ecoContent: { width: '100%', height: 200, backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: 16, overflow: 'hidden' },
  ecoImagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 12 },
  ecoPlaceholderText: { ...theme.typography.bodySm, color: theme.colors.onSurfaceVariant, textAlign: 'center' },
});
