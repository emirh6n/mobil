import { useState, useEffect, useCallback } from 'react';
import { StatisticsRepository } from '../repositories/StatisticsRepository';

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
      const tasksStat = await StatisticsRepository.getTasksStat(date);
      setTasksTotal(tasksStat.total);
      setTasksCompleted(tasksStat.completed);

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
      const focusTotalSec = await StatisticsRepository.getFocusTime(monStr, sunStr);
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

      const weeklyTasks = await StatisticsRepository.getWeeklyTasks(w1StartStr, sunStr, mon);
      setTaskWeeks(weeklyTasks.map(w => w.t > 0 ? Math.round((w.c / w.t) * 100) : 0));

      // Calories stat
      const todayCal = await StatisticsRepository.getCalories(date);
      setCalories(todayCal);

      // Steps
      const avgSteps = await StatisticsRepository.getStepAvg(date);
      setStepAvg(avgSteps);

      // PRs
      const year = date.split('-')[0];
      const fetchedPrs = await StatisticsRepository.getPrs(year);
      setPrs(fetchedPrs);

      // Library Stats
      const libStats = await StatisticsRepository.getLibraryStats();
      setLibraryTotal(libStats.libTotal);
      setLibraryCategories(libStats.libraryCategories);

      // Monthly Notes
      const monthPrefix = date.substring(0, 7);
      const activeDays = await StatisticsRepository.getNoteDays(monthPrefix);
      setNoteDays(activeDays);

      // Body Measurements History
      const fetchedBodyHistory = await StatisticsRepository.getBodyHistory();
      setBodyHistory(fetchedBodyHistory);

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
