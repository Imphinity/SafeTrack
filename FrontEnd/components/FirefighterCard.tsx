import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Firefighter } from '../types/firefighter';
import { useTheme } from '../context/ThemeContext';

interface FirefighterCardProps {
    firefighter: Firefighter;
    onPress: (firefighter: Firefighter) => void;
}

export const FirefighterCard: React.FC<FirefighterCardProps> = ({ firefighter, onPress }) => {
    const { colors, isDark } = useTheme();

    const cardBgColor = colors.status[firefighter.status]?.card || colors.cardBackground;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPress(firefighter)}
            style={[
                styles.cardContainer,
                {
                    backgroundColor: cardBgColor,
                    // The magic fix: layout never changes size, only color
                    borderColor: isDark ? '#333333' : 'transparent',
                    shadowColor: isDark ? 'transparent' : '#000',
                }
            ]}
        >
            <View style={[styles.avatarContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="person-outline" size={24} color={colors.accentPurple} />
            </View>

            <Text style={[styles.nameText, { color: colors.textPrimary }]} numberOfLines={1}>
                {firefighter.name}
            </Text>

            <Text style={[styles.bpmText, { color: colors.textPrimary }]}>
                {firefighter.metrics?.heartbeat?.displayValue || '-- BPM'}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 18,
        marginVertical: 6,
        marginHorizontal: 16,

        // PERMANENT layout properties so Android's shadow renderer doesn't crash
        borderWidth: 1,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    nameText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
    },
    bpmText: {
        fontSize: 16,
        fontWeight: '700',
    },
});