import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Firefighter } from '../types/firefighter';

interface FirefighterCardProps {
    firefighter: Firefighter;
    onPress: (firefighter: Firefighter) => void;
}

export const FirefighterCard: React.FC<FirefighterCardProps> = ({
                                                                    firefighter,
                                                                    onPress,
                                                                }) => {
    // Get dynamic background color based on status
    const cardBgColor = Colors.status[firefighter.status].card;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPress(firefighter)}
            style={[styles.cardContainer, { backgroundColor: cardBgColor }]}
        >
            {/* Avatar Icon Container */}
            <View style={styles.avatarContainer}>
                <Ionicons name="person-outline" size={24} color={Colors.accentPurple} />
            </View>

            {/* Name */}
            <Text style={styles.nameText} numberOfLines={1}>
                {firefighter.name}
            </Text>

            {/* BPM Metric */}
            <Text style={styles.bpmText}>
                {firefighter.bpm} BPM
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
        // Soft shadow for visual depth
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    nameText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
    },
    bpmText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
    },
});