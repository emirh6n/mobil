import db from '../database/database';
import { AppSettings } from '../hooks/useSettings';

export const SettingsRepository = {
  async getSettings(defaultSettings: AppSettings): Promise<AppSettings> {
    const result = await db.execute('SELECT * FROM Settings');
    const rows = (result.rows as any[]) || [];
    
    const loadedSettings = { ...defaultSettings };
    
    rows.forEach((row: any) => {
      if (row.key in loadedSettings) {
        (loadedSettings as any)[row.key] = row.value;
      }
    });
    
    return loadedSettings;
  },

  async updateSetting(key: string, value: string): Promise<void> {
    await db.execute(
      'INSERT INTO Settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP',
      [key, value]
    );
  },

  async saveBodyMeasurements(weight: string, height: string, waist: string, neck: string, hip: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await db.execute(`
      INSERT INTO BodyMeasurements (date, weight, height, waist, neck, hip)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [today, weight, height, waist, neck, hip]);
  }
};
