package expo.modules.alarmmodule

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import android.os.Build
import java.io.File
import java.util.Calendar

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == "android.intent.action.QUICKBOOT_POWERON") {
            // Stop the foreground service if it's running (it shouldn't be, but just in case)
            val serviceIntent = Intent(context, AlarmForegroundService::class.java)
            context.stopService(serviceIntent)
            
            val prefs = context.getSharedPreferences("expo_alarm_module_prefs", Context.MODE_PRIVATE)
            prefs.edit()
                .putBoolean("booted_needs_clear", true)
                .putInt("active_alarm_id", -1)
                .apply()
                
            // Reschedule future alarms from SQLite
            try {
                val dbFile = context.getDatabasePath("trkn_app.sqlite")
                if (dbFile.exists()) {
                    val db = SQLiteDatabase.openDatabase(dbFile.absolutePath, null, SQLiteDatabase.OPEN_READONLY)
                    val cursor = db.rawQuery("SELECT id, time, is_hard_mode, days FROM Reminders WHERE is_active = 1", null)
                    
                    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
                    
                    val now = Calendar.getInstance()
                    val currentDayOfWeek = if (now.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY) 6 else now.get(Calendar.DAY_OF_WEEK) - 2 // 0=Mon, 6=Sun
                    
                    while (cursor.moveToNext()) {
                        val id = cursor.getInt(0)
                        val time = cursor.getString(1)
                        val isHardMode = cursor.getInt(2) == 1
                        val daysJson = cursor.getString(3) ?: "[]"
                        
                        val parts = time.split(":")
                        if (parts.size == 2) {
                            val hh = parts[0].toIntOrNull() ?: continue
                            val mm = parts[1].toIntOrNull() ?: continue
                            
                            val nextDate = Calendar.getInstance()
                            nextDate.set(Calendar.HOUR_OF_DAY, hh)
                            nextDate.set(Calendar.MINUTE, mm)
                            nextDate.set(Calendar.SECOND, 0)
                            nextDate.set(Calendar.MILLISECOND, 0)
                            
                            var daysOffset = 0
                            if (nextDate.timeInMillis <= now.timeInMillis) {
                                daysOffset = 1
                            }
                            
                            // Basic logic for next day, assuming daily for simplicity in native if json parse fails
                            // Real logic is in JS, but we'll at least schedule the next immediate occurrence
                            if (daysOffset > 0) {
                                nextDate.add(Calendar.DAY_OF_MONTH, daysOffset)
                            }
                            
                            val alarmIntent = Intent(context, AlarmReceiver::class.java).apply {
                                putExtra("ALARM_ID", id)
                                putExtra("IS_HARD_MODE", isHardMode)
                            }
                            
                            val pendingIntent = PendingIntent.getBroadcast(
                                context,
                                id,
                                alarmIntent,
                                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                            )
                            
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextDate.timeInMillis, pendingIntent)
                            } else {
                                alarmManager.setExact(AlarmManager.RTC_WAKEUP, nextDate.timeInMillis, pendingIntent)
                            }
                        }
                    }
                    cursor.close()
                    db.close()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
