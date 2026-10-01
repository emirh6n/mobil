import { useState, useEffect, useCallback } from 'react';
import db from '../database/database';

export interface LibraryResource {
  id: number;
  title: string;
  category: string;
  url: string;
  notes: string;
  created_at: string;
}

export const useLibrary = () => {
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const result = await db.executeAsync('SELECT * FROM LibraryResources ORDER BY created_at DESC');
      setResources(result.rows?._array || []);
    } catch (error) {
      console.error('Error fetching library resources:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const addResource = async (title: string, category: string, url: string, notes: string) => {
    try {
      await db.executeAsync(
        'INSERT INTO LibraryResources (title, category, url, notes) VALUES (?, ?, ?, ?)',
        [title, category, url, notes]
      );
      await fetchResources();
    } catch (error) {
      console.error('Error adding library resource:', error);
    }
  };

  const deleteResource = async (id: number) => {
    try {
      await db.executeAsync('DELETE FROM LibraryResources WHERE id = ?', [id]);
      await fetchResources();
    } catch (error) {
      console.error('Error deleting library resource:', error);
    }
  };

  return { resources, loading, addResource, deleteResource, refresh: fetchResources };
};
