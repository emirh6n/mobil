import { useState, useEffect, useCallback } from 'react';
import db from '../database/database';

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
      const result = await db.execute('SELECT * FROM Workouts WHERE date = ? ORDER BY id DESC', [date]);
      const wRows = (result.rows as any[]) || [];
      
      const populatedWorkouts = await Promise.all(
        wRows.map(async (workout: Workout) => {
          const exercisesResult = await db.execute('SELECT * FROM WorkoutExercises WHERE workout_id = ?', [workout.id]);
          return {
            ...workout,
            exercises: (exercisesResult.rows as any[]) || []
          };
        })
      );
      
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
      // 1. Check if there's a workout for this muscle group today, if not create one
      let workoutId;
      const existing = await db.execute('SELECT id FROM Workouts WHERE date = ? AND muscle_group = ? LIMIT 1', [date, muscleGroup]);
      const existingRows = (existing.rows as any[]) || [];
      
      if (existingRows.length > 0) {
        workoutId = existingRows[0].id;
      } else {
        const insertWorkout = await db.execute(
          'INSERT INTO Workouts (date, name, muscle_group, duration_minutes, volume) VALUES (?, ?, ?, 0, 0)',
          [date, `${muscleGroup} Antrenmanı`, muscleGroup]
        );
        workoutId = insertWorkout.insertId;
      }
      
      // 2. Add exercise
      await db.execute(
        'INSERT INTO WorkoutExercises (workout_id, exercise_name, sets, reps, weight) VALUES (?, ?, ?, ?, ?)',
        [workoutId, exerciseName, sets, reps, weight]
      );
      
      await fetchWorkouts();
    } catch (error) {
      console.error('Error adding workout exercise:', error);
    }
  };

  const deleteWorkout = async (id: number) => {
    try {
      await db.execute('DELETE FROM Workouts WHERE id = ?', [id]);
      await fetchWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  return { workouts, loading, addWorkoutExercise, deleteWorkout, refresh: fetchWorkouts };
};
