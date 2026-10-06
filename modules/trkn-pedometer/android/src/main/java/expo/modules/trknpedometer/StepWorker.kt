package expo.modules.trknpedometer

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withTimeoutOrNull
import kotlin.coroutines.resume

class StepWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val sensorManager = applicationContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
            ?: return Result.success()

        val currentSteps = withTimeoutOrNull(5000L) {
            suspendCancellableCoroutine<Float> { continuation ->
                val listener = object : SensorEventListener {
                    override fun onSensorChanged(event: SensorEvent?) {
                        if (event != null && event.values.isNotEmpty()) {
                            sensorManager.unregisterListener(this)
                            if (continuation.isActive) {
                                continuation.resume(event.values[0])
                            }
                        }
                    }
                    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
                }
                sensorManager.registerListener(listener, stepSensor, SensorManager.SENSOR_DELAY_FASTEST)
                continuation.invokeOnCancellation {
                    sensorManager.unregisterListener(listener)
                }
            }
        }

        if (currentSteps != null) {
            StepHelper.processStepCount(applicationContext, currentSteps.toLong())
        }

        return Result.success()
    }
}
