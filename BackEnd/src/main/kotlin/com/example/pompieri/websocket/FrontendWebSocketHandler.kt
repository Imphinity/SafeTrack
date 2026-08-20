package com.example.pompieri.websocket

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.stereotype.Component
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.util.concurrent.CopyOnWriteArrayList

@Component
class FrontendWebSocketHandler : TextWebSocketHandler() {

    // Register JavaTimeModule to safely handle Instant variables in FirefighterDeviceState
    private val mapper = jacksonObjectMapper().registerModule(JavaTimeModule())

    // Thread-safe list of active mobile app connections
    private val sessions = CopyOnWriteArrayList<WebSocketSession>()

    override fun afterConnectionEstablished(session: WebSocketSession) {
        sessions.add(session)
        println("Frontend dashboard connected: ${session.id}")
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: org.springframework.web.socket.CloseStatus) {
        sessions.remove(session)
        println("Frontend dashboard disconnected: ${session.id}")
    }

    // Broadcast updated state to all connected mobile dashboards
    fun broadcastState(state: Any) {
        val json = mapper.writeValueAsString(state)
        val message = TextMessage(json)

        sessions.filter { it.isOpen }.forEach { session ->
            try {
                session.sendMessage(message)
            } catch (e: Exception) {
                println("Failed to send message to frontend session ${session.id}: ${e.message}")
            }
        }
    }
}