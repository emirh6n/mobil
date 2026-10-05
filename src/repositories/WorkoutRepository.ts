import db from '../database/database';
import { Workout } from '../hooks/useWorkouts';

export const WorkoutRepository = {
  async getWorkouts(date: string): Promise<Workout[]> {
    const result = await db.execute('SELECT * FROM Workouts WHERE date = ? ORDER BY id DESC', [date]);
    const wRows = (result.rows as any[]) || [];
    
    return Promise.all(
      wRows.map(async (workout: Workout) => {
        const exercisesResult = await db.execute('SELECT * FROM WorkoutExercises WHERE workout_id = ?', [workout.id]);
        return {
          ...workout,
          exercises: (exercisesResult.rows as any[]) || []
        };
      })
    );
  },

  async addWorkoutExercise(date: string, muscleGroup: string, exerciseName: string, sets: number, reps: string, weight: string): Promise<void> {
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
  },

  async deleteWorkout(id: number): Promise<void> {
    await db.execute('DELETE FROM Workouts WHERE id = ?', [id]);
  }
};
