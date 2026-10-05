import db from '../database/database';

export const FocusRepository = {
  async initTable(): Promise<void> {
    await db.execute(
      `CREATE TABLE IF NOT EXISTS FocusStats (
        date TEXT PRIMARY KEY,
        total_focus_seconds INTEGER DEFAULT 0
      );`
    );
  },

  async getFocus(date: string): Promise<number> {
    const res = await db.execute('SELECT total_focus_seconds FROM FocusStats WHERE date = ?', [date]);
    const rows = (res.rows as any[]) || [];
    if (rows.length > 0) {
      return rows[0].total_focus_seconds;
    }
    return 0;
  },

  async setFocus(date: string, newTotal: number): Promise<void> {
    await db.execute(
      `INSERT INTO FocusStats (date, total_focus_seconds) VALUES (?, ?)
       ON CONFLICT(date) DO UPDATE SET total_focus_seconds = ?`,
      [date, newTotal, newTotal]
    );
  }
};
