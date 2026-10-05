import db from '../database/database';
import { Reminder } from '../hooks/useReminders';

export const ReminderRepository = {
  async getReminders(): Promise<Reminder[]> {
    const result = await db.execute('SELECT * FROM Reminders ORDER BY time ASC');
    const rows = (result.rows as any[]) || [];
    
    return rows.map((row: any) => ({
      ...row,
      is_active: Boolean(row.is_active),
      is_hard_mode: Boolean(row.is_hard_mode)
    }));
  },

  async addReminder(time: string, label: string, is_hard_mode: boolean = false, days: string = '[]'): Promise<void> {
    await db.execute(
      'INSERT INTO Reminders (time, label, is_active, is_hard_mode, days) VALUES (?, ?, 1, ?, ?)',
      [time, label, is_hard_mode ? 1 : 0, days]
    );
  },

  async toggleReminder(id: number, currentStatus: boolean): Promise<void> {
    await db.execute(
      'UPDATE Reminders SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [currentStatus ? 0 : 1, id]
    );
  },

  async deleteReminder(id: number): Promise<void> {
    await db.execute('DELETE FROM Reminders WHERE id = ?', [id]);
  },

  async updateReminder(id: number, time: string, label: string, is_hard_mode: boolean = false, days: string = '[]'): Promise<void> {
    await db.execute(
      'UPDATE Reminders SET time = ?, label = ?, is_hard_mode = ?, days = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [time, label, is_hard_mode ? 1 : 0, days, id]
    );
  }
};
