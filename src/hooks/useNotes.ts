import { useState, useEffect, useCallback } from 'react';
import db from '../database/database';

export const useNotes = (date: string) => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const fetchNote = useCallback(async () => {
    try {
      setLoading(true);
      const result = await db.execute('SELECT * FROM DailyNotes WHERE date = ?', [date]);
      const rows = (result.rows as any[]) || [];
      
      if (rows.length > 0) {
        setNote(rows[0].content || '');
      } else {
        setNote('');
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const saveNote = async (content: string) => {
    try {
      setSaveStatus('saving');
      await db.execute(
        'INSERT INTO DailyNotes (date, content, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(date) DO UPDATE SET content = excluded.content, updated_at = CURRENT_TIMESTAMP',
        [date, content]
      );
      setNote(content);
      setSaveStatus('saved');
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('idle');
    }
  };

  return { note, loading, saveStatus, saveNote, refresh: fetchNote };
};
