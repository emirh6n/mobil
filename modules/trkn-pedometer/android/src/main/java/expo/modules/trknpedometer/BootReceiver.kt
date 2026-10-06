package expo.modules.trknpedometer

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            val prefs = StepHelper.getPrefs(context)
            if (prefs.getBoolean("is_tracking", false)) {
                val workRequest = PeriodicWorkRequestBuilder<StepWorker>(15, TimeUnit.MINUTES).build()
                WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                    "TrknStepWorker",
                    ExistingPeriodicWorkPolicy.KEEP,
                    workRequest
                )
            }
        }
    }
}
