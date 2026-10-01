import { useState, useEffect, useCallback } from 'react';
import db from '../database/database';

export interface AppSettings {
  userName: string;
  target_calories: string;
  target_protein: string;
  target_water: string;
  target_steps: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  waist: string;
  neck: string;
  hip: string;
}

const defaultSettings: AppSettings = {
  userName: 'Emirhan',
  target_calories: '2000',
  target_protein: '120',
  target_water: '3.0',
  target_steps: '10000',
  age: '24',
  gender: 'male',
  height: '182',
  weight: '78',
  waist: '82',
  neck: '39',
  hip: '95',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const result = await db.execute('SELECT * FROM Settings');
      const rows = (result.rows as any[]) || [];
      
      const loadedSettings = { ...defaultSettings };
      
      rows.forEach((row: any) => {
        if (row.key in loadedSettings) {
          (loadedSettings as any)[row.key] = row.value;
        }
      });
      
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = async (key: keyof AppSettings, value: string) => {
    try {
      await db.execute(
        'INSERT INTO Settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP',
        [key, value]
      );
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
    }
  };

  const updateMultipleSettings = async (updates: Partial<AppSettings>) => {
    try {
      const keys = Object.keys(updates);
      for (const key of keys) {
        await db.execute(
          'INSERT INTO Settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP',
          [key, (updates as any)[key]]
        );
      }
      setSettings(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating multiple settings:', error);
    }
  };

  return { settings, loading, updateSetting, updateMultipleSettings, refresh: fetchSettings };
};
