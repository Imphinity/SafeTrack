export type StatusLevel = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

const statusColors = {
    // Replaced the rgba(..., 0.87) with solid hex colors!
    NORMAL: { card: '#67D493', badge: '#14AE5C' },   // Solid Green
    WARNING: { card: '#FFC759', badge: '#E08A00' },  // Solid Yellow
    CRITICAL: { card: '#FF7575', badge: '#D92D2D' }, // Solid Red
    OFFLINE: { card: '#D0D0D0', badge: '#757575' },  // Solid Gray
};

export const lightTheme = {
    background: '#FFFFFF',
    cardBackground: '#F4F5F7',
    textPrimary: '#000000',
    textSecondary: '#687076',
    accentPurple: '#8A5CF5',
    menuBackground: '#FFFFFF',
    border: '#EEEEEE',
    status: statusColors,
};

export const darkTheme = {
    background: '#121212',
    cardBackground: '#1E1E1E',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    accentPurple: '#9D76F6',
    menuBackground: '#2A2A2A',
    border: '#333333',
    status: statusColors,
};

// Fallback for components that haven't been migrated to useTheme yet
export const Colors = lightTheme;