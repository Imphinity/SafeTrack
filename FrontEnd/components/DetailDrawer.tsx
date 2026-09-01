import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    PanResponder,
    Dimensions,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Firefighter } from '../types/firefighter';
import { useTheme } from '../context/ThemeContext'; // 1. Import the theme hook

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
    const { colors, isDark } = useTheme(); // 2. Grab the current theme colors
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const lastFirefighter = useRef<Firefighter | null>(null);

    if (firefighter) lastFirefighter.current = firefighter;
    const displayData = firefighter || lastFirefighter.current;

    // 3. Moved inside so it can use dynamic theme colors
    const getCardBgColor = (level: string) => {
        if (level === 'CRITICAL') return colors.status.CRITICAL.card;
        if (level === 'WARNING') return colors.status.WARNING.card;
        return colors.status.NORMAL.card;
    };

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

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 5,
            onPanResponderMove: (_, gesture) => {
                if (gesture.dy > 0) translateY.setValue(gesture.dy);
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dy > 120 || gesture.vy > 0.5) {
                    onClose();
                } else {
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

    if (!displayData || !displayData.metrics) return null;

    const overallStatusColors = colors.status[displayData.status] || colors.status.NORMAL;
    const m = displayData.metrics;

    return (
        <Animated.View
            style={[
                styles.drawerContainer,
                {
                    transform: [{ translateY }],
                    backgroundColor: colors.menuBackground // Dynamic Background
                },
            ]}
        >
            <View {...panResponder.panHandlers} style={[styles.dragHeader, { backgroundColor: colors.menuBackground }]}>
                <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
                <View style={styles.headerRow}>
                    <View style={[styles.avatarContainer, { backgroundColor: colors.background }]}>
                        <Ionicons name="person-outline" size={32} color={colors.accentPurple} />
                    </View>
                    <Text style={[styles.nameText, { color: colors.textPrimary }]} numberOfLines={1}>
                        {displayData.name}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: overallStatusColors.badge }]}>
                        <Text style={styles.statusText}>{displayData.status}</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={[styles.metricCard, { backgroundColor: getCardBgColor(m.battery.level) }]}>
                    <Ionicons name="battery-half" size={32} color="#000" />
                    <View style={styles.textStack}>
                        <Text style={styles.metricLabel}>Device Battery</Text>
                        <Text style={styles.metricValueText}>{m.battery.displayValue}</Text>
                    </View>
                </View>

                <View style={[styles.metricCard, { backgroundColor: getCardBgColor(m.heartbeat.level) }]}>
                    <Ionicons name="heart-outline" size={32} color="#000" />
                    <View style={styles.textStack}>
                        <Text style={styles.metricLabel}>Heart Rate</Text>
                        <Text style={styles.metricValueText}>{m.heartbeat.displayValue}</Text>
                    </View>
                </View>

                <View style={[styles.metricCard, { backgroundColor: getCardBgColor(m.spO2.level) }]}>
                    <Ionicons name="water-outline" size={32} color="#000" />
                    <View style={styles.textStack}>
                        <Text style={styles.metricLabel}>Oxygen Saturation</Text>
                        <Text style={styles.metricValueText}>{m.spO2.displayValue}</Text>
                    </View>
                </View>

                <View style={[styles.metricCard, { backgroundColor: getCardBgColor(m.temperature.level) }]}>
                    <Ionicons name="thermometer-outline" size={32} color="#000" />
                    <View style={styles.textStack}>
                        <Text style={styles.metricLabel}>Outside Temperature</Text>
                        <Text style={styles.metricValueText}>{m.temperature.displayValue}</Text>
                    </View>
                </View>

                <View style={[styles.metricCard, { backgroundColor: getCardBgColor(m.airQuality.level) }]}>
                    <Ionicons name="cloud-outline" size={32} color="#000" />
                    <View style={styles.textStack}>
                        <Text style={styles.metricLabel}>Air Quality</Text>
                        <Text style={styles.metricValueText}>{m.airQuality.displayValue}</Text>
                        <Text style={styles.subText}>Gas Level: {m.gasLevel.displayValue}</Text>
                    </View>
                </View>

                <View style={[styles.metricCard, { backgroundColor: getCardBgColor(m.motion.level) }]}>
                    <Ionicons name="walk-outline" size={32} color="#000" />
                    <View style={styles.textStack}>
                        <Text style={styles.metricLabel}>Motion Status</Text>
                        <Text style={styles.metricValueText}>{m.motion.displayValue}</Text>
                    </View>
                </View>
            </ScrollView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    drawerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT * 0.75,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        zIndex: 1000,
    },
    dragHeader: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 10,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    handleBar: {
        width: 50,
        height: 5,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    nameText: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 40,
        gap: 12,
    },
    metricCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 16,
        gap: 16,
    },
    textStack: {
        flex: 1,
    },
    metricLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    metricValueText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#000000',
    },
    subText: {
        fontSize: 12,
        color: '#333333',
        marginTop: 3,
        fontWeight: '500',
    },
});