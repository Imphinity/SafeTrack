import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface TopHeaderProps {
    searchQuery: string;
    onSearchChange: (text: string) => void;
    onOpenSettings: () => void;
    onProfilePress: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
                                                        searchQuery,
                                                        onSearchChange,
                                                        onOpenSettings,
                                                        onProfilePress,
                                                    }) => {
    return (
        <View style={styles.container}>
            {/* Settings Gear Button */}
            <TouchableOpacity onPress={onOpenSettings} style={styles.iconButton}>
                <Ionicons name="settings-outline" size={26} color={Colors.textPrimary} />
            </TouchableOpacity>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Ionicons name="menu-outline" size={20} color={Colors.textSecondary} style={styles.searchIconLeft} />
                <TextInput
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    placeholder="Hinted search text"
                    placeholderTextColor={Colors.textSecondary}
                    style={styles.searchInput}
                />
                <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
            </View>

            {/* Profile Avatar Button */}
            <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
                <Ionicons name="person-circle-outline" size={32} color={Colors.accentPurple} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.background,
        gap: 10,
    },
    iconButton: {
        padding: 4,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.cardBackground,
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 40,
    },
    searchIconLeft: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: Colors.textPrimary,
    },
    profileButton: {
        padding: 2,
    },
});