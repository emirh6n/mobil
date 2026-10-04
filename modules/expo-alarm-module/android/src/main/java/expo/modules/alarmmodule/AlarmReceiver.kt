package expo.modules.alarmmodule

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val alarmId = intent.getIntExtra("ALARM_ID", -1)
        val isHardMode = intent.getBooleanExtra("IS_HARD_MODE", false)
        
        if (isHardMode) {
            val serviceIntent = Intent(context, AlarmForegroundService::class.java)
            serviceIntent.putExtra("ALARM_ID", alarmId)
            
            val prefs = context.getSharedPreferences("expo_alarm_module_prefs", Context.MODE_PRIVATE)
            prefs.edit().putInt("active_alarm_id", alarmId).apply()
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        } else {
            // Normal mode alarm: just show a standard notification
            val notificationIntent = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: Intent()
            val pendingIntent = android.app.PendingIntent.getActivity(
                context, alarmId, notificationIntent,
                android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
            )
            
            val channelId = "normal_alarm_channel"
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = android.app.NotificationChannel(channelId, "Normal Alarmlar", android.app.NotificationManager.IMPORTANCE_HIGH)
                notificationManager.createNotificationChannel(channel)
            }
            
            val notification = androidx.core.app.NotificationCompat.Builder(context, channelId)
                .setContentTitle("Hatırlatıcı")
                .setContentText("Alarm zamanı geldi!")
                .setSmallIcon(context.applicationInfo.icon)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .build()
                
            notificationManager.notify(alarmId, notification)
            
            // For normal mode, if the app is open, JS will handle the modal via polling or we could send an event. 
            // The existing setInterval in JS will catch it if it's open.
        }
    }
}
