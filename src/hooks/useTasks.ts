import { useState, useEffect, useCallback } from 'react';
import db from '../database/database';

export interface Task {
  id: number;
  title: string;
  description: string;
  target_date: string;
  target_time: string;
  is_completed: boolean;
}

export const useTasks = (targetDate?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      let query = 'SELECT * FROM Tasks ORDER BY created_at DESC';
      let params: any[] = [];
      
      if (targetDate) {
        query = 'SELECT * FROM Tasks WHERE target_date = ? ORDER BY created_at DESC';
        params = [targetDate];
      }
      
      const result = await db.execute(query, params);
      const rows = (result.rows as any[]) || [];
      
      const formattedTasks = rows.map((row: any) => ({
        ...row,
        is_completed: Boolean(row.is_completed)
      }));
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [targetDate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (title: string, description: string, target_date?: string, target_time?: string) => {
    try {
      await db.execute(
        'INSERT INTO Tasks (title, description, target_date, target_time, is_completed) VALUES (?, ?, ?, ?, 0)',
        [title, description, target_date || null, target_time || null]
      );
      await fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (id: number, currentStatus: boolean) => {
    try {
      await db.execute(
        'UPDATE Tasks SET is_completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [currentStatus ? 0 : 1, id]
      );
      await fetchTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };
  
  const deleteTask = async (id: number) => {
    try {
      await db.execute('DELETE FROM Tasks WHERE id = ?', [id]);
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  const updateTask = async (id: number, title: string, description: string) => {
    try {
      await db.execute(
        'UPDATE Tasks SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, description, id]
      );
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return { tasks, loading, addTask, updateTask, toggleTask, deleteTask, refresh: fetchTasks };
};
