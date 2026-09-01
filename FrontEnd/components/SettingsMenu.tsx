import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable, SafeAreaView, Animated, Dimensions, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SettingsMenuProps {
    visible: boolean;
    onClose: () => void;
}

export function SettingsMenu({ visible, onClose }: SettingsMenuProps) {
    const { isDark, colors, toggleTheme } = useTheme();
    const [showModal, setShowModal] = useState(visible);
    const slideAnim = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx < -40) onClose();
            },
        })
    ).current;

    useEffect(() => {
        if (visible) {
            setShowModal(true);
            Animated.timing(slideAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
        } else {
            Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setShowModal(false));
        }
    }, [visible]);

    if (!showModal) return null;

    const translateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-width * 0.75, 0],
    });

    const backdropOpacity = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <Modal visible={showModal} transparent={true} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <AnimatedPressable style={[styles.backdrop, { opacity: backdropOpacity }]} onPress={onClose} />

                <Animated.View {...panResponder.panHandlers} style={[styles.menuContainer, { transform: [{ translateX }], backgroundColor: colors.menuBackground }]}>
                    <SafeAreaView style={styles.safeArea}>
                        <View style={[styles.header, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Close</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.menuList}>
                            <TouchableOpacity style={[styles.themeButton, { borderColor: colors.border }]} onPress={toggleTheme}>
                                <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={colors.textPrimary} />
                                <Text style={[styles.themeButtonText, { color: colors.textPrimary }]}>
                                    {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'transparent' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
    menuContainer: {
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '75%',
        shadowColor: '#000', shadowOffset: { width: 3, height: 0 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10,
    },
    safeArea: { flex: 1, paddingTop: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1 },
    title: { fontSize: 22, fontWeight: 'bold' },
    closeButton: { padding: 5 },
    menuList: { padding: 20, gap: 16, marginTop: 10 },
    themeButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 8, borderWidth: 1,
    },
    themeButtonText: { fontSize: 16, fontWeight: '600' },
});