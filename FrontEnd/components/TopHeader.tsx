import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext'; // Import the hook

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
    const { colors } = useTheme(); // Grab the dynamic colors

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <TouchableOpacity onPress={onOpenSettings} style={styles.iconButton}>
                <Ionicons name="settings-outline" size={26} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}>
                <Ionicons name="menu-outline" size={20} color={colors.textSecondary} style={styles.searchIconLeft} />
                <TextInput
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    placeholder="Hinted search text"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.searchInput, { color: colors.textPrimary }]}
                />
                <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
            </View>

            <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
                <Ionicons name="person-circle-outline" size={32} color={colors.accentPurple} />
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
        gap: 10,
    },
    iconButton: {
        padding: 4,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
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
    },
    profileButton: {
        padding: 2,
    },
});