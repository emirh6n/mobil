import { useState, useEffect, useCallback } from 'react';
import db from '../database/database';

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

  const initExtraTables = async () => {
    try {
      await db.execute(
        `CREATE TABLE IF NOT EXISTS NutritionRoutines (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          icon TEXT NOT NULL,
          checked INTEGER DEFAULT 0
        );`
      );
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNutritionData = useCallback(async () => {
    try {
      setLoading(true);
      await initExtraTables();

      // Fetch Protein from DailyMacros
      const macroRes = await db.execute('SELECT total_protein FROM DailyMacros WHERE date = ?', [date]);
      const macroRows = (macroRes.rows as any[]) || [];
      if (macroRows.length > 0) {
        setProtein(String(macroRows[0].total_protein || 0));
      } else {
        setProtein('0');
      }

      // Fetch Routines
      const routineRes = await db.execute('SELECT * FROM NutritionRoutines WHERE date = ?', [date]);
      const routineRows = (routineRes.rows as any[]) || [];
      
      const formatted = routineRows.map((r: any) => ({
        ...r,
        checked: Boolean(r.checked)
      }));
      setRoutine(formatted);
      
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
      await db.execute(
        `INSERT INTO DailyMacros (date, total_protein) VALUES (?, ?)
         ON CONFLICT(date) DO UPDATE SET total_protein = ?`,
        [date, numericVal, numericVal]
      );
      setProtein(String(numericVal));
    } catch (error) {
      console.error('Error saving protein:', error);
    }
  };

  const addRoutineItem = async (title: string, category: string, icon: string) => {
    try {
      await db.execute(
        'INSERT INTO NutritionRoutines (date, title, category, icon, checked) VALUES (?, ?, ?, ?, 0)',
        [date, title, category, icon]
      );
      await fetchNutritionData();
    } catch (error) {
      console.error('Error adding routine item:', error);
    }
  };

  const toggleCheck = async (id: number, currentStatus: boolean) => {
    try {
      await db.execute(
        'UPDATE NutritionRoutines SET checked = ? WHERE id = ?',
        [currentStatus ? 0 : 1, id]
      );
      await fetchNutritionData();
    } catch (error) {
      console.error('Error toggling routine item:', error);
    }
  };

  const removeItem = async (id: number) => {
    try {
      await db.execute('DELETE FROM NutritionRoutines WHERE id = ?', [id]);
      await fetchNutritionData();
    } catch (error) {
      console.error('Error deleting routine item:', error);
    }
  };

  return { protein, setProtein, routine, loading, saveProtein, addRoutineItem, toggleCheck, removeItem, refresh: fetchNutritionData };
};
