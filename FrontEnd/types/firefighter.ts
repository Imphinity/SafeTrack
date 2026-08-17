import { StatusLevel } from '../constants/colors';

export interface Firefighter {
    id: string;
    name: string;
    status: StatusLevel;
    bpm: number;
    gasPpm: number;
    movementState: string; // e.g., "Moving..", "Stationary", "Fall Detected"
    avatarUrl?: string;
}