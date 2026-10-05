import db from '../database/database';
import { RoutineItem } from '../hooks/useNutrition';

export const NutritionRepository = {
  async initExtraTables(): Promise<void> {
    await db.execute(
      `CREATE TABLE IF NOT EXISTS NutritionRoutines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        icon TEXT NOT NULL,
        checked INTEGER DEFAULT 0
      );`
    );
  },

  async getProtein(date: string): Promise<string> {
    const macroRes = await db.execute('SELECT total_protein FROM DailyMacros WHERE date = ?', [date]);
    const macroRows = (macroRes.rows as any[]) || [];
    if (macroRows.length > 0) {
      return String(macroRows[0].total_protein || 0);
    }
    return '0';
  },

  async getRoutines(date: string): Promise<RoutineItem[]> {
    const routineRes = await db.execute('SELECT * FROM NutritionRoutines WHERE date = ?', [date]);
    const routineRows = (routineRes.rows as any[]) || [];
    
    return routineRows.map((r: any) => ({
      ...r,
      checked: Boolean(r.checked)
    }));
  },

  async saveProtein(date: string, numericVal: number): Promise<void> {
    await db.execute(
      `INSERT INTO DailyMacros (date, total_protein) VALUES (?, ?)
       ON CONFLICT(date) DO UPDATE SET total_protein = ?`,
      [date, numericVal, numericVal]
    );
  },

  async addRoutineItem(date: string, title: string, category: string, icon: string): Promise<void> {
    await db.execute(
      'INSERT INTO NutritionRoutines (date, title, category, icon, checked) VALUES (?, ?, ?, ?, 0)',
      [date, title, category, icon]
    );
  },

  async toggleCheck(id: number, currentStatus: boolean): Promise<void> {
    await db.execute(
      'UPDATE NutritionRoutines SET checked = ? WHERE id = ?',
      [currentStatus ? 0 : 1, id]
    );
  },

  async removeItem(id: number): Promise<void> {
    await db.execute('DELETE FROM NutritionRoutines WHERE id = ?', [id]);
  },

  async updateRoutineItem(id: number, title: string): Promise<void> {
    await db.execute('UPDATE NutritionRoutines SET title = ? WHERE id = ?', [title, id]);
  }
};
