import { useState, useEffect, useCallback } from 'react';
import db from '../database/database';

export interface PRData {
  exercise_name: string;
  max_weight: number;
  reps: string;
  sets: number;
  month: string;
  date: string;
}

export interface BodyMeasurementData {
  date: string;
  weight: number;
  height: number;
}

export interface LibraryCategoryStat {
  category: string;
  count: number;
}

export const useStatistics = (date: string) => {
  const [loading, setLoading] = useState(true);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [calories, setCalories] = useState(0);
  const [stepAvg, setStepAvg] = useState(0);
  const [prs, setPrs] = useState<PRData[]>([]);
  const [libraryTotal, setLibraryTotal] = useState(0);
  const [libraryCategories, setLibraryCategories] = useState<LibraryCategoryStat[]>([]);
  const [noteDays, setNoteDays] = useState<number[]>([]);
  const [focusTimeStr, setFocusTimeStr] = useState('0 dakika');
  const [taskWeeks, setTaskWeeks] = useState<number[]>([0, 0, 0, 0]);
  const [bodyHistory, setBodyHistory] = useState<BodyMeasurementData[]>([]);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Tasks stat (Today)
      const tasksRes = await db.execute('SELECT is_completed FROM Tasks WHERE target_date = ?', [date]);
      const tasksRows = (tasksRes.rows as any[]) || [];
      const total = tasksRows.length;
      const completed = tasksRows.filter(t => t.is_completed === 1).length;
      setTasksTotal(total);
      setTasksCompleted(completed);

      // Weekly dates calculation (Monday to Sunday for selected week)
      const selDateObj = new Date(date);
      const dayOfWeek = selDateObj.getDay() || 7; // 1-7 (Mon-Sun)
      
      const mon = new Date(selDateObj);
      mon.setDate(selDateObj.getDate() - dayOfWeek + 1);
      const sun = new Date(selDateObj);
      sun.setDate(selDateObj.getDate() - dayOfWeek + 7);
      
      const monStr = mon.toISOString().split('T')[0];
      const sunStr = sun.toISOString().split('T')[0];

      // Focus Time (Mon-Sun total)
      const focusRes = await db.execute(`
        SELECT SUM(total_focus_seconds) as total_sec
        FROM FocusStats
        WHERE date BETWEEN ? AND ?
      `, [monStr, sunStr]);
      const focusTotalSec = focusRes.rows[0]?.total_sec || 0;
      const totalMin = Math.floor(focusTotalSec / 60);
      if (totalMin >= 60) {
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        setFocusTimeStr(`${h} saat${m > 0 ? ` ${m} dakika` : ''}`);
      } else {
        setFocusTimeStr(`${totalMin} dakika`);
      }

      // Tasks stat (4-week history)
      const w1Start = new Date(mon);
      w1Start.setDate(w1Start.getDate() - 21);
      const w1StartStr = w1Start.toISOString().split('T')[0];

      const allTasksRes = await db.execute(`
        SELECT target_date, is_completed
        FROM Tasks
        WHERE target_date BETWEEN ? AND ?
      `, [w1StartStr, sunStr]);
      
      const weeklyTasks = [ { c:0, t:0 }, { c:0, t:0 }, { c:0, t:0 }, { c:0, t:0 } ]; 
      (allTasksRes.rows as any[]).forEach(t => {
         const tDate = new Date(t.target_date).getTime();
         const diffDays = Math.floor((mon.getTime() - tDate) / (1000 * 60 * 60 * 24));
         let wIdx = 3; 
         if (diffDays > 0 && diffDays <= 7) wIdx = 2; 
         else if (diffDays > 7 && diffDays <= 14) wIdx = 1; 
         else if (diffDays > 14 && diffDays <= 21) wIdx = 0; 
         
         if (wIdx >= 0 && wIdx <= 3) {
           weeklyTasks[wIdx].t += 1;
           if (t.is_completed === 1) weeklyTasks[wIdx].c += 1;
         }
      });
      setTaskWeeks(weeklyTasks.map(w => w.t > 0 ? Math.round((w.c / w.t) * 100) : 0));

      // Calories stat (approximate from protein or other macro if we have it)
      const macrosRes = await db.execute('SELECT total_calories, total_protein FROM DailyMacros WHERE date = ?', [date]);
      const macrosRows = (macrosRes.rows as any[]) || [];
      let todayCal = 0;
      if (macrosRows.length > 0) {
        todayCal = macrosRows[0].total_calories || (macrosRows[0].total_protein * 4); // basic fallback
      }
      setCalories(todayCal);

      // Steps (7-day average up to the selected date)
      const stepsRes = await db.execute(`
        SELECT AVG(count) as avg_steps 
        FROM Steps 
        WHERE date BETWEEN date(?, '-6 days') AND ?
      `, [date, date]);
      const avgSteps = Math.round(stepsRes.rows[0]?.avg_steps || 0);
      setStepAvg(avgSteps);

      // PRs (Max Weight per exercise, per month of the selected date's year)
      const year = date.split('-')[0];
      const prsRes = await db.execute(`
        SELECT 
          we.exercise_name, 
          MAX(CAST(we.weight AS INTEGER)) as max_weight, 
          we.reps, 
          we.sets,
          w.date,
          strftime('%m', w.date) as month
        FROM WorkoutExercises we
        JOIN Workouts w ON we.workout_id = w.id
        WHERE we.weight != '' AND we.weight IS NOT NULL AND strftime('%Y', w.date) = ?
        GROUP BY we.exercise_name, month
        ORDER BY month DESC, max_weight DESC
      `, [year]);
      setPrs((prsRes.rows as any[]) || []);

      // Library Stats
      const libTotalRes = await db.execute('SELECT COUNT(*) as total FROM LibraryResources');
      const libTotal = libTotalRes.rows[0]?.total || 0;
      setLibraryTotal(libTotal);

      const libCatRes = await db.execute('SELECT category, COUNT(*) as count FROM LibraryResources WHERE category IS NOT NULL AND category != "" GROUP BY category ORDER BY count DESC');
      setLibraryCategories((libCatRes.rows as any[]) || []);

      // Monthly Notes
      const monthPrefix = date.substring(0, 7);
      const notesRes = await db.execute(`
        SELECT date FROM DailyNotes 
        WHERE date LIKE ? 
          AND content IS NOT NULL 
          AND content != ''
      `, [`${monthPrefix}-%`]);
      const activeDays = (notesRes.rows as any[]).map(r => parseInt(r.date.split('-')[2], 10));
      setNoteDays(activeDays);

      // Body Measurements History
      const bodyRes = await db.execute(`
        SELECT date, weight, height 
        FROM BodyMeasurements 
        ORDER BY date ASC
      `);
      setBodyHistory((bodyRes.rows as any[]) || []);

    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { loading, tasksCompleted, tasksTotal, calories, stepAvg, prs, libraryTotal, libraryCategories, noteDays, focusTimeStr, taskWeeks, bodyHistory, refresh: fetchStats };
};
