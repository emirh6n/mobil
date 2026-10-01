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
      const result = await db.executeAsync('SELECT * FROM ImportantDates ORDER BY target_date ASC');
      setDates(result.rows?._array || []);
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
      await db.executeAsync(
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
      await db.executeAsync('DELETE FROM ImportantDates WHERE id = ?', [id]);
      await fetchDates();
    } catch (error) {
      console.error('Error deleting important date:', error);
    }
  };

  return { dates, loading, addDate, deleteDate, refresh: fetchDates };
};
