import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    SafeAreaView,
    Animated,
    Dimensions,
    PanResponder,
} from 'react-native';

const { width } = Dimensions.get('window');

// Create an animated Pressable so Android properly registers touches on the backdrop
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SettingsMenuProps {
    visible: boolean;
    onClose: () => void;
    onAddDevice: () => void;
}

export function SettingsMenu({ visible, onClose, onAddDevice }: SettingsMenuProps) {
    const [showModal, setShowModal] = useState(visible);
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Optimized PanResponder for Android touch tracking
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Trigger if swiping left firmly and movement is mostly horizontal
                return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
            },
            onPanResponderRelease: (_, gestureState) => {
                // If dragged left past 40 pixels, close the menu
                if (gestureState.dx < -40) {
                    onClose();
                }
            },
        })
    ).current;

    useEffect(() => {
        if (visible) {
            setShowModal(true);
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                setShowModal(false);
            });
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

                {/* Click-outside backdrop using AnimatedPressable */}
                <AnimatedPressable
                    style={[
                        styles.backdrop,
                        {
                            opacity: backdropOpacity,
                        },
                    ]}
                    onPress={onClose}
                />

                {/* Side Menu Panel */}
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[styles.menuContainer, { transform: [{ translateX }] }]}
                >
                    <SafeAreaView style={styles.safeArea}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Settings</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.menuList}>
                            <TouchableOpacity style={styles.menuButton} onPress={onAddDevice}>
                                <Text style={styles.menuButtonText}>+ Add New Device</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '75%',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 10,
    },
    safeArea: {
        flex: 1,
        paddingTop: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
    },
    closeButton: {
        padding: 5,
    },
    closeText: {
        fontSize: 16,
        color: '#666666',
        fontWeight: '600',
    },
    menuList: {
        padding: 20,
        marginTop: 10,
    },
    menuButton: {
        backgroundColor: '#D32F2F',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    menuButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});