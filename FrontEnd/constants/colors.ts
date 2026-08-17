export type StatusLevel = 'NORMAL' | 'WARNING' | 'CRITICAL';

export const Colors = {
    background: '#FFFFFF',
    cardBackground: '#F4F5F7',
    textPrimary: '#000000',
    textSecondary: '#687076',
    accentPurple: '#8A5CF5',

    status: {
        NORMAL: {
            card: 'rgba(83, 205, 140, 0.87)',
            badge: '#14AE5C',
        },
        WARNING: {
            card: 'rgba(255, 192, 67, 0.87)',
            badge: '#E08A00',
        },
        CRITICAL: {
            card: 'rgba(255, 90, 90, 0.87)',
            badge: '#D92D2D',
        },
    },
};