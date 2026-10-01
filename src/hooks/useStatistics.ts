import { useState, useEffect, useCallback } from 'react';
import db from '../database/database';

export interface PRData {
  exercise_name: string;
  max_weight: number;
  reps: string;
  sets: number;
}

export const useStatistics = (date: string) => {
  const [loading, setLoading] = useState(true);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [calories, setCalories] = useState(0);
  const [prs, setPrs] = useState<PRData[]>([]);

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

      // PRs (Max Weight per exercise)
      const prsRes = await db.execute(`
        SELECT exercise_name, MAX(CAST(weight AS INTEGER)) as max_weight, reps, sets 
        FROM WorkoutExercises 
        WHERE weight != '' AND weight IS NOT NULL
        GROUP BY exercise_name
        ORDER BY max_weight DESC
        LIMIT 10
      `);
      setPrs((prsRes.rows as any[]) || []);

    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { loading, tasksCompleted, tasksTotal, calories, prs, refresh: fetchStats };
};
