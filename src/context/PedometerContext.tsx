import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, AppStateStatus, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import db from '../database/database';

let TrknPedometerModule: any;
try {
  TrknPedometerModule = require('../../modules/trkn-pedometer/src/TrknPedometerModule').default;
} catch(e) {
  console.warn("TrknPedometerModule not available");
}

import { Pedometer as ExpoPedometer } from 'expo-sensors';

interface PedometerContextProps {
  isEnabled: boolean;
  stepCount: number;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  syncSteps: () => Promise<void>;
}

const PedometerContext = createContext<PedometerContextProps>({
  isEnabled: false,
  stepCount: 0,
  enable: async () => {},
  disable: async () => {},
  syncSteps: async () => {},
});

export const usePedometerContext = () => useContext(PedometerContext);

export const PedometerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [stepCount, setStepCount] = useState(0);

  useEffect(() => {
    const init = async () => {
      const stored = await AsyncStorage.getItem('@pedometer_enabled');
      if (stored === 'true') {
        setIsEnabled(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    let sub: any = null;
    let interval: any = null;

    if (isEnabled) {
      if (Platform.OS === 'android' && TrknPedometerModule) {
        TrknPedometerModule.startTracking();
      }
      syncHistoricalSteps();

      sub = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          syncHistoricalSteps();
        }
      });
      
      interval = setInterval(() => {
        syncHistoricalSteps();
      }, 5000);
      
    } else {
      if (Platform.OS === 'android' && TrknPedometerModule) {
        TrknPedometerModule.stopTracking();
      }
    }

    return () => {
      if (sub) sub.remove();
      if (interval) clearInterval(interval);
    };
  }, [isEnabled]);

  const getTodayStringLocal = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const saveStepsToDb = async (totalSteps: number) => {
    const today = getTodayStringLocal();
    try {
      await db.execute(
        'INSERT INTO Steps (date, count, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(date) DO UPDATE SET count = excluded.count, updated_at = CURRENT_TIMESTAMP',
        [today, totalSteps]
      );
    } catch (e) {
      console.error("Adım kaydetme hatası", e);
    }
  };

  const syncHistoricalSteps = async () => {
    try {
      let steps = 0;
      if (Platform.OS === 'android' && TrknPedometerModule) {
         steps = await TrknPedometerModule.syncSteps();
      } else {
         const isAvailable = await ExpoPedometer.isAvailableAsync();
         if (!isAvailable) return 0;
         const end = new Date();
         const start = new Date();
         start.setHours(0, 0, 0, 0);
         const pastResult = await ExpoPedometer.getStepCountAsync(start, end);
         if (pastResult) steps = pastResult.steps;
      }
      
      setStepCount(steps);
      saveStepsToDb(steps);
      return steps;
    } catch (e) {
      console.warn("Geçmiş adımlar alınamadı:", e);
    }
    return 0;
  };

  const enable = async () => {
    return new Promise<void>((resolve) => {
      Alert.alert(
        'Adım Sayar İzni',
        'Bu uygulama, günlük kalori ve hareket hedeflerinizi hesaplamak için günlük fiziksel aktivitelerinize arka planda erişmek istiyor. Bu sayede uygulama kapalıyken bile adımlarınız sayılacaktır. Toplanan veriler sadece cihazınızda kalır.',
        [
          { text: 'Vazgeç', style: 'cancel', onPress: () => resolve() },
          {
            text: 'Onayla',
            onPress: async () => {
              try {
                const { status } = await ExpoPedometer.requestPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('İzin Reddedildi', 'Adım sayar verilerine erişim izni vermeniz gerekiyor.');
                  resolve();
                  return;
                }
                
                await AsyncStorage.setItem('@pedometer_enabled', 'true');
                setIsEnabled(true);
                
                Alert.alert(
                  'Arka Plan Uyarıları (Önemli)',
                  'Adım sayacının telefon kilitliyken veya uygulama kapalıyken bile düzgün çalışabilmesi için cihazınızın Pil Optimizasyon ayarlarından bu uygulamaya KISITLAMA OLMADIĞINA emin olun.'
                );
                
                resolve();
              } catch (e) {
                console.error('İzin istenirken hata oluştu:', e);
                Alert.alert('Hata', 'Adım sayar cihazınızda desteklenmiyor olabilir.');
                resolve();
              }
            }
          }
        ]
      );
    });
  };

  const disable = async () => {
    await AsyncStorage.setItem('@pedometer_enabled', 'false');
    setIsEnabled(false);
    setStepCount(0);
  };

  const syncSteps = async () => {
    if (isEnabled) {
      await syncHistoricalSteps();
    }
  };

  return (
    <PedometerContext.Provider value={{ isEnabled, stepCount, enable, disable, syncSteps }}>
      {children}
    </PedometerContext.Provider>
  );
};
