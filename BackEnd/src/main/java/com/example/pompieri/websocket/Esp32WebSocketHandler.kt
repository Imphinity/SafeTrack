package com.example.pompieri.websocket

import com.example.pompieri.model.TelemetryPayload
import com.example.pompieri.service.TelemetryPipeline
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.stereotype.Component
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler

@Component
class Esp32WebSocketHandler(
    private val pipeline: TelemetryPipeline,
    private val sessionManager: DeviceSessionManager
) : TextWebSocketHandler() {

    private val mapper = jacksonObjectMapper()

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        // 1. Parse JSON to your TelemetryPayload model
        val payload = mapper.readValue(message.payload, TelemetryPayload::class.java)

        // 2. Save the session so we can talk back to this specific ESP32 later
        sessionManager.registerSession(payload.deviceId, session)

        // 3. Send data into the pipeline (Rules, Cache, DB)
        pipeline.processIncoming(payload)
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: org.springframework.web.socket.CloseStatus) {
        // TODO: iterate over sessionManager map to remove the closed session
        // and optionally update device status to OFFLINE in your state cache
    }
}