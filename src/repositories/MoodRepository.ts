import db from '../database/database';

export const MoodRepository = {
  async getMood(date: string): Promise<number> {
    const result = await db.execute('SELECT * FROM Moods WHERE date = ?', [date]);
    const rows = (result.rows as any[]) || [];
    if (rows.length > 0) {
      return rows[0].rating;
    }
    return 0;
  },

  async saveMood(date: string, newRating: number): Promise<void> {
    await db.execute(
      'INSERT INTO Moods (date, rating) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET rating = excluded.rating',
      [date, newRating]
    );
  },

  async getMonthlyMoods(yearMonth: string): Promise<Record<string, number>> {
    const result = await db.execute('SELECT date, rating FROM Moods WHERE date LIKE ?', [`${yearMonth}-%`]);
    const rows = (result.rows as any[]) || [];
    const moodMap: Record<string, number> = {};
    rows.forEach(r => {
      moodMap[r.date] = r.rating;
    });
    return moodMap;
  }
};
