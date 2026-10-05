import db from '../database/database';
import { PRData, BodyMeasurementData, LibraryCategoryStat } from '../hooks/useStatistics';

export const StatisticsRepository = {
  async getTasksStat(date: string) {
    const tasksRes = await db.execute('SELECT is_completed FROM Tasks WHERE target_date = ?', [date]);
    const tasksRows = (tasksRes.rows as any[]) || [];
    const total = tasksRows.length;
    const completed = tasksRows.filter(t => t.is_completed === 1).length;
    return { total, completed };
  },

  async getFocusTime(monStr: string, sunStr: string) {
    const focusRes = await db.execute(`
      SELECT SUM(total_focus_seconds) as total_sec
      FROM FocusStats
      WHERE date BETWEEN ? AND ?
    `, [monStr, sunStr]);
    return focusRes.rows[0]?.total_sec || 0;
  },

  async getWeeklyTasks(w1StartStr: string, sunStr: string, monDate: Date) {
    const allTasksRes = await db.execute(`
      SELECT target_date, is_completed
      FROM Tasks
      WHERE target_date BETWEEN ? AND ?
    `, [w1StartStr, sunStr]);
    
    const weeklyTasks = [ { c:0, t:0 }, { c:0, t:0 }, { c:0, t:0 }, { c:0, t:0 } ]; 
    (allTasksRes.rows as any[]).forEach(t => {
       const tDate = new Date(t.target_date).getTime();
       const diffDays = Math.floor((monDate.getTime() - tDate) / (1000 * 60 * 60 * 24));
       let wIdx = 3; 
       if (diffDays > 0 && diffDays <= 7) wIdx = 2; 
       else if (diffDays > 7 && diffDays <= 14) wIdx = 1; 
       else if (diffDays > 14 && diffDays <= 21) wIdx = 0; 
       
       if (wIdx >= 0 && wIdx <= 3) {
         weeklyTasks[wIdx].t += 1;
         if (t.is_completed === 1) weeklyTasks[wIdx].c += 1;
       }
    });
    return weeklyTasks;
  },

  async getCalories(date: string) {
    const macrosRes = await db.execute('SELECT total_calories, total_protein FROM DailyMacros WHERE date = ?', [date]);
    const macrosRows = (macrosRes.rows as any[]) || [];
    let todayCal = 0;
    if (macrosRows.length > 0) {
      todayCal = macrosRows[0].total_calories || (macrosRows[0].total_protein * 4); // basic fallback
    }
    return todayCal;
  },

  async getStepAvg(date: string) {
    const stepsRes = await db.execute(`
      SELECT AVG(count) as avg_steps 
      FROM Steps 
      WHERE date BETWEEN date(?, '-6 days') AND ?
    `, [date, date]);
    return Math.round(stepsRes.rows[0]?.avg_steps || 0);
  },

  async getPrs(year: string): Promise<PRData[]> {
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
    return (prsRes.rows as any[]) || [];
  },

  async getLibraryStats() {
    const libTotalRes = await db.execute('SELECT COUNT(*) as total FROM LibraryResources');
    const libTotal = libTotalRes.rows[0]?.total || 0;

    const libCatRes = await db.execute('SELECT category, COUNT(*) as count FROM LibraryResources WHERE category IS NOT NULL AND category != "" GROUP BY category ORDER BY count DESC');
    const libraryCategories = (libCatRes.rows as any[]) || [];
    
    return { libTotal, libraryCategories };
  },

  async getNoteDays(monthPrefix: string) {
    const notesRes = await db.execute(`
      SELECT date FROM DailyNotes 
      WHERE date LIKE ? 
        AND content IS NOT NULL 
        AND content != ''
    `, [`${monthPrefix}-%`]);
    return (notesRes.rows as any[]).map(r => parseInt(r.date.split('-')[2], 10));
  },

  async getBodyHistory(): Promise<BodyMeasurementData[]> {
    const bodyRes = await db.execute(`
      SELECT date, weight, height 
      FROM BodyMeasurements 
      ORDER BY date ASC
    `);
    return (bodyRes.rows as any[]) || [];
  }
};
