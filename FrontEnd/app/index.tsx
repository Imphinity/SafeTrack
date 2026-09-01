import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // NEW: Imported for the map markers
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // NEW: Map components

import { TopHeader } from '../components/TopHeader';
import { FirefighterCard } from '../components/FirefighterCard';
import { DetailDrawer } from '../components/DetailDrawer';
import { SettingsMenu } from '../components/SettingsMenu';
import { Firefighter } from '../types/firefighter';
import { useTheme } from '../context/ThemeContext';
import { CriticalAlarmModal } from '../components/CriticalAlarmModal';
import { useFirefighterSocket } from '../hooks/useFirefighterSocket';

export default function DashboardScreen() {
    const { colors, isDark } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFirefighter, setSelectedFirefighter] = useState<Firefighter | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [alarmState, setAlarmState] = useState<{ visible: boolean, firefighter: Firefighter | null, reason: string }>({
        visible: false,
        firefighter: null,
        reason: ''
    });

    const handleCriticalAlert = (ff: Firefighter, reason: string) => {
        setIsDrawerOpen(false);
        setIsSettingsOpen(false);
        setAlarmState({ visible: true, firefighter: ff, reason });
    };

    const liveFirefighters = useFirefighterSocket(handleCriticalAlert);

    const filteredFirefighters = liveFirefighters.filter((firefighter) =>
        firefighter.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectFirefighter = (firefighter: Firefighter) => {
        setSelectedFirefighter(firefighter);
        setIsDrawerOpen(true);
    };

    const activeFirefighterData = selectedFirefighter
        ? liveFirefighters.find((f) => f.id === selectedFirefighter.id) || selectedFirefighter
        : null;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            <TopHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onProfilePress={() => console.log('Open Profile/Login')}
            />

            <View style={styles.listContainer}>
                <FlatList
                    data={filteredFirefighters}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <FirefighterCard
                            firefighter={item}
                            onPress={handleSelectFirefighter}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            </View>

            {/* --- NEW LIVE MAP AREA --- */}
            {/* --- NEW LIVE MAP AREA --- */}
            <View style={[styles.mapArea, { borderTopColor: colors.border }]}>
                <MapView
                    // 1. REMOVED the provider line!
                    // 2. Swapped absoluteFillObject for explicit 100% dimensions
                    style={{ width: '100%', height: '100%' }}
                    initialRegion={{
                        latitude: 46.7712,
                        longitude: 23.6236,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                >
                    {filteredFirefighters.map((ff) => {
                        const badgeColor = colors.status[ff.status]?.badge || colors.status.NORMAL.badge;
                        return (
                            <Marker
                                key={ff.id}
                                coordinate={{ latitude: ff.lat, longitude: ff.lng }}
                                title={ff.name}
                                description={`Status: ${ff.status}`}
                                onPress={() => handleSelectFirefighter(ff)}
                            >
                                <View style={[styles.markerPin, { backgroundColor: badgeColor }]}>
                                    <Ionicons name="flame" size={16} color="#FFFFFF" />
                                </View>
                            </Marker>
                        );
                    })}
                </MapView>
            </View>

            <DetailDrawer
                visible={isDrawerOpen}
                firefighter={activeFirefighterData}
                onClose={() => setIsDrawerOpen(false)}
            />

            <SettingsMenu
                visible={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            <CriticalAlarmModal
                visible={alarmState.visible}
                firefighter={alarmState.firefighter}
                reason={alarmState.reason}
                onClose={() => setAlarmState(prev => ({ ...prev, visible: false }))}
                onOpenDetails={() => {
                    setAlarmState(prev => ({ ...prev, visible: false }));
                    if (alarmState.firefighter) {
                        handleSelectFirefighter(alarmState.firefighter);
                    }
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingVertical: 8,
    },
    mapArea: {
        height: 320,
        borderTopWidth: 1,
        overflow: 'hidden', // Ensures the map doesn't bleed out of the container
    },
    markerPin: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
});