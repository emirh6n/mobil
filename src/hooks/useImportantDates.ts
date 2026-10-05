import { useState, useEffect, useCallback } from 'react';
import { ImportantDateRepository } from '../repositories/ImportantDateRepository';

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
      const fetchedDates = await ImportantDateRepository.getDates();
      setDates(fetchedDates);
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
      await ImportantDateRepository.addDate(title, target_date, target_time, note);
      await fetchDates();
    } catch (error) {
      console.error('Error adding important date:', error);
    }
  };

  const deleteDate = async (id: number) => {
    try {
      await ImportantDateRepository.deleteDate(id);
      await fetchDates();
    } catch (error) {
      console.error('Error deleting important date:', error);
    }
  };

  const updateDate = async (id: number, title: string, target_date: string, target_time: string, note: string) => {
    try {
      await ImportantDateRepository.updateDate(id, title, target_date, target_time, note);
      await fetchDates();
    } catch (error) {
      console.error('Error updating important date:', error);
    }
  };

  return { dates, loading, addDate, deleteDate, updateDate, refresh: fetchDates };
};
