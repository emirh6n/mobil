import { useState, useEffect, useCallback } from 'react';
import { NutritionRepository } from '../repositories/NutritionRepository';

export interface RoutineItem {
  id: number;
  title: string;
  category: string;
  icon: string;
  checked: boolean;
}

export const useNutrition = (date: string) => {
  const [protein, setProtein] = useState('0');
  const [routine, setRoutine] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNutritionData = useCallback(async () => {
    try {
      setLoading(true);
      await NutritionRepository.initExtraTables();

      const proteinVal = await NutritionRepository.getProtein(date);
      setProtein(proteinVal);

      const routines = await NutritionRepository.getRoutines(date);
      setRoutine(routines);
      
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchNutritionData();
  }, [fetchNutritionData]);

  const saveProtein = async (val: string) => {
    try {
      const numericVal = parseInt(val, 10) || 0;
      await NutritionRepository.saveProtein(date, numericVal);
      setProtein(String(numericVal));
    } catch (error) {
      console.error('Error saving protein:', error);
    }
  };

  const addRoutineItem = async (title: string, category: string, icon: string) => {
    try {
      await NutritionRepository.addRoutineItem(date, title, category, icon);
      await fetchNutritionData();
    } catch (error) {
      console.error('Error adding routine item:', error);
    }
  };

  const toggleCheck = async (id: number, currentStatus: boolean) => {
    try {
      await NutritionRepository.toggleCheck(id, currentStatus);
      await fetchNutritionData();
    } catch (error) {
      console.error('Error toggling routine item:', error);
    }
  };

  const removeItem = async (id: number) => {
    try {
      await NutritionRepository.removeItem(id);
      await fetchNutritionData();
    } catch (error) {
      console.error('Error deleting routine item:', error);
    }
  };

  const updateRoutineItem = async (id: number, title: string) => {
    try {
      await NutritionRepository.updateRoutineItem(id, title);
      await fetchNutritionData();
    } catch (error) {
      console.error('Error updating routine item:', error);
    }
  };

  return { protein, setProtein, routine, loading, saveProtein, addRoutineItem, updateRoutineItem, toggleCheck, removeItem, refresh: fetchNutritionData };
};
