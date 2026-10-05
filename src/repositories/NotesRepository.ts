import db from '../database/database';

export const NotesRepository = {
  async getNote(date: string): Promise<string> {
    const result = await db.execute('SELECT * FROM DailyNotes WHERE date = ?', [date]);
    const rows = (result.rows as any[]) || [];
    
    if (rows.length > 0) {
      return rows[0].content || '';
    }
    return '';
  },

  async saveNote(date: string, content: string): Promise<void> {
    await db.execute(
      'INSERT INTO DailyNotes (date, content, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(date) DO UPDATE SET content = excluded.content, updated_at = CURRENT_TIMESTAMP',
      [date, content]
    );
  }
};
