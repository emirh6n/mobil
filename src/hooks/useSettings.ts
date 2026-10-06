import { useState, useEffect, useCallback } from 'react';
import { SettingsRepository } from '../repositories/SettingsRepository';

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
  body_fat: string;
  last_biometric_update: string;
}

const defaultSettings: AppSettings = {
  userName: '',
  target_calories: '2000',
  target_protein: '120',
  target_water: '3.0',
  target_steps: '10000',
  age: '',
  gender: 'male',
  height: '',
  weight: '',
  waist: '',
  neck: '',
  hip: '',
  body_fat: '',
  last_biometric_update: '',
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const loadedSettings = await SettingsRepository.getSettings(defaultSettings);
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
      await SettingsRepository.updateSetting(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
    }
  };

  const updateMultipleSettings = async (updates: Partial<AppSettings>) => {
    try {
      const keys = Object.keys(updates);
      let hasBodyParams = false;
      for (const key of keys) {
        if (['weight', 'height', 'waist', 'neck', 'hip', 'body_fat'].includes(key)) hasBodyParams = true;
        await SettingsRepository.updateSetting(key, (updates as any)[key]);
      }
      setSettings(prev => {
        const next = { ...prev, ...updates };
        if (hasBodyParams) {
           SettingsRepository.saveBodyMeasurements(next.weight, next.height, next.waist, next.neck, next.hip, next.body_fat);
        }
        return next;
      });
    } catch (error) {
      console.error('Error updating multiple settings:', error);
    }
  };

  return { settings, loading, updateSetting, updateMultipleSettings, refresh: fetchSettings };
};
