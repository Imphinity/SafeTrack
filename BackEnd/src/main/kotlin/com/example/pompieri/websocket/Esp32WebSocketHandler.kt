package com.example.pompieri.websocket

import com.example.pompieri.model.TelemetryPayload
import com.example.pompieri.service.GeneralService
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.stereotype.Component
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler

private const val DEVICE_NAME = "device_name"

@Component
class Esp32WebSocketHandler(
    private val pipeline: GeneralService,
    private val sessionManager: DeviceSessionManager,
) : TextWebSocketHandler() {

        private val mapper = jacksonObjectMapper().registerModule(JavaTimeModule())

    override fun afterConnectionEstablished(session: WebSocketSession){
        // 1. Save the session so we can talk back to this specific ESP32 later
         sessionManager.registerSession(session.handshakeHeaders.get(DEVICE_NAME).toString(), session)
    }

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        // 1. Parse JSON to your TelemetryPayload model
        val payload = mapper.readValue(message.payload, TelemetryPayload::class.java)
        payload.deviceId = session.handshakeHeaders.get(DEVICE_NAME).toString()

        // 2. Send data into the pipeline (Rules, Cache, DB)
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
            pipeline.processConnectionLoss(deviceIdToRemove)
        }
    }
}