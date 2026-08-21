import { StatusLevel } from '../constants/colors';

export type MetricLevel = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface MetricResult {
    displayValue: string;
    level: MetricLevel;
}

export interface EvaluatedMetrics {
    heartbeat: MetricResult;
    spO2: MetricResult;
    temperature: MetricResult;
    gasLevel: MetricResult;
    airQuality: MetricResult;
    motion: MetricResult;
    battery: MetricResult;
}

export interface Firefighter {
    id: string;
    name: string;
    status: StatusLevel | 'OFFLINE'; // Overall status
    metrics: EvaluatedMetrics;       // The new grouped metrics
    lat: number;
    lng: number;
    avatarUrl?: string;
}