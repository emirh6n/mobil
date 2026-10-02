import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Vibration } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { theme } from '../theme/theme';
import { Icon } from './Icon';

interface ActiveAlarmModalProps {
  visible: boolean;
  alarm: any;
  onDismiss: () => void;
}

export const ActiveAlarmModal: React.FC<ActiveAlarmModalProps> = ({ visible, alarm, onDismiss }) => {
  const [selectedTask, setSelectedTask] = useState<'math' | 'shake' | 'memory' | null>(null);

  // Math State
  const [mathQuestions, setMathQuestions] = useState<any[]>([]);
  const [currentMathIndex, setCurrentMathIndex] = useState(0);
  const [mathInput, setMathInput] = useState('');
  const [mathError, setMathError] = useState(false);

  // Shake State
  const [shakeCount, setShakeCount] = useState(0);
  const [subscription, setSubscription] = useState<any>(null);

  // Memory State
  const [memorySequence, setMemorySequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [memoryError, setMemoryError] = useState(false);
  const [currentShownArrow, setCurrentShownArrow] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      // Loop vibration aggressively
      Vibration.vibrate([1000, 1000], true);
    } else {
      Vibration.cancel();
      resetState();
    }
    return () => {
      Vibration.cancel();
    };
  }, [visible]);

  const resetState = () => {
    setSelectedTask(null);
    setMathQuestions([]);
    setCurrentMathIndex(0);
    setMathInput('');
    setMathError(false);
    setShakeCount(0);
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
    setMemorySequence([]);
    setUserSequence([]);
    setIsShowingSequence(false);
    setMemoryError(false);
    setCurrentShownArrow(null);
  };

  const handleTaskSelect = (task: 'math' | 'shake' | 'memory') => {
    setSelectedTask(task);
    if (task === 'math') generateMath();
    else if (task === 'shake') startShakeListener();
    else if (task === 'memory') generateMemory();
  };

  const generateMath = () => {
    const q = [];
    for(let i=0; i<3; i++) {
      const a = Math.floor(Math.random() * 90) + 10;
      const b = Math.floor(Math.random() * 90) + 10;
      const isAdd = Math.random() > 0.5;
      q.push({
        text: `${a} ${isAdd ? '+' : '-'} ${b} = ?`,
        answer: isAdd ? a + b : a - b
      });
    }
    setMathQuestions(q);
    setCurrentMathIndex(0);
    setMathInput('');
    setMathError(false);
  };

  const checkMath = () => {
    const currentQ = mathQuestions[currentMathIndex];
    if (parseInt(mathInput) === currentQ.answer) {
      setMathError(false);
      setMathInput('');
      if (currentMathIndex === 2) {
        onDismiss(); // Success!
      } else {
        setCurrentMathIndex(prev => prev + 1);
      }
    } else {
      setMathError(true);
      setMathInput('');
      // Yenilemesini istemiş: "Yanlış cevapta kullanıcı uyarılsın ve soru yenilensin veya tekrar denesin"
      generateMath(); 
    }
  };

  const startShakeListener = () => {
    setShakeCount(0);
    Accelerometer.setUpdateInterval(200);
    let lastTime = 0;
    let localCount = 0;
    const sub = Accelerometer.addListener(data => {
      const { x, y, z } = data;
      const acceleration = Math.sqrt(x*x + y*y + z*z);
      if (acceleration > 2.2) {
        const now = Date.now();
        if (now - lastTime > 400) { // debounce
          lastTime = now;
          localCount++;
          setShakeCount(localCount);
          if (localCount >= 20) {
            sub.remove();
            setSubscription(null);
            onDismiss(); // Success!
          }
        }
      }
    });
    setSubscription(sub);
  };

  const generateMemory = async () => {
    setMemoryError(false);
    setUserSequence([]);
    const dirs = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const seq = [];
    for(let i=0; i<5; i++) {
      seq.push(dirs[Math.floor(Math.random() * 4)]);
    }
    setMemorySequence(seq);
    setIsShowingSequence(true);
    
    // Play sequence
    for(let i=0; i<seq.length; i++) {
      setCurrentShownArrow(seq[i]);
      await new Promise(r => setTimeout(r, 600));
      setCurrentShownArrow(null);
      await new Promise(r => setTimeout(r, 200));
    }
    setIsShowingSequence(false);
  };

  const handleArrowPress = (dir: string) => {
    if (isShowingSequence) return;
    const newSeq = [...userSequence, dir];
    setUserSequence(newSeq);
    
    // Check correctness so far
    const currentIndex = newSeq.length - 1;
    if (newSeq[currentIndex] !== memorySequence[currentIndex]) {
      setMemoryError(true);
      setTimeout(() => generateMemory(), 1000);
      return;
    }
    
    if (newSeq.length === memorySequence.length) {
      onDismiss(); // Success!
    }
  };

  const getArrowIcon = (dir: string) => {
    switch(dir) {
      case 'UP': return 'arrow-upward';
      case 'DOWN': return 'arrow-downward';
      case 'LEFT': return 'arrow-back';
      case 'RIGHT': return 'arrow-forward';
      default: return 'help';
    }
  };

  if (!visible) return null;
  const isHardMode = alarm?.is_hard_mode === 1 || alarm?.is_hard_mode === true;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={() => { /* Block back button */ }}>
      <View style={styles.container}>
        <View style={styles.alarmHeader}>
          <Icon name="alarm" size={48} color={isHardMode ? theme.colors.error : theme.colors.primary} />
          <Text style={styles.alarmTime}>{alarm?.time || '00:00'}</Text>
          <Text style={styles.alarmLabel}>{alarm?.label || 'Alarm'}</Text>
          
          {isHardMode ? (
            <>
              <Text style={styles.hardModeText}>Sert Mod Aktif!</Text>
              <Text style={styles.hardModeDesc}>Alarmı kapatmak için bir görev tamamlamalısın.</Text>
            </>
          ) : (
            <Text style={[styles.hardModeDesc, { marginTop: 16 }]}>Alarm çalıyor. Kapatmak için butona dokunun.</Text>
          )}
        </View>

        {!isHardMode ? (
          <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]} onPress={onDismiss}>
            <Text style={styles.submitBtnText}>Alarmı Kapat</Text>
          </TouchableOpacity>
        ) : !selectedTask ? (
          <View style={styles.taskSelector}>
            <TouchableOpacity style={styles.taskBtn} onPress={() => handleTaskSelect('math')}>
              <Icon name="calculate" size={24} color={theme.colors.primary} />
              <Text style={styles.taskBtnText}>Matematik</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.taskBtn} onPress={() => handleTaskSelect('shake')}>
              <Icon name="vibration" size={24} color={theme.colors.primary} />
              <Text style={styles.taskBtnText}>Sallama</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.taskBtn} onPress={() => handleTaskSelect('memory')}>
              <Icon name="grid-view" size={24} color={theme.colors.primary} />
              <Text style={styles.taskBtnText}>Hafıza Kartı</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.taskContainer}>
            {selectedTask === 'math' && (
              <View style={styles.mathBox}>
                <Text style={styles.taskTitle}>Soru {currentMathIndex + 1} / 3</Text>
                {mathError && <Text style={{ color: theme.colors.error, marginBottom: 8 }}>Yanlış cevap, sorular yenilendi!</Text>}
                <Text style={styles.mathQ}>{mathQuestions[currentMathIndex]?.text}</Text>
                <TextInput 
                  style={styles.mathInput}
                  keyboardType="number-pad"
                  value={mathInput}
                  onChangeText={setMathInput}
                  autoFocus
                />
                <TouchableOpacity style={styles.submitBtn} onPress={checkMath}>
                  <Text style={styles.submitBtnText}>Cevapla</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedTask === 'shake' && (
              <View style={styles.shakeBox}>
                <Text style={styles.taskTitle}>Telefonu Salla</Text>
                <Icon name="vibration" size={64} color={theme.colors.primary} />
                <Text style={styles.shakeCounter}>{shakeCount} / 20</Text>
                <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>Alarmı susturmak için 20 kere sallayın.</Text>
              </View>
            )}

            {selectedTask === 'memory' && (
              <View style={styles.memoryBox}>
                <Text style={styles.taskTitle}>Hafıza Kartı</Text>
                {memoryError && <Text style={{ color: theme.colors.error, marginBottom: 8 }}>Yanlış sıra, baştan başlıyor...</Text>}
                
                <View style={styles.displayArea}>
                  {isShowingSequence ? (
                    <View style={styles.arrowBox}>
                      {currentShownArrow ? <Icon name={getArrowIcon(currentShownArrow)} size={48} color={theme.colors.primary} /> : null}
                    </View>
                  ) : (
                    <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>Sırayı Girin: {userSequence.length} / {memorySequence.length}</Text>
                  )}
                </View>

                <View style={styles.padRow}>
                  <View style={{ width: 64 }} />
                  <TouchableOpacity disabled={isShowingSequence} style={styles.arrowBtn} onPress={() => handleArrowPress('UP')}>
                    <Icon name="arrow-upward" size={32} color={theme.colors.onSurface} />
                  </TouchableOpacity>
                  <View style={{ width: 64 }} />
                </View>
                <View style={styles.padRow}>
                  <TouchableOpacity disabled={isShowingSequence} style={styles.arrowBtn} onPress={() => handleArrowPress('LEFT')}>
                    <Icon name="arrow-back" size={32} color={theme.colors.onSurface} />
                  </TouchableOpacity>
                  <TouchableOpacity disabled={isShowingSequence} style={styles.arrowBtn} onPress={() => handleArrowPress('DOWN')}>
                    <Icon name="arrow-downward" size={32} color={theme.colors.onSurface} />
                  </TouchableOpacity>
                  <TouchableOpacity disabled={isShowingSequence} style={styles.arrowBtn} onPress={() => handleArrowPress('RIGHT')}>
                    <Icon name="arrow-forward" size={32} color={theme.colors.onSurface} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 24, justifyContent: 'center' },
  alarmHeader: { alignItems: 'center', marginBottom: 40 },
  alarmTime: { fontSize: 64, fontWeight: 'bold', color: theme.colors.onSurface, marginTop: 16 },
  alarmLabel: { fontSize: 24, color: theme.colors.onSurfaceVariant, marginTop: 8 },
  hardModeText: { fontSize: 18, color: theme.colors.error, fontWeight: 'bold', marginTop: 16 },
  hardModeDesc: { fontSize: 14, color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 },
  
  taskSelector: { gap: 16 },
  taskBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surfaceContainer, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.primary },
  taskBtnText: { fontSize: 18, color: theme.colors.onSurface, fontWeight: 'bold', marginLeft: 16 },
  
  taskContainer: { alignItems: 'center', justifyContent: 'center' },
  taskTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 24 },
  
  mathBox: { width: '100%', alignItems: 'center', backgroundColor: theme.colors.surfaceContainer, padding: 24, borderRadius: 16 },
  mathQ: { fontSize: 32, fontWeight: 'bold', color: theme.colors.onSurface, marginBottom: 24 },
  mathInput: { width: '100%', height: 60, backgroundColor: theme.colors.surfaceContainerLowest, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.primary, fontSize: 24, fontWeight: 'bold', color: theme.colors.onSurface, textAlign: 'center', marginBottom: 24 },
  submitBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  submitBtnText: { color: theme.colors.onPrimaryContainer, fontSize: 18, fontWeight: 'bold' },
  
  shakeBox: { width: '100%', alignItems: 'center', backgroundColor: theme.colors.surfaceContainer, padding: 32, borderRadius: 16 },
  shakeCounter: { fontSize: 48, fontWeight: 'bold', color: theme.colors.onSurface, marginTop: 24 },
  
  memoryBox: { width: '100%', alignItems: 'center', backgroundColor: theme.colors.surfaceContainer, padding: 24, borderRadius: 16 },
  displayArea: { height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  arrowBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(159, 253, 80, 0.2)', alignItems: 'center', justifyContent: 'center' },
  
  padRow: { flexDirection: 'row', gap: 12, marginBottom: 12, justifyContent: 'center' },
  arrowBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.surfaceContainerLowest, borderWidth: 1, borderColor: theme.colors.outlineVariant, alignItems: 'center', justifyContent: 'center' }
});
