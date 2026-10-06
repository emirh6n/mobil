package expo.modules.trknpedometer

import android.content.Context
import android.content.SharedPreferences
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object StepHelper {
    private const val PREFS_NAME = "trkn_pedometer_prefs"

    fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun processStepCount(context: Context, hardwareSteps: Long) {
        val prefs = getPrefs(context)
        val lastHardwareSteps = prefs.getLong("last_hardware_steps", -1L)
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
        val savedDate = prefs.getString("current_date", "")

        var startOfDaySteps = prefs.getLong("start_of_day_steps", hardwareSteps)

        if (lastHardwareSteps != -1L && hardwareSteps < lastHardwareSteps) {
            val stepsTodayBeforeReboot = lastHardwareSteps - startOfDaySteps
            startOfDaySteps = hardwareSteps - stepsTodayBeforeReboot
        }

        if (savedDate != "" && savedDate != today) {
            startOfDaySteps = hardwareSteps
        }

        val todaySteps = hardwareSteps - startOfDaySteps

        prefs.edit()
            .putLong("last_hardware_steps", hardwareSteps)
            .putLong("start_of_day_steps", startOfDaySteps)
            .putString("current_date", today)
            .putLong("today_steps", if (todaySteps > 0) todaySteps else 0L)
            .apply()
    }
}
