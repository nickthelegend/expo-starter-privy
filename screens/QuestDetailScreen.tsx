import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
    Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';

const { width } = Dimensions.get('window');

export default function QuestDetailScreen({ route, navigation }: { route: any, navigation: any }) {
    const { quest } = route.params;

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return '#FFD700';
            case 'epic': return '#9333EA';
            case 'rare': return '#3B82F6';
            default: return '#6B7280';
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#000000', '#0a0514', '#000000'] as any}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View
                        style={[
                            styles.rarityBadge,
                            { backgroundColor: getRarityColor(quest.rarity) },
                        ]}
                    >
                        <Text style={styles.rarityText}>{quest.rarity.toUpperCase()}</Text>
                    </View>

                    <Text style={styles.title}>{quest.name}</Text>

                    <View style={styles.rewardContainer}>
                        <LinearGradient
                            colors={['#181121', '#241a2f'] as any}
                            style={styles.rewardCard}
                        >
                            <Text style={styles.rewardLabel}>QUEST REWARD</Text>
                            <Text style={styles.rewardValue}>{quest.reward}</Text>
                        </LinearGradient>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{quest.description}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Location Information</Text>
                        <View style={styles.locationCard}>
                            <Text style={styles.locationIcon}>📍</Text>
                            <View>
                                <Text style={styles.locationName}>{quest.location}</Text>
                                <Text style={styles.distanceText}>{quest.distance} from your current location</Text>
                            </View>
                        </View>

                        <View style={styles.mapContainer}>
                            <MapView
                                provider={PROVIDER_GOOGLE}
                                style={styles.map}
                                initialRegion={{
                                    latitude: quest.coordinate?.latitude || 37.78825,
                                    longitude: quest.coordinate?.longitude || -122.4324,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                customMapStyle={[
                                    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                                    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                                    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                                    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
                                ]}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: quest.coordinate?.latitude || 37.78825,
                                        longitude: quest.coordinate?.longitude || -122.4324,
                                    }}
                                >
                                    <Image
                                        source={require('@/assets/images/treasure_chest.png')}
                                        style={{ width: 40, height: 40 }}
                                        resizeMode="contain"
                                    />
                                </Marker>
                            </MapView>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.startButton}>
                        <LinearGradient
                            colors={Theme.gradients.primary as any}
                            style={styles.startGradient}
                        >
                            <Text style={styles.startButtonText}>Start Quest</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        paddingHorizontal: Theme.spacing.lg,
        paddingVertical: Theme.spacing.md,
    },
    backButton: {
        paddingVertical: 8,
    },
    backButtonText: {
        color: Theme.colors.text,
        fontSize: 16,
        fontFamily: Theme.typography.fontFamily.medium,
    },
    content: {
        paddingHorizontal: Theme.spacing.lg,
    },
    rarityBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
    },
    rarityText: {
        fontSize: 12,
        fontFamily: Theme.typography.fontFamily.semiBold,
        color: Theme.colors.text,
    },
    title: {
        fontSize: 32,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.text,
        marginBottom: Theme.spacing.lg,
    },
    rewardContainer: {
        marginBottom: Theme.spacing.xl,
    },
    rewardCard: {
        padding: Theme.spacing.lg,
        borderRadius: Theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        alignItems: 'center',
    },
    rewardLabel: {
        fontSize: 12,
        color: Theme.colors.textMuted,
        letterSpacing: 1.5,
        marginBottom: 8,
        fontFamily: Theme.typography.fontFamily.medium,
    },
    rewardValue: {
        fontSize: 24,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.primary,
    },
    section: {
        marginBottom: Theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.text,
        marginBottom: Theme.spacing.md,
    },
    descriptionText: {
        fontSize: 16,
        color: Theme.colors.textMuted,
        lineHeight: 24,
        fontFamily: Theme.typography.fontFamily.regular,
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.surface,
        padding: Theme.spacing.md,
        borderRadius: Theme.borderRadius.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        gap: Theme.spacing.md,
        marginBottom: Theme.spacing.md,
    },
    mapContainer: {
        height: 150,
        borderRadius: Theme.borderRadius.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    locationIcon: {
        fontSize: 24,
    },
    locationName: {
        fontSize: 16,
        fontFamily: Theme.typography.fontFamily.semiBold,
        color: Theme.colors.text,
        marginBottom: 2,
    },
    distanceText: {
        fontSize: 12,
        color: Theme.colors.textMuted,
        fontFamily: Theme.typography.fontFamily.regular,
    },
    startButton: {
        borderRadius: Theme.borderRadius.md,
        overflow: 'hidden',
        marginTop: Theme.spacing.lg,
        marginBottom: Theme.spacing.xl,
    },
    startGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    startButtonText: {
        color: Theme.colors.text,
        fontSize: 18,
        fontFamily: Theme.typography.fontFamily.header,
    },
});
