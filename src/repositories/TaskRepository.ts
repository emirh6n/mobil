import db from '../database/database';
import { Task } from '../hooks/useTasks';

export const TaskRepository = {
  async getTasks(targetDate?: string): Promise<Task[]> {
    let query = 'SELECT * FROM Tasks ORDER BY created_at DESC';
    let params: any[] = [];
    
    if (targetDate) {
      query = 'SELECT * FROM Tasks WHERE target_date = ? ORDER BY created_at DESC';
      params = [targetDate];
    }
    
    const result = await db.execute(query, params);
    const rows = (result.rows as any[]) || [];
    
    return rows.map((row: any) => ({
      ...row,
      is_completed: Boolean(row.is_completed)
    }));
  },

  async addTask(title: string, description: string, target_date?: string, target_time?: string): Promise<void> {
    await db.execute(
      'INSERT INTO Tasks (title, description, target_date, target_time, is_completed) VALUES (?, ?, ?, ?, 0)',
      [title, description, target_date || null, target_time || null]
    );
  },

  async toggleTask(id: number, currentStatus: boolean): Promise<void> {
    await db.execute(
      'UPDATE Tasks SET is_completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [currentStatus ? 0 : 1, id]
    );
  },

  async deleteTask(id: number): Promise<void> {
    await db.execute('DELETE FROM Tasks WHERE id = ?', [id]);
  },

  async updateTask(id: number, title: string, description: string): Promise<void> {
    await db.execute(
      'UPDATE Tasks SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, id]
    );
  }
};
