package com.example.pompieri.websocket

import com.example.pompieri.cache.DeviceStateCache
import com.example.pompieri.model.DeviceStatus
import com.example.pompieri.model.TelemetryPayload
import com.example.pompieri.service.TelemetryPipeline
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.stereotype.Component
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler

@Component
class Esp32WebSocketHandler(
    private val pipeline: TelemetryPipeline,
    private val sessionManager: DeviceSessionManager,
    private val stateCache: DeviceStateCache,                  // Injected Cache
    private val frontendWebSocketHandler: FrontendWebSocketHandler // Injected Frontend Broadcaster
) : TextWebSocketHandler() {

    // Keep your custom mapper! It safely handles Kotlin data classes and Java Instants.
    private val mapper = jacksonObjectMapper().registerModule(JavaTimeModule())

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        // 1. Parse JSON to your TelemetryPayload model
        val payload = mapper.readValue(message.payload, TelemetryPayload::class.java)

        // 2. Save the session so we can talk back to this specific ESP32 later
        sessionManager.registerSession(payload.deviceId, session)

        // 3. Send data into the pipeline (Rules, Cache, DB)
        pipeline.processIncoming(payload)
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: org.springframework.web.socket.CloseStatus) {
        // Find which device just disconnected by matching the session ID
        // and remove it from the manager to prevent memory leaks.
        val deviceIdToRemove = sessionManager.getAllSessions()
            .entries
            .find { it.value.id == session.id }
            ?.key

        if (deviceIdToRemove != null) {
            sessionManager.removeSession(deviceIdToRemove)

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
}