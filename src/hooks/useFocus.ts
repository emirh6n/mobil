import { useState, useEffect, useCallback } from 'react';
import db from '../database/database';

export const useFocus = (date: string) => {
  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);
  const [loading, setLoading] = useState(true);

  const initTable = async () => {
    try {
      await db.execute(
        `CREATE TABLE IF NOT EXISTS FocusStats (
          date TEXT PRIMARY KEY,
          total_focus_seconds INTEGER DEFAULT 0
        );`
      );
    } catch (error) {
      console.error('FocusStats table init error:', error);
    }
  };

  const fetchFocus = useCallback(async () => {
    try {
      setLoading(true);
      await initTable();
      const res = await db.execute('SELECT total_focus_seconds FROM FocusStats WHERE date = ?', [date]);
      const rows = (res.rows as any[]) || [];
      if (rows.length > 0) {
        setTotalFocusSeconds(rows[0].total_focus_seconds);
      } else {
        setTotalFocusSeconds(0);
      }
    } catch (error) {
      console.error('Error fetching focus stats:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchFocus();
  }, [fetchFocus]);

  const addFocusTime = async (secondsToAdd: number) => {
    try {
      const newTotal = totalFocusSeconds + secondsToAdd;
      await db.execute(
        `INSERT INTO FocusStats (date, total_focus_seconds) VALUES (?, ?)
         ON CONFLICT(date) DO UPDATE SET total_focus_seconds = ?`,
        [date, newTotal, newTotal]
      );
      setTotalFocusSeconds(newTotal);
    } catch (error) {
      console.error('Error adding focus time:', error);
    }
  };

  return { totalFocusSeconds, addFocusTime, loading, refresh: fetchFocus };
};
