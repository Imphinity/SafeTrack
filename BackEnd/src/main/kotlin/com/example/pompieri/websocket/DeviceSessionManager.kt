package com.example.pompieri.websocket

import org.springframework.stereotype.Component
import org.springframework.web.socket.WebSocketSession
import java.util.concurrent.ConcurrentHashMap

@Component
class DeviceSessionManager {
    // Maps deviceId -> active WebSocket connection
    private val sessions = ConcurrentHashMap<String, WebSocketSession>()

    fun registerSession(deviceId: String, session: WebSocketSession) {
        sessions[deviceId] = session
    }

    fun getSession(deviceId: String): WebSocketSession? {
        return sessions[deviceId]
    }

    fun getAllSessions(): Map<String, WebSocketSession> {
        return sessions
    }

    fun removeSession(deviceId: String) {
        sessions.remove(deviceId)
    }
}