import { useState, useEffect, useCallback } from 'react';
import db from '../database/database';

export const useMoods = (date: string) => {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMood = useCallback(async () => {
    try {
      setLoading(true);
      const result = await db.execute('SELECT * FROM Moods WHERE date = ?', [date]);
      const rows = (result.rows as any[]) || [];
      if (rows.length > 0) {
        setRating(rows[0].rating);
      } else {
        setRating(0);
      }
    } catch (error) {
      console.error('Error fetching mood:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchMood();
  }, [fetchMood]);

  const saveMood = async (newRating: number) => {
    try {
      await db.execute(
        'INSERT INTO Moods (date, rating) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET rating = excluded.rating',
        [date, newRating]
      );
      setRating(newRating);
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  return { rating, loading, saveMood, refresh: fetchMood };
};
