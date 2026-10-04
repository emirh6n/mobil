package expo.modules.alarmmodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import java.util.Calendar

class ExpoAlarmModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoAlarmModule")

    Function("startAlarm") {
      appContext.reactContext?.let { context ->
        val intent = Intent(context, AlarmForegroundService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          context.startForegroundService(intent)
        } else {
          context.startService(intent)
        }
      }
    }

    Function("stopAlarm") {
      appContext.reactContext?.let { context ->
        val intent = Intent(context, AlarmForegroundService::class.java)
        intent.action = "STOP_ALARM"
        context.startService(intent)
        
        val prefs = context.getSharedPreferences("expo_alarm_module_prefs", Context.MODE_PRIVATE)
        prefs.edit().putInt("active_alarm_id", -1).apply()
      }
    }

    Function("checkAndClearBootFlag") { ->
      val context = appContext.reactContext
      if (context == null) {
        return@Function false
      }
      val prefs = context.getSharedPreferences("expo_alarm_module_prefs", Context.MODE_PRIVATE)
      val booted = prefs.getBoolean("booted_needs_clear", false)
      if (booted) {
        prefs.edit().putBoolean("booted_needs_clear", false).apply()
      }
      return@Function booted
    }

    Function("scheduleAlarm") { id: Int, timeMs: Double, isHardMode: Boolean ->
      appContext.reactContext?.let { context ->
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, AlarmReceiver::class.java)
        intent.putExtra("ALARM_ID", id)
        intent.putExtra("IS_HARD_MODE", isHardMode)
        
        val pendingIntent = PendingIntent.getBroadcast(
          context,
          id,
          intent,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, timeMs.toLong(), pendingIntent)
        } else {
          alarmManager.setExact(AlarmManager.RTC_WAKEUP, timeMs.toLong(), pendingIntent)
        }
      }
    }

    Function("cancelAlarm") { id: Int ->
      appContext.reactContext?.let { context ->
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, AlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
          context,
          id,
          intent,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager.cancel(pendingIntent)
      }
    }

    Function("getActiveAlarmId") { ->
      val context = appContext.reactContext
      if (context == null) {
        return@Function -1
      }
      val prefs = context.getSharedPreferences("expo_alarm_module_prefs", Context.MODE_PRIVATE)
      return@Function prefs.getInt("active_alarm_id", -1)
    }
  }
}
