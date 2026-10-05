import { useState, useEffect, useCallback } from 'react';
import { TaskRepository } from '../repositories/TaskRepository';

export interface Task {
  id: number;
  title: string;
  description: string;
  target_date: string;
  target_time: string;
  is_completed: boolean;
}

export const useTasks = (targetDate?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const formattedTasks = await TaskRepository.getTasks(targetDate);
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [targetDate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (title: string, description: string, target_date?: string, target_time?: string) => {
    try {
      await TaskRepository.addTask(title, description, target_date, target_time);
      await fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (id: number, currentStatus: boolean) => {
    try {
      await TaskRepository.toggleTask(id, currentStatus);
      await fetchTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };
  
  const deleteTask = async (id: number) => {
    try {
      await TaskRepository.deleteTask(id);
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  const updateTask = async (id: number, title: string, description: string) => {
    try {
      await TaskRepository.updateTask(id, title, description);
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return { tasks, loading, addTask, updateTask, toggleTask, deleteTask, refresh: fetchTasks };
};
