import db from '../database/database';
import { ImportantDate } from '../hooks/useImportantDates';

export const ImportantDateRepository = {
  async getDates(): Promise<ImportantDate[]> {
    const result = await db.execute('SELECT * FROM ImportantDates ORDER BY target_date ASC');
    return (result.rows as any[]) || [];
  },

  async addDate(title: string, target_date: string, target_time: string, note: string): Promise<void> {
    await db.execute(
      'INSERT INTO ImportantDates (title, target_date, target_time, note) VALUES (?, ?, ?, ?)',
      [title, target_date, target_time, note]
    );
  },

  async deleteDate(id: number): Promise<void> {
    await db.execute('DELETE FROM ImportantDates WHERE id = ?', [id]);
  },

  async updateDate(id: number, title: string, target_date: string, target_time: string, note: string): Promise<void> {
    await db.execute(
      'UPDATE ImportantDates SET title = ?, target_date = ?, target_time = ?, note = ? WHERE id = ?',
      [title, target_date, target_time, note, id]
    );
  }
};
