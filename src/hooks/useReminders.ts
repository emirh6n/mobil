import { useState, useEffect, useCallback } from 'react';
import db from '../database/database';

export interface Reminder {
  id: number;
  time: string;
  label: string;
  is_active: boolean;
  is_hard_mode: boolean;
  challenge_type?: string;
  days?: string;
}

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const result = await db.execute('SELECT * FROM Reminders ORDER BY time ASC');
      const rows = (result.rows as any[]) || [];
      
      const formatted = rows.map((row: any) => ({
        ...row,
        is_active: Boolean(row.is_active),
        is_hard_mode: Boolean(row.is_hard_mode)
      }));
      
      setReminders(formatted);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const addReminder = async (time: string, label: string, is_hard_mode: boolean = false, days: string = '[]') => {
    try {
      await db.execute(
        'INSERT INTO Reminders (time, label, is_active, is_hard_mode, days) VALUES (?, ?, 1, ?, ?)',
        [time, label, is_hard_mode ? 1 : 0, days]
      );
      await fetchReminders();
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  const toggleReminder = async (id: number, currentStatus: boolean) => {
    try {
      await db.execute(
        'UPDATE Reminders SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [currentStatus ? 0 : 1, id]
      );
      await fetchReminders();
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const deleteReminder = async (id: number) => {
    try {
      await db.execute('DELETE FROM Reminders WHERE id = ?', [id]);
      await fetchReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  return { reminders, loading, addReminder, toggleReminder, deleteReminder, refresh: fetchReminders };
};
