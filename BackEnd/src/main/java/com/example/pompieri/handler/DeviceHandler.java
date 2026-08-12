package com.example.pompieri.handler;

import com.example.pompieri.model.Command;
import com.example.pompieri.model.SensorData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Handler-ul WebSocket "brut" (fara STOMP) care vorbeste direct cu ESP32.
 * Echivalentul exact al lui wss.on('connection', ...) din exemplul Node.js.
 */
@Component
public class DeviceHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SimpMessagingTemplate messagingTemplate;

    // tine minte conexiunea fiecarui ESP32, dupa deviceId, ca sa putem trimite comenzi tintit
    private final Map<String, WebSocketSession> deviceSessions = new ConcurrentHashMap<>();

    public DeviceHandler(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    private String extractDeviceId(WebSocketSession session) {
        // ruta e /device/{deviceId} -> extragem ultima portiune din URL
        String path = session.getUri().getPath();
        return path.substring(path.lastIndexOf('/') + 1);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String deviceId = extractDeviceId(session);
        deviceSessions.put(deviceId, session);
        System.out.println("Dispozitiv conectat: " + deviceId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String deviceId = extractDeviceId(session);
        String payload = message.getPayload();

        SensorData data = objectMapper.readValue(payload, SensorData.class);
        System.out.println("Am primit de la " + deviceId + ": " + data);

        // 1. Retransmitem catre aplicatie, prin STOMP, pe /topic/pompier/{deviceId}
        messagingTemplate.convertAndSend("/topic/pompier/" + deviceId, data);

        // 2. Verificam pragurile si trimitem comanda inapoi la ESP32 daca e cazul
        if (data.getPuls() != null && data.getPuls() > 100) {
            Command alarm = new Command("ALARMĂ", "PULS_MARE");
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(alarm)));
            System.out.println("-> Am trimis ALARM catre " + deviceId);

            // 3. Anuntam si aplicatia despre alerta (canal separat de alerte)
            messagingTemplate.convertAndSend("/topic/alerte", alarm);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String deviceId = extractDeviceId(session);
        deviceSessions.remove(deviceId);
        System.out.println("Dispozitiv deconectat: " + deviceId);
    }

    /**
     * Metoda utila daca vrei sa trimiti o comanda manuala catre un dispozitiv,
     * de exemplu dintr-un Controller REST apelat de aplicatie.
     */
    public boolean trimiteComanda(String deviceId, Command command) {
        WebSocketSession session = deviceSessions.get(deviceId);
        if (session == null || !session.isOpen()) {
            return false;
        }
        try {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(command)));
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}