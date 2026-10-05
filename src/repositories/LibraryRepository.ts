import db from '../database/database';
import { LibraryResource } from '../hooks/useLibrary';

export const LibraryRepository = {
  async getResources(): Promise<LibraryResource[]> {
    const result = await db.execute('SELECT * FROM LibraryResources ORDER BY created_at DESC');
    return (result.rows as any[]) || [];
  },

  async addResource(title: string, category: string, url: string, notes: string): Promise<void> {
    await db.execute(
      'INSERT INTO LibraryResources (title, category, url, notes) VALUES (?, ?, ?, ?)',
      [title, category, url, notes]
    );
  },

  async deleteResource(id: number): Promise<void> {
    await db.execute('DELETE FROM LibraryResources WHERE id = ?', [id]);
  },

  async updateResource(id: number, title: string, category: string, url: string, notes: string): Promise<void> {
    await db.execute(
      'UPDATE LibraryResources SET title = ?, category = ?, url = ?, notes = ? WHERE id = ?',
      [title, category, url, notes, id]
    );
  }
};
