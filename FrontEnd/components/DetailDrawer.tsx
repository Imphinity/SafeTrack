import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Firefighter } from '../types/firefighter';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DetailDrawerProps {
    visible: boolean;
    firefighter: Firefighter | null;
    onClose: () => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
                                                              visible,
                                                              firefighter,
                                                              onClose,
                                                          }) => {
    // Value to control the sliding animation (starts hidden below the screen)
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    // We keep the last viewed firefighter in memory so the drawer
    // doesn't suddenly go blank while the slide-down animation is playing.
    const lastFirefighter = useRef<Firefighter | null>(null);
    if (firefighter) lastFirefighter.current = firefighter;
    const displayData = firefighter || lastFirefighter.current;

    // Handle slide UP and slide DOWN animations
    useEffect(() => {
        if (visible) {
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                friction: 8,
                tension: 65,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, translateY]);

    // Gesture responder for swiping the drawer down
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            // Only start dragging if the user moves their finger down vertically
            onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 5,
            onPanResponderMove: (_, gesture) => {
                if (gesture.dy > 0) {
                    translateY.setValue(gesture.dy); // Move drawer with finger
                }
            },
            onPanResponderRelease: (_, gesture) => {
                // If dragged down far enough, or swiped fast enough -> Close
                if (gesture.dy > 120 || gesture.vy > 0.5) {
                    onClose();
                } else {
                    // Otherwise, snap it back to the top
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        friction: 8,
                        tension: 65,
                    }).start();
                }
            },
        })
    ).current;

    if (!displayData) return null;

    const statusColors = Colors.status[displayData.status];

    return (
        <Animated.View
            style={[
                styles.drawerContainer,
                { transform: [{ translateY }] },
            ]}
            {...panResponder.panHandlers}
        >
            {/* Visual Handle Bar for dragging */}
            <View style={styles.handleBar} />

            <View style={styles.content}>
                {/* Header Row: Avatar, Name & Status Badge */}
                <View style={styles.headerRow}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person-outline" size={32} color={Colors.accentPurple} />
                    </View>

                    <Text style={styles.nameText} numberOfLines={1}>
                        {displayData.name}
                    </Text>

                    {/* Status Badge Pill */}
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.badge }]}>
                        <Text style={styles.statusText}>{displayData.status}</Text>
                    </View>
                </View>

                {/* Metric Card 1: Heart Rate (BPM) */}
                <View style={[styles.metricCard, { backgroundColor: statusColors.card }]}>
                    <Ionicons name="heart-outline" size={36} color="#000000" />
                    <Text style={styles.metricValueText}>{displayData.bpm} BPM</Text>
                </View>

                {/* Metric Card 2: Gas Level (PPM) */}
                <View style={[styles.metricCard, { backgroundColor: statusColors.card }]}>
                    <Text style={styles.gasSymbolText}>O₂</Text>
                    <Text style={styles.metricValueText}>{displayData.gasPpm} PPM</Text>
                </View>

                {/* Metric Card 3: Movement State */}
                <View style={[styles.metricCard, { backgroundColor: statusColors.card }]}>
                    <Ionicons name="walk-outline" size={36} color="#000000" />
                    <Text style={styles.metricValueText}>{displayData.movementState}</Text>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    drawerContainer: {
        position: 'absolute', // Sits on top of the map/list
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#EAEAEA',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 40, // Safe padding for bottom of screen
        elevation: 20, // High shadow to float above background
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        zIndex: 1000,
    },
    handleBar: {
        width: 50,
        height: 5,
        backgroundColor: '#C5C5C5',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 16,
    },
    content: {
        gap: 14,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    nameText: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: '#000000',
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    metricCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderRadius: 20,
        gap: 20,
    },
    gasSymbolText: {
        fontSize: 26,
        fontWeight: '800',
        color: '#000000',
        width: 36,
        textAlign: 'center',
    },
    metricValueText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000000',
    },
});