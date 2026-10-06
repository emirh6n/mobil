package expo.modules.trknpedometer

import android.content.Context
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.TimeUnit

class TrknPedometerModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("TrknPedometer")

        Function("startTracking") {
            val context = appContext.reactContext ?: return@Function
            val prefs = StepHelper.getPrefs(context)
            prefs.edit().putBoolean("is_tracking", true).apply()

            val workRequest = PeriodicWorkRequestBuilder<StepWorker>(15, TimeUnit.MINUTES).build()
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                "TrknStepWorker",
                ExistingPeriodicWorkPolicy.KEEP,
                workRequest
            )
            // Trigger an immediate read using a OneTimeWorkRequest, or just let JS call sync.
        }

        Function("stopTracking") {
            val context = appContext.reactContext ?: return@Function
            val prefs = StepHelper.getPrefs(context)
            prefs.edit().putBoolean("is_tracking", false).apply()
            
            WorkManager.getInstance(context).cancelUniqueWork("TrknStepWorker")
        }

        Function("getTodaySteps") { ->
            val context = appContext.reactContext ?: return@Function 0L
            val prefs = StepHelper.getPrefs(context)
            return@Function prefs.getLong("today_steps", 0L)
        }

        AsyncFunction("syncSteps") { ->
            val context = appContext.reactContext ?: return@AsyncFunction 0L
            
            val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as android.hardware.SensorManager
            val stepSensor = sensorManager.getDefaultSensor(android.hardware.Sensor.TYPE_STEP_COUNTER)
            if (stepSensor == null) {
                return@AsyncFunction StepHelper.getPrefs(context).getLong("today_steps", 0L)
            }

            val currentSteps = kotlinx.coroutines.withTimeoutOrNull(3000L) {
                kotlinx.coroutines.suspendCancellableCoroutine<Float> { continuation ->
                    val listener = object : android.hardware.SensorEventListener {
                        override fun onSensorChanged(event: android.hardware.SensorEvent?) {
                            if (event != null && event.values.isNotEmpty()) {
                                sensorManager.unregisterListener(this)
                                if (continuation.isActive) {
                                    continuation.resumeWith(Result.success(event.values[0]))
                                }
                            }
                        }
                        override fun onAccuracyChanged(sensor: android.hardware.Sensor?, accuracy: Int) {}
                    }
                    sensorManager.registerListener(listener, stepSensor, android.hardware.SensorManager.SENSOR_DELAY_FASTEST)
                    continuation.invokeOnCancellation { sensorManager.unregisterListener(listener) }
                }
            }

            if (currentSteps != null) {
                StepHelper.processStepCount(context, currentSteps.toLong())
            }
            
            return@AsyncFunction StepHelper.getPrefs(context).getLong("today_steps", 0L)
        }
    }
}
