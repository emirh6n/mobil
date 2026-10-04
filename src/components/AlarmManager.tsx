import React, { useEffect, useState, useRef } from 'react';
import { View } from 'react-native';
import { ActiveAlarmModal } from './ActiveAlarmModal';
import db from '../database/database';

export const AlarmManager = () => {
  const [activeAlarm, setActiveAlarm] = useState<any>(null);
  const rungAlarmsRef = useRef<Record<number, string>>({});

  useEffect(() => {
    const checkAlarms = async () => {
      // 1. Check Native Hard Mode Alarm First
      try {
        const { default: ExpoAlarmModule } = await import('../../modules/expo-alarm-module/src/ExpoAlarmModule');
        const activeId = ExpoAlarmModule.getActiveAlarmId();
        
        // Also check if boot flag needs to clear active session
        const booted = ExpoAlarmModule.checkAndClearBootFlag();
        if (booted) {
          // Device booted, we should clear the JS active alarm state if it's lingering
          if (activeAlarm?.is_hard_mode) {
             setActiveAlarm(null);
             return;
          }
        }

        if (activeId !== -1 && !activeAlarm) {
          // Find alarm in DB
          const result = await db.execute('SELECT * FROM Reminders WHERE id = ?', [activeId]);
          if (result.rows && result.rows.length > 0) {
            setActiveAlarm({
              ...result.rows[0],
              is_hard_mode: Boolean(result.rows[0].is_hard_mode),
              is_active: Boolean(result.rows[0].is_active)
            });
            return;
          }
        }
      } catch (e) {
        // Native module might not be available
      }

      if (activeAlarm) return;

      // 2. Fallback to normal JS time check for normal alarms
      try {
        const result = await db.execute('SELECT * FROM Reminders WHERE is_active = 1');
        const activeAlarms = result.rows || [];

        const now = new Date();
        const hh = now.getHours().toString().padStart(2, '0');
        const mm = now.getMinutes().toString().padStart(2, '0');
        const currentTimeStr = `${hh}:${mm}`;
        
        const yyyy = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const dd = now.getDate().toString().padStart(2, '0');
        const todayStr = `${yyyy}-${month}-${dd}`;
        
        const todayDayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0=Mon, 6=Sun
        
        for (const alarm of activeAlarms) {
          if (alarm.time === currentTimeStr) {
            let shouldRing = false;
            try {
              const parsedDays = JSON.parse(alarm.days || '[]');
              if (parsedDays.length === 1 && parsedDays[0] === 'all') {
                shouldRing = true;
              } else if (parsedDays.length === 1 && typeof parsedDays[0] === 'string' && parsedDays[0].includes('-')) {
                if (parsedDays[0] === todayStr) shouldRing = true;
              } else if (Array.isArray(parsedDays) && parsedDays.includes(todayDayOfWeek)) {
                shouldRing = true;
              }
            } catch (e) {
              shouldRing = true;
            }

            if (shouldRing) {
              const lastRungDate = rungAlarmsRef.current[alarm.id];
              if (lastRungDate !== todayStr) {
                rungAlarmsRef.current[alarm.id] = todayStr;
                setActiveAlarm({
                  ...alarm,
                  is_hard_mode: Boolean(alarm.is_hard_mode),
                  is_active: Boolean(alarm.is_active)
                });
                break;
              }
            }
          }
        }
      } catch (error) {
        console.error('Alarm check error:', error);
      }
    };

    const interval = setInterval(checkAlarms, 2000);
    return () => clearInterval(interval);
  }, [activeAlarm]);

  const handleDismiss = async () => {
    try {
      const { default: ExpoAlarmModule } = await import('../../modules/expo-alarm-module/src/ExpoAlarmModule');
      ExpoAlarmModule.stopAlarm();
    } catch (e) {}
    setActiveAlarm(null);
  };

  return (
    <View style={{ position: 'absolute' }}>
      <ActiveAlarmModal visible={!!activeAlarm} alarm={activeAlarm} onDismiss={handleDismiss} />
    </View>
  );
};
