import { useState, useEffect, useCallback, useRef } from 'react';
import { NotesRepository } from '../repositories/NotesRepository';

export const useNotes = (date: string) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNote = useCallback(async () => {
    try {
      setLoading(true);
      const content = await NotesRepository.getNote(date);
      setNote(content);
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const saveNote = async (content: string) => {
    try {
      setSaveStatus('saving');
      await NotesRepository.saveNote(date, content);
      setNote(content);
      setSaveStatus('saved');
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('idle');
    }
  };

  return { note, loading, saveStatus, saveNote, refresh: fetchNote };
};
