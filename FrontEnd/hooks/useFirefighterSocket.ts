import { useState, useEffect, useRef } from 'react';
import { Firefighter } from '../types/firefighter';

// ⚠️ REPLACE THIS with your Hotspot/USB IPv4 address!
const BACKEND_WS_URL = 'ws://192.168.68.107:8080/ws/device';

export const useFirefighterSocket = () => {
    const [firefighters, setFirefighters] = useState<Record<string, Firefighter>>({});
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Initialize Native Raw WebSocket
        const ws = new WebSocket(BACKEND_WS_URL);

        ws.onopen = () => {
            console.log('✅ Connected to Spring Boot Raw WebSocket (/ws/device)');
        };

        ws.onmessage = (event) => {
            try {
                const sensorData = JSON.parse(event.data);
                handleIncomingData(sensorData);
            } catch (error) {
                console.warn('⚠️ Received non-JSON message:', event.data);
            }
        };

        ws.onerror = (error) => {
            // React Native sometimes hides the exact error inside the event object
            console.error('❌ WebSocket error (Is the IP correct?):', error);
        };

        ws.onclose = (event) => {
            console.log('⚠️ WebSocket connection closed:', event.code, event.reason);
        };

        wsRef.current = ws;

        // Cleanup on unmount
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    // Process raw backend data and determine the status
    const handleIncomingData = (data: any) => {
        setFirefighters((prev) => {
            let status: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';

            // Custom warning/critical thresholds
            if (data.bpm > 140 || data.gasPpm > 2000 || data.movementState === 'Fall Detected') {
                status = 'CRITICAL';
            } else if (data.bpm > 110 || data.gasPpm > 1000 || data.movementState === 'Stationary') {
                status = 'WARNING';
            }

            // Merge new data with existing list
            return {
                ...prev,
                [data.deviceId]: {
                    id: data.deviceId,
                    name: data.name || `Firefighter ${data.deviceId}`,
                    status: status,
                    bpm: data.bpm,
                    gasPpm: data.gasPpm,
                    movementState: data.movementState,
                },
            };
        });
    };

    // Convert the dictionary back to an array for the FlatList
    return Object.values(firefighters);
};