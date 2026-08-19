import { useState, useEffect, useRef } from 'react';
import { Firefighter } from '../types/firefighter';

// Try this if you are plugged in via USB and Windows Firewall is OFF
const BACKEND_WS_URL = 'ws://10.0.2.2:8080/ws/device';

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

            // Safely extract nested data from your exact JSON structure
            const currentBpm = data.health?.heartRate || 0;
            const currentGas = data.environment?.gasPpm || 0;

            // Since motion is raw accelerometer data (ax, ay, az), we will default to 'Active' for now.
            // Later, you can add math here to detect falls if 'az' drops suddenly!
            const currentState = 'Active';

            // Custom warning/critical thresholds
            if (currentBpm > 140 || currentGas > 2000) {
                status = 'CRITICAL';
            } else if (currentBpm > 110 || currentGas > 1000) {
                status = 'WARNING';
            }

            // Merge new data with existing list to trigger Auto-Detection
            return {
                ...prev,
                [data.deviceId]: {
                    id: data.deviceId,
                    // Extract just the last part of the ID for a cleaner name (e.g., "01" from "firefighter-alpha-01")
                    name: `FF-${data.deviceId.split('-').pop()?.toUpperCase() || 'Unknown'}`,
                    status: status,
                    bpm: currentBpm,
                    gasPpm: currentGas,
                    movementState: currentState,
                },
            };
        });
    };

    // Convert the dictionary back to an array for the FlatList
    return Object.values(firefighters);
};