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

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Tasks stat
      const tasksRes = await db.execute('SELECT is_completed FROM Tasks WHERE target_date = ?', [date]);
      const tasksRows = (tasksRes.rows as any[]) || [];
      const total = tasksRows.length;
      const completed = tasksRows.filter(t => t.is_completed === 1).length;
      setTasksTotal(total);
      setTasksCompleted(completed);

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

    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { loading, tasksCompleted, tasksTotal, calories, stepAvg, prs, libraryTotal, libraryCategories, refresh: fetchStats };
};
