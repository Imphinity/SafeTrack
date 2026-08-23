package com.example.pompieri.websocket

import org.springframework.stereotype.Component
import org.springframework.web.socket.WebSocketSession
import java.util.concurrent.ConcurrentHashMap

@Component
class FrontendSessionManager {
    // Maps sessionId -> active React Native Dashboard connection
    private val sessions = ConcurrentHashMap<String, WebSocketSession>()

    fun registerSession(sessionId: String, session: WebSocketSession) {
        sessions[sessionId] = session
    }

    fun getSession(sessionId: String): WebSocketSession? = sessions[sessionId]
    fun getAllSessions(): Map<String, WebSocketSession> = sessions
    fun removeSession(sessionId: String) { sessions.remove(sessionId) }
}