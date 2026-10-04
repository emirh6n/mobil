import ExpoAlarmModule from '../../modules/expo-alarm-module/src/ExpoAlarmModule';

export const syncAlarmsToNative = (reminders: any[]) => {
  if (!ExpoAlarmModule) return;

  const now = new Date();
  const currentDayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0=Mon, 6=Sun
  const yyyy = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  const todayStr = `${yyyy}-${month}-${dd}`;

  for (const reminder of reminders) {
    // Always cancel existing before re-scheduling to avoid duplicates
    ExpoAlarmModule.cancelAlarm(reminder.id);

    if (reminder.is_active) {
      const [hh, mm] = reminder.time.split(':').map(Number);
      
      let nextDate = new Date();
      nextDate.setHours(hh, mm, 0, 0);

      // If time has passed today, assume it might ring tomorrow or another day
      let daysOffset = 0;
      if (nextDate.getTime() <= now.getTime()) {
        daysOffset = 1;
      }

      try {
        const parsedDays = JSON.parse(reminder.days || '[]');
        
        if (parsedDays.length === 1 && parsedDays[0] === 'all') {
          // Everyday: rings today if time > now, else tomorrow
        } else if (parsedDays.length === 1 && typeof parsedDays[0] === 'string' && parsedDays[0].includes('-')) {
          // Specific date (e.g. YYYY-MM-DD)
          const [y, m, d] = parsedDays[0].split('-').map(Number);
          nextDate = new Date(y, m - 1, d, hh, mm, 0, 0);
          if (nextDate.getTime() <= now.getTime()) {
            continue; // Already passed, don't schedule
          }
          daysOffset = 0;
        } else if (Array.isArray(parsedDays) && parsedDays.length > 0) {
          // Weekly schedule
          // Find the next day in the array
          let found = false;
          for (let i = 0; i < 7; i++) {
            const checkDay = (currentDayOfWeek + (daysOffset > 0 ? 1 : 0) + i) % 7;
            if (parsedDays.includes(checkDay)) {
               // We need to advance nextDate by (daysOffset + i) days
               daysOffset = (daysOffset > 0 ? 1 : 0) + i;
               found = true;
               break;
            }
          }
          if (!found) continue;
        } else {
          // No days? Default to ring once next possible time
        }
      } catch (e) {
        // Assume default next possible time
      }

      if (daysOffset > 0) {
        nextDate.setDate(nextDate.getDate() + daysOffset);
      }

      // Schedule it
      ExpoAlarmModule.scheduleAlarm(reminder.id, nextDate.getTime(), Boolean(reminder.is_hard_mode));
    }
  }
};
