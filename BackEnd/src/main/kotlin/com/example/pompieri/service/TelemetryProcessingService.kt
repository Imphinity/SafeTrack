package com.example.pompieri.service

import com.example.pompieri.cache.DeviceStateCache
import com.example.pompieri.database.TelemetryDatabaseRepository
import com.example.pompieri.evaluation.MetricEvaluator
import com.example.pompieri.model.*
import com.example.pompieri.websocket.FrontendWebSocketHandler
import org.springframework.stereotype.Service

@Service
class TelemetryProcessingService(
    private val stateCache: DeviceStateCache,
    private val commandService: DeviceCommandService,
    private val databaseRepository: TelemetryDatabaseRepository,
    private val frontendWebSocketHandler: FrontendWebSocketHandler,

    private val evaluators: List<MetricEvaluator>
) {

    fun processIncoming(payload: TelemetryPayload) {
        // 1. Persist raw data
        databaseRepository.saveAsync(payload)

        // 2. Run all evaluations dynamically
        val evaluatedMetricsMap = mutableMapOf<String, MetricResult>()
        val activeWarnings = mutableListOf<String>()
        var isCritical = false
        var isWarning = false

        evaluators.forEach { evaluator ->
            val result = evaluator.evaluate(payload)
            evaluatedMetricsMap[evaluator.metricId] = result

            if (result.level == MetricLevel.CRITICAL) isCritical = true
            if (result.level == MetricLevel.WARNING) isWarning = true

            if (result.level != MetricLevel.NORMAL) {
                activeWarnings.add("${evaluator.displayName} is ${result.level}: ${result.displayValue}")
            }
        }

        // 3. Determine overall status
        val currentStatus = when {
            isCritical -> DeviceStatus.CRITICAL
            isWarning -> DeviceStatus.WARNING
            else -> DeviceStatus.ONLINE
        }

        // 4. Build final state using the Map
        val updatedState = FirefighterDeviceState(
            deviceId = payload.deviceId,
            firefighterName = "Load From DB",
            lastSeen = payload.timestamp,
            status = currentStatus,
            activeWarnings = activeWarnings,
            metrics = evaluatedMetricsMap,
            rawLocation = payload.location
        )

        // 5. Push to Frontend
        stateCache.updateState(updatedState)
        frontendWebSocketHandler.broadcastState(updatedState)

        // 6. Trigger Speaker Alarm if Critical
        if (currentStatus == DeviceStatus.CRITICAL) {
            commandService.triggerSpeakerAlarm(payload.deviceId)
        }
    }

    fun processConnectionLoss(deviceIdToRemove: String) {
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