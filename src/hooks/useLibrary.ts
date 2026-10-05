import { useState, useEffect, useCallback } from 'react';
import { LibraryRepository } from '../repositories/LibraryRepository';

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
      const fetchedResources = await LibraryRepository.getResources();
      setResources(fetchedResources);
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
      await LibraryRepository.addResource(title, category, url, notes);
      await fetchResources();
    } catch (error) {
      console.error('Error adding library resource:', error);
    }
  };

  const deleteResource = async (id: number) => {
    try {
      await LibraryRepository.deleteResource(id);
      await fetchResources();
    } catch (error) {
      console.error('Error deleting library resource:', error);
    }
  };

  const updateResource = async (id: number, title: string, category: string, url: string, notes: string) => {
    try {
      await LibraryRepository.updateResource(id, title, category, url, notes);
      await fetchResources();
    } catch (error) {
      console.error('Error updating library resource:', error);
    }
  };

  return { resources, loading, addResource, updateResource, deleteResource, refresh: fetchResources };
};
