import { useState, useEffect, useCallback } from 'react';
import db from '../database/database';

export interface ImportantDate {
  id: number;
  title: string;
  target_date: string;
  target_time: string;
  note: string;
}

export const useImportantDates = () => {
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDates = useCallback(async () => {
    try {
      setLoading(true);
      const result = await db.execute('SELECT * FROM ImportantDates ORDER BY target_date ASC');
      setDates((result.rows as any[]) || []);
    } catch (error) {
      console.error('Error fetching important dates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  const addDate = async (title: string, target_date: string, target_time: string, note: string) => {
    try {
      await db.execute(
        'INSERT INTO ImportantDates (title, target_date, target_time, note) VALUES (?, ?, ?, ?)',
        [title, target_date, target_time, note]
      );
      await fetchDates();
    } catch (error) {
      console.error('Error adding important date:', error);
    }
  };

  const deleteDate = async (id: number) => {
    try {
      await db.execute('DELETE FROM ImportantDates WHERE id = ?', [id]);
      await fetchDates();
    } catch (error) {
      console.error('Error deleting important date:', error);
    }
  };

  const updateDate = async (id: number, title: string, target_date: string, target_time: string, note: string) => {
    try {
      await db.execute(
        'UPDATE ImportantDates SET title = ?, target_date = ?, target_time = ?, note = ? WHERE id = ?',
        [title, target_date, target_time, note, id]
      );
      await fetchDates();
    } catch (error) {
      console.error('Error updating important date:', error);
    }
  };

  return { dates, loading, addDate, deleteDate, updateDate, refresh: fetchDates };
};
