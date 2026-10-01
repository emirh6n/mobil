import { open } from '@op-engineering/op-sqlite';

// Initialize the SQLite database
const db = open({
  name: 'trkn_app.sqlite',
  // encryptionKey: 'your_encryption_key_here', // Uncomment if encryption is needed in the future
});

export const initDatabase = async () => {
  try {
    // Basic Key-Value Settings (User Profile, Daily Goals, App Config)
    await db.execute(
      `CREATE TABLE IF NOT EXISTS Settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // Tasks / Görev Disiplini
    await db.execute(
      `CREATE TABLE IF NOT EXISTS Tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        target_date TEXT, -- YYYY-MM-DD
        target_time TEXT, -- HH:MM
        is_completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // Reminders / Alarmlar
    await db.execute(
      `CREATE TABLE IF NOT EXISTS Reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time TEXT NOT NULL, -- HH:MM
        label TEXT,
        is_active INTEGER DEFAULT 1,
        is_hard_mode INTEGER DEFAULT 0,
        challenge_type TEXT, -- e.g., 'math', 'shake'
        days TEXT, -- JSON array of active days, e.g., '[1,2,3,4,5]' for weekdays
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // Important Dates / Önemli Tarihler
    await db.execute(
      `CREATE TABLE IF NOT EXISTS ImportantDates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        target_date TEXT NOT NULL, -- YYYY-MM-DD
        target_time TEXT, -- HH:MM
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // Library / Kütüphane
    await db.execute(
      `CREATE TABLE IF NOT EXISTS LibraryResources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT,
        url TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // Daily Notes / Günlük Notlar
    await db.execute(
      `CREATE TABLE IF NOT EXISTS DailyNotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE NOT NULL, -- YYYY-MM-DD
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // Moods / Güne Puanım
    await db.execute(
      `CREATE TABLE IF NOT EXISTS Moods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE NOT NULL, -- YYYY-MM-DD
        rating INTEGER NOT NULL, -- 1, 2, or 3
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // Workouts (Antrenman Takibi)
    await db.execute(
      `CREATE TABLE IF NOT EXISTS Workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL, -- YYYY-MM-DD
        name TEXT, -- e.g., 'Üst Vücut (İtiş)'
        muscle_group TEXT,
        duration_minutes INTEGER,
        volume INTEGER, -- total volume lifted
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // Workout Exercises (Antrenman Hareketleri)
    await db.execute(
      `CREATE TABLE IF NOT EXISTS WorkoutExercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER,
        exercise_name TEXT NOT NULL,
        sets INTEGER,
        reps TEXT, -- e.g. '12,10,8'
        weight TEXT, -- e.g. '50,55,60'
        rpe INTEGER, -- Rate of Perceived Exertion
        FOREIGN KEY(workout_id) REFERENCES Workouts(id) ON DELETE CASCADE
      );`
    );

    // Nutrition Logs (Besin Takibi)
    await db.execute(
      `CREATE TABLE IF NOT EXISTS NutritionLogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL, -- YYYY-MM-DD
        meal_type TEXT, -- 'breakfast', 'lunch', 'dinner', 'snack'
        food_name TEXT NOT NULL,
        calories INTEGER,
        protein INTEGER,
        carbs INTEGER,
        fats INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // Macros Daily Summary (Günlük Makro Özeti - optional, can be computed, but good for caching)
    await db.execute(
      `CREATE TABLE IF NOT EXISTS DailyMacros (
        date TEXT PRIMARY KEY, -- YYYY-MM-DD
        total_calories INTEGER DEFAULT 0,
        total_protein INTEGER DEFAULT 0,
        total_carbs INTEGER DEFAULT 0,
        total_fats INTEGER DEFAULT 0,
        water_ml INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );

    console.log('Database schema and tables initialized successfully.');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

export default db;
