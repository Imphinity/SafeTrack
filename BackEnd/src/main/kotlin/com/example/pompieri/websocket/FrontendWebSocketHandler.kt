package com.example.pompieri.websocket

import com.example.pompieri.service.GeneralService
import com.example.pompieri.service.WSConnectionInterface
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.stereotype.Component
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.util.concurrent.CopyOnWriteArrayList

@Component
class FrontendWebSocketHandler(
    private val sessionManager: DeviceSessionManager,
    //todo: find a way to inject the objectMAPPER, / ADD OJECT MAPPER TO A CONFIG FILE AS A BEAN
) : TextWebSocketHandler(), WSConnectionInterface {

    // Register JavaTimeModule to safely handle Instant variables in FirefighterDeviceState
    private val mapper = jacksonObjectMapper().registerModule(JavaTimeModule())

    // Thread-safe list of active mobile app connections
    //todo: move sessions to their own device session manager
    override fun afterConnectionEstablished(session: WebSocketSession) {
        sessionManager.registerSession(session.id, session)
        println("Frontend dashboard connected: ${session.id}")
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: org.springframework.web.socket.CloseStatus) {
        sessionManager.removeSession(session.id)
        println("Frontend dashboard disconnected: ${session.id}")
    }

    // Broadcast updated state to all connected mobile dashboards
    fun broadcastState(state: Any) {
        val json = mapper.writeValueAsString(state)
        val message = TextMessage(json)

        sessionManager.getAllSessions().values.forEach { session ->
            try {
                session.sendMessage(message)
            } catch (e: Exception) {
                println("Failed to send message to frontend session ${session.id}: ${e.message}")
            }
        }
    }

    override fun sendMessage(sessionId: String, message: String) {
        val session = sessionManager.getSession(sessionId)
        session!!.sendMessage(TextMessage(mapper.writeValueAsString(message)))
    }
}