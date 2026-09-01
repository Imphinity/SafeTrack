import React from 'react';
import { Modal, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Firefighter } from '../types/firefighter';
import { Colors } from '../constants/colors';

interface CriticalAlarmModalProps {
    visible: boolean;
    firefighter: Firefighter | null;
    reason: string;
    onClose: () => void;
    onOpenDetails: () => void;
}

export const CriticalAlarmModal: React.FC<CriticalAlarmModalProps> = ({
                                                                          visible,
                                                                          firefighter,
                                                                          reason,
                                                                          onClose,
                                                                          onOpenDetails
                                                                      }) => {
    if (!firefighter) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            {/* The outer Pressable acts as the full-screen background. Clicking it triggers onClose. */}
            <Pressable style={styles.overlay} onPress={onClose}>

                {/* The Bubble itself. TouchableOpacity catches the tap so it doesn't pass through to the background */}
                <TouchableOpacity
                    style={styles.bubble}
                    activeOpacity={0.8}
                    onPress={onOpenDetails}
                >
                    {/* Increased icon size to 80 */}
                    <Ionicons name="warning" size={80} color="#FFFFFF" style={styles.icon} />

                    {/* Reduced name size to 22 */}
                    <Text style={styles.nameText}>{firefighter.name}</Text>
                    <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>

            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bubble: {
        backgroundColor: Colors.status.CRITICAL.badge,
        borderRadius: 24,
        padding: 32,
        width: '75%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 15,
    },
    icon: {
        marginBottom: 16,
    },
    nameText: {
        fontSize: 22, // Was 26
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    reasonText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '600',
        textAlign: 'center',
    }
});