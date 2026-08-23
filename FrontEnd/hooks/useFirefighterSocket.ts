import { useState, useEffect, useRef } from 'react';
import { Firefighter } from '../types/firefighter';

// Pointing to the dedicated frontend endpoint
const BACKEND_WS_URL = 'ws://192.168.68.103:8080/ws/frontend';

export const useFirefighterSocket = () => {
    const [firefighters, setFirefighters] = useState<Record<string, Firefighter>>({});
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(BACKEND_WS_URL);

        ws.onopen = () => {
            console.log('✅ Connected to Spring Boot Frontend WebSocket (/ws/frontend)');
        };

        ws.onmessage = (event) => {
            try {
                // The incoming message is now the full FirefighterDeviceState from Kotlin
                const deviceState = JSON.parse(event.data);
                handleIncomingState(deviceState);
            } catch (error) {
                console.warn('⚠️ Received non-JSON message:', event.data);
            }
        };

        ws.onerror = (error) => {
            console.error('❌ WebSocket error (Is the IP correct?):', error);
        };

        ws.onclose = (event) => {
            console.log('⚠️ WebSocket connection closed:', event.code, event.reason);
        };

        wsRef.current = ws;

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const handleIncomingState = (data: any) => {
        setFirefighters((prev) => {
            // Map backend status (ONLINE/WARNING/CRITICAL/OFFLINE) to frontend
            let mappedStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE' = 'NORMAL';
            if (data.status === 'CRITICAL') {
                mappedStatus = 'CRITICAL';
            } else if (data.status === 'WARNING') {
                mappedStatus = 'WARNING';
            } else if (data.status === 'OFFLINE') {
                mappedStatus = 'OFFLINE';
            }

            // Format name nicely if database hasn't loaded a real name yet
            const displayName = data.firefighterName !== "Load From DB"
                ? data.firefighterName
                : `FF-${data.deviceId.split('-').pop()?.toUpperCase() || 'Unknown'}`;

            return {
                ...prev,
                [data.deviceId]: {
                    id: data.deviceId,
                    name: displayName,
                    status: mappedStatus,
                    metrics: data.metrics, // Direct injection of evaluated backend metrics
                    lat: data.rawLocation?.lat || 0,
                    lng: data.rawLocation?.lng || 0,
                },
            };
        });
    };

    return Object.values(firefighters);
};