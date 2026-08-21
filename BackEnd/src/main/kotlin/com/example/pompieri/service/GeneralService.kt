package com.example.pompieri.service

import com.example.pompieri.cache.DeviceStateCache
import com.example.pompieri.database.TelemetryDatabaseRepository
import com.example.pompieri.evaluation.*
import com.example.pompieri.model.*
import com.example.pompieri.websocket.FrontendWebSocketHandler
import org.springframework.stereotype.Service

@Service
class GeneralService(
    private val stateCache: DeviceStateCache,
    private val commandService: DeviceCommandService,
    private val databaseRepository: TelemetryDatabaseRepository,
    private val frontendWebSocketHandler: FrontendWebSocketHandler,

    // Injecting our clean, dedicated evaluators
    // classes injected based on name. if changed, must specify in another way what bean to inject
    private val heartbeatEvaluator: MetricEvaluator,
    private val spO2Evaluator: MetricEvaluator,
    private val temperatureEvaluator: MetricEvaluator,
    private val gasLevelEvaluator: MetricEvaluator,
    private val airQualityEvaluator: MetricEvaluator,
    private val motionEvaluator: MetricEvaluator,
    private val batteryEvaluator: MetricEvaluator

//    private val evaluators: List<MetricEvaluator>
) {

    fun processIncoming(payload: TelemetryPayload) {
        // 1. Persist raw data
        databaseRepository.saveAsync(payload)

        // 2. Run all evaluations
        val evaluatedMetrics = EvaluatedMetrics(
            heartbeat = heartbeatEvaluator.evaluate(payload),
            spO2 = spO2Evaluator.evaluate(payload),
            temperature = temperatureEvaluator.evaluate(payload),
            gasLevel = gasLevelEvaluator.evaluate(payload),
            airQuality = airQualityEvaluator.evaluate(payload),
            motion = motionEvaluator.evaluate(payload),
            battery = batteryEvaluator.evaluate(payload)
        )

        // 3. Compile Active Warnings dynamically
        val activeWarnings = mutableListOf<String>()
        val allResults = listOf(
            "Heartbeat" to evaluatedMetrics.heartbeat,
            "SpO2" to evaluatedMetrics.spO2,
            "Temp" to evaluatedMetrics.temperature,
            "Gas" to evaluatedMetrics.gasLevel,
            "Motion" to evaluatedMetrics.motion,
            "Battery" to evaluatedMetrics.battery
        )

        allResults.forEach { (name, result) ->
            if (result.level != MetricLevel.NORMAL) {
                activeWarnings.add("$name is ${result.level}: ${result.displayValue}")
            }
        }

        // 4. Determine overall status based on the evaluations
        val currentStatus = when {
            allResults.any { it.second.level == MetricLevel.CRITICAL } -> DeviceStatus.CRITICAL
            allResults.any { it.second.level == MetricLevel.WARNING } -> DeviceStatus.WARNING
            else -> DeviceStatus.ONLINE
        }

        // 5. Build final state
        val updatedState = FirefighterDeviceState(
            deviceId = payload.deviceId,
            firefighterName = "Load From DB",
            lastSeen = payload.timestamp,
            status = currentStatus,
            activeWarnings = activeWarnings,
            metrics = evaluatedMetrics,
            rawLocation = payload.location
        )

        // 6. Push to Frontend
        stateCache.updateState(updatedState)
        frontendWebSocketHandler.broadcastState(updatedState)

        // 7. Trigger Speaker Alarm if Critical
        if (currentStatus == DeviceStatus.CRITICAL) {
            commandService.triggerSpeakerAlarm(payload.deviceId)
        }
    }

    fun processConnectionLoss(deviceIdToRemove : String) {

        // Look up the last known state
        val lastState = stateCache.getLatestState(deviceIdToRemove)
        if (lastState != null) {
            // Change status to OFFLINE, update cache, and alert the frontend
            val offlineState = lastState.copy(status = DeviceStatus.OFFLINE)
            stateCache.updateState(offlineState)
            frontendWebSocketHandler.broadcastState(offlineState)
        }
        println("Device disconnected and marked OFFLINE: $deviceIdToRemove")

    }
}