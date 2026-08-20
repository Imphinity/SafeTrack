package com.example.pompieri.service

import com.example.pompieri.cache.DeviceStateCache
import com.example.pompieri.database.TelemetryDatabaseRepository
import com.example.pompieri.model.DeviceStatus
import com.example.pompieri.model.FirefighterDeviceState
import com.example.pompieri.model.TelemetryPayload
import com.example.pompieri.rules.AnomalyRule
import com.example.pompieri.websocket.FrontendWebSocketHandler
import org.springframework.stereotype.Service

@Service
class TelemetryPipeline(
    private val stateCache: DeviceStateCache,
    private val rules: List<AnomalyRule>,
    private val commandService: DeviceCommandService,
    private val databaseRepository: TelemetryDatabaseRepository,
    private val frontendWebSocketHandler: FrontendWebSocketHandler // Inject the new handler
) {

    fun processIncoming(payload: TelemetryPayload) {
        // 1. Persist raw data asynchronously (to InfluxDB/PostgreSQL)
        databaseRepository.saveAsync(payload)

        // 2. Evaluate all rules
        val activeWarnings = rules.map { it.evaluate(payload) }
            .filter { !it.isPassed }
            .mapNotNull { it.warningMessage }

        // 3. Determine status
        val currentStatus = if (activeWarnings.isNotEmpty()) DeviceStatus.CRITICAL else DeviceStatus.ONLINE

        // 4. Update the Cache for the Frontend
        val updatedState = FirefighterDeviceState(
            deviceId = payload.deviceId,
            firefighterName = "Load From DB",
            lastSeen = payload.timestamp,
            status = currentStatus,
            activeWarnings = activeWarnings,
            latestTelemetry = payload
        )
        stateCache.updateState(updatedState)

        // 5. Broadcast to mobile frontend
        frontendWebSocketHandler.broadcastState(updatedState)

        // 6. Trigger Speaker if Critical
        if (currentStatus == DeviceStatus.CRITICAL) {
            commandService.triggerSpeakerAlarm(payload.deviceId)
        }
    }
}