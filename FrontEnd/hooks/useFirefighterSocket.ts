import { useState, useEffect, useRef } from 'react';
import { Firefighter, EvaluatedMetrics } from '../types/firefighter';

const BACKEND_WS_URL = 'ws://192.168.68.103:8080/ws/frontend';

// Helper to determine exactly WHY they went critical
const getCriticalReason = (metrics: EvaluatedMetrics): string => {
    if (!metrics) return 'Unknown Critical Event';
    if (metrics.motion?.level === 'CRITICAL') return 'Motion Alert (Fall/Immobile)';
    if (metrics.gasLevel?.level === 'CRITICAL') return 'Dangerous Gas Levels Detected';
    if (metrics.airQuality?.level === 'CRITICAL') return 'Toxic Air Quality';
    if (metrics.temperature?.level === 'CRITICAL') return 'Extreme Temperature Danger';
    if (metrics.heartbeat?.level === 'CRITICAL') return 'Abnormal Heart Rate Detected';
    if (metrics.spO2?.level === 'CRITICAL') return 'Critically Low Oxygen';
    if (metrics.battery?.level === 'CRITICAL') return 'Critical Device Battery';
    return 'Critical Safety Warning';
};

export const useFirefighterSocket = (
    onCriticalAlert?: (firefighter: Firefighter, reason: string) => void
) => {
    const [firefighters, setFirefighters] = useState<Record<string, Firefighter>>({});
    const wsRef = useRef<WebSocket | null>(null);

    // We use a ref to remember their last status without triggering re-renders
    const prevStatusRef = useRef<Record<string, string>>({});

    useEffect(() => {
        const ws = new WebSocket(BACKEND_WS_URL);

        ws.onopen = () => console.log('✅ Connected to Spring Boot Frontend WebSocket');

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                let mappedStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE' = 'NORMAL';
                if (data.status === 'CRITICAL') mappedStatus = 'CRITICAL';
                else if (data.status === 'WARNING') mappedStatus = 'WARNING';
                else if (data.status === 'OFFLINE') mappedStatus = 'OFFLINE';

                const displayName = data.firefighterName !== "Load From DB"
                    ? data.firefighterName
                    : `FF-${data.deviceId.split('-').pop()?.toUpperCase() || 'Unknown'}`;

                // --- ALARM TRIGGER LOGIC ---
                // If they are CRITICAL now, but weren't CRITICAL 3 seconds ago:
                const isNewlyCritical = mappedStatus === 'CRITICAL' && prevStatusRef.current[data.deviceId] !== 'CRITICAL';

                if (isNewlyCritical && onCriticalAlert) {
                    const reason = getCriticalReason(data.metrics);
                    // Construct a temporary firefighter object to pass to the UI alert
                    const tempFF: Firefighter = {
                        id: data.deviceId,
                        name: displayName,
                        status: mappedStatus,
                        metrics: data.metrics,
                        lat: data.rawLocation?.lat || 0,
                        lng: data.rawLocation?.lng || 0,
                    };
                    onCriticalAlert(tempFF, reason);
                }

                // Save this new status for the next 3-second cycle
                prevStatusRef.current[data.deviceId] = mappedStatus;

                // Update the main UI State
                setFirefighters((prev) => ({
                    ...prev,
                    [data.deviceId]: {
                        id: data.deviceId,
                        name: displayName,
                        status: mappedStatus,
                        metrics: data.metrics,
                        lat: data.rawLocation?.lat || 0,
                        lng: data.rawLocation?.lng || 0,
                    },
                }));
            } catch (error) {
                console.warn('⚠️ Received non-JSON message:', event.data);
            }
        };

        wsRef.current = ws;
        return () => wsRef.current?.close();
    }, [onCriticalAlert]); // Re-bind if the callback changes

    return Object.values(firefighters);
};