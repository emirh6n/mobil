import { useState, useEffect, useCallback } from 'react';
import { WorkoutRepository } from '../repositories/WorkoutRepository';

export interface WorkoutExercise {
  id: number;
  workout_id: number;
  exercise_name: string;
  sets: number;
  reps: string;
  weight: string;
}

export interface Workout {
  id: number;
  date: string;
  name: string;
  muscle_group: string;
  duration_minutes: number;
  volume: number;
  exercises?: WorkoutExercise[];
}

export const useWorkouts = (date: string) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      const populatedWorkouts = await WorkoutRepository.getWorkouts(date);
      setWorkouts(populatedWorkouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const addWorkoutExercise = async (muscleGroup: string, exerciseName: string, sets: number, reps: string, weight: string) => {
    try {
      await WorkoutRepository.addWorkoutExercise(date, muscleGroup, exerciseName, sets, reps, weight);
      await fetchWorkouts();
    } catch (error) {
      console.error('Error adding workout exercise:', error);
    }
  };

  const deleteWorkout = async (id: number) => {
    try {
      await WorkoutRepository.deleteWorkout(id);
      await fetchWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  return { workouts, loading, addWorkoutExercise, deleteWorkout, refresh: fetchWorkouts };
};
