import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopHeader } from '../components/TopHeader';
import { FirefighterCard } from '../components/FirefighterCard';
import { DetailDrawer } from '../components/DetailDrawer';
import { Firefighter } from '../types/firefighter';
import { Colors } from '../constants/colors';

// Sample mock data demonstrating all status states (Normal, Warning, Critical)
const MOCK_FIREFIGHTERS: Firefighter[] = [
    {
        id: '1',
        name: 'John Doe',
        status: 'NORMAL',
        bpm: 80,
        gasPpm: 800,
        movementState: 'Moving..',
    },
    {
        id: '2',
        name: 'Jane Smith',
        status: 'WARNING',
        bpm: 115,
        gasPpm: 1200,
        movementState: 'Stationary',
    },
    {
        id: '3',
        name: 'Alex Johnson',
        status: 'CRITICAL',
        bpm: 155,
        gasPpm: 2500,
        movementState: 'Fall Detected',
    },
    {
        id: '4',
        name: 'Michael Brown',
        status: 'NORMAL',
        bpm: 76,
        gasPpm: 450,
        movementState: 'Moving..',
    },
];

export default function DashboardScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFirefighter, setSelectedFirefighter] = useState<Firefighter | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Real-time search filter
    const filteredFirefighters = MOCK_FIREFIGHTERS.filter((firefighter) =>
        firefighter.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectFirefighter = (firefighter: Firefighter) => {
        setSelectedFirefighter(firefighter);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Top Header Navigation */}
            <TopHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenSettings={() => console.log('Open Settings Drawer')}
                onProfilePress={() => console.log('Open Profile/Login')}
            />

            {/* Middle: Scrollable Firefighter List */}
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

            {/* Bottom: Placeholder Map Area */}
            <View style={styles.mapArea}>
                <Text style={styles.mapText}>MAP HERE</Text>
            </View>

            {/* Bottom Detail Drawer */}
            <DetailDrawer
                visible={isDrawerOpen}
                firefighter={selectedFirefighter}
                onClose={handleCloseDrawer}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingVertical: 8,
    },
    mapArea: {
        height: 320,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#D0D0D0',
    },
    mapText: {
        fontSize: 22,
        fontWeight: '300',
        letterSpacing: 3,
        color: '#666666',
        transform: [{ rotate: '-25deg' }],
    },
});