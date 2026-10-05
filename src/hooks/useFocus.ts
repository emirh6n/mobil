import { useState, useEffect, useCallback } from 'react';
import { FocusRepository } from '../repositories/FocusRepository';

export const useFocus = (date: string) => {
  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchFocus = useCallback(async () => {
    try {
      setLoading(true);
      await FocusRepository.initTable();
      const seconds = await FocusRepository.getFocus(date);
      setTotalFocusSeconds(seconds);
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
      await FocusRepository.setFocus(date, newTotal);
      setTotalFocusSeconds(newTotal);
    } catch (error) {
      console.error('Error adding focus time:', error);
    }
  };

  return { totalFocusSeconds, addFocusTime, loading, refresh: fetchFocus };
};
