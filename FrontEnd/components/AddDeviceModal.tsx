import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

interface AddDeviceModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (deviceId: string, name: string) => void;
}

export function AddDeviceModal({ visible, onClose, onSave }: AddDeviceModalProps) {
    // We now only store the raw number typed by the user
    const [deviceNumber, setDeviceNumber] = useState('');
    const [name, setName] = useState('');

    const handleSave = () => {
        if (deviceNumber.trim() === '' || name.trim() === '') {
            alert('Please fill in both fields.');
            return;
        }

        // Automatically format the number (e.g., "5" becomes "ESP32_05", "12" becomes "ESP32_12")
        const formattedId = `ESP32_${deviceNumber.padStart(2, '0')}`;

        onSave(formattedId, name.trim());

        // Clear the form
        setDeviceNumber('');
        setName('');
    };

    const handleCancel = () => {
        setDeviceNumber('');
        setName('');
        onClose();
    };

    // Only allow numeric characters
    const handleNumberChange = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        setDeviceNumber(numericValue);
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.modalCard}>
                    <Text style={styles.title}>Register New Device</Text>

                    <Text style={styles.label}>Device ID Number</Text>

                    {/* Custom Input Container to show the ESP32_ prefix visually */}
                    <View style={styles.idInputContainer}>
                        <Text style={styles.idPrefix}>ESP32_</Text>
                        <TextInput
                            style={styles.idInput}
                            placeholder="01"
                            placeholderTextColor="#999"
                            value={deviceNumber}
                            onChangeText={handleNumberChange}
                            keyboardType="numeric"
                            maxLength={3} // Prevents them from typing a massive number
                        />
                    </View>

                    <Text style={styles.label}>Firefighter Name</Text>
                    <TextInput
                        style={styles.singleInput}
                        placeholder="e.g. Lt. Anderson"
                        placeholderTextColor="#999"
                        value={name}
                        onChangeText={setName}
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Add Device</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: '85%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 6,
    },
    idInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    idPrefix: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    idInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    singleInput: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
        color: '#333',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#EEEEEE',
        marginRight: 8,
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#D32F2F',
        marginLeft: 8,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});