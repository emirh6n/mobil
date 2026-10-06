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
  body_fat: number | null;
}

export interface LibraryCategoryStat {
  category: string;
  count: number;
}

export const useStatistics = (date: string) => {
  const [loading, setLoading] = useState(true);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [tasksTotal, setTasksTotal] = useState(0);
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
      
      const selDateObj = new Date(date);
      const dayOfWeek = selDateObj.getDay() || 7;
      
      const mon = new Date(selDateObj);
      mon.setDate(selDateObj.getDate() - dayOfWeek + 1);
      const sun = new Date(selDateObj);
      sun.setDate(selDateObj.getDate() - dayOfWeek + 7);
      
      const monStr = mon.toISOString().split('T')[0];
      const sunStr = sun.toISOString().split('T')[0];

      const w1Start = new Date(mon);
      w1Start.setDate(w1Start.getDate() - 21);
      const w1StartStr = w1Start.toISOString().split('T')[0];
      const year = date.split('-')[0];
      const monthPrefix = date.substring(0, 7);

      const [
        tasksStat,
        focusTotalSec,
        weeklyTasks,
        avgSteps,
        fetchedPrs,
        libStats,
        activeDays,
        fetchedBodyHistory
      ] = await Promise.all([
        StatisticsRepository.getTasksStat(date),
        StatisticsRepository.getFocusTime(monStr, sunStr),
        StatisticsRepository.getWeeklyTasks(w1StartStr, sunStr, mon),
        StatisticsRepository.getStepAvg(date),
        StatisticsRepository.getPrs(year),
        StatisticsRepository.getLibraryStats(),
        StatisticsRepository.getNoteDays(monthPrefix),
        StatisticsRepository.getBodyHistory()
      ]);

      setTasksTotal(tasksStat.total);
      setTasksCompleted(tasksStat.completed);

      const totalMin = Math.floor(focusTotalSec / 60);
      if (totalMin >= 60) {
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        setFocusTimeStr(`${h} saat${m > 0 ? ` ${m} dakika` : ''}`);
      } else {
        setFocusTimeStr(`${totalMin} dakika`);
      }

      setTaskWeeks(weeklyTasks.map(w => w.t > 0 ? Math.round((w.c / w.t) * 100) : 0));
      setStepAvg(avgSteps);
      setPrs(fetchedPrs);
      setLibraryTotal(libStats.libTotal);
      setLibraryCategories(libStats.libraryCategories);
      setNoteDays(activeDays);
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

  return { loading, tasksCompleted, tasksTotal, stepAvg, prs, libraryTotal, libraryCategories, noteDays, focusTimeStr, taskWeeks, bodyHistory, refresh: fetchStats };
};
