import { useState, useEffect, useCallback } from 'react';
import { MoodRepository } from '../repositories/MoodRepository';

export const useMoods = (date: string) => {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMood = useCallback(async () => {
    try {
      setLoading(true);
      const moodRating = await MoodRepository.getMood(date);
      setRating(moodRating);
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
      await MoodRepository.saveMood(date, newRating);
      setRating(newRating);
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  return { rating, loading, saveMood, refresh: fetchMood };
};

export const useMonthlyMoods = (yearMonth: string) => {
  const [moods, setMoods] = useState<Record<string, number>>({});

  const fetchMonthMoods = useCallback(async () => {
    try {
      const moodMap = await MoodRepository.getMonthlyMoods(yearMonth);
      setMoods(moodMap);
    } catch (error) {
      console.error('Error fetching monthly moods:', error);
    }
  }, [yearMonth]);

  useEffect(() => {
    fetchMonthMoods();
  }, [fetchMonthMoods]);

  return { moods, refreshMonth: fetchMonthMoods };
};
