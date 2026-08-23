package com.example.pompieri.websocket

import com.example.pompieri.model.TelemetryPayload
import com.example.pompieri.service.TelemetryProcessingService
import com.example.pompieri.service.WSConnectionInterface
import com.fasterxml.jackson.databind.ObjectMapper // <-- Import this
import org.springframework.stereotype.Component
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler

private const val DEVICE_NAME = "device_name"

@Component
class Esp32WebSocketHandler(
    private val telemetryProcessingService: TelemetryProcessingService,
    private val sessionManager: DeviceSessionManager,
    private val mapper: ObjectMapper // <-- Injected here!
) : TextWebSocketHandler(), WSConnectionInterface {

    override fun afterConnectionEstablished(session: WebSocketSession){
        // 1. Save the session so we can talk back to this specific ESP32 later
         sessionManager.registerSession(session.handshakeHeaders.get(DEVICE_NAME).toString(), session)
    }

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        // 1. Parse JSON to your TelemetryPayload model
        val payload = mapper.readValue(message.payload, TelemetryPayload::class.java)
        payload.deviceId = session.handshakeHeaders.get(DEVICE_NAME).toString()

        // 2. Send data into the pipeline (Rules, Cache, DB)
        telemetryProcessingService.processIncoming(payload)
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: org.springframework.web.socket.CloseStatus) {
        // Find which device just disconnected by matching the session ID
        // and remove it from the manager to prevent memory leaks.
        val deviceIdToRemove = session.handshakeHeaders.get(DEVICE_NAME).toString()

        sessionManager.removeSession(deviceIdToRemove)
        telemetryProcessingService.processConnectionLoss(deviceIdToRemove)
    }

    override fun sendMessage(sessionId: String, message: String) {
        val session = sessionManager.getSession(sessionId)
        session!!.sendMessage(TextMessage(mapper.writeValueAsString(message)))
    }
}