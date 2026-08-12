package com.example.pompieri.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configurare STOMP peste WebSocket - folosita de APLICATIE (dashboard),
 * NU de ESP32. ESP32 foloseste handler-ul simplu din DeviceWebSocketConfig.
 *
 * Aplicatia se conecteaza la: ws://IP:8080/ws-app
 * Aplicatia se aboneaza la:   /topic/pompier/{deviceId}
 * Aplicatia trimite comenzi manuale la: /app/comanda/{deviceId}
 */
@Configuration
@EnableWebSocketMessageBroker
public class StompConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // broker simplu, in memorie - duce mesajele catre /topic/...
        config.enableSimpleBroker("/topic");
        // mesajele trimise de aplicatie catre server merg prefixate cu /app
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // endpoint-ul la care se conecteaza APLICATIA (browser/React)
        registry.addEndpoint("/ws-app")
                .setAllowedOriginPatterns("*"); // pentru dezvoltare; restrictioneaza in productie
    }
}
