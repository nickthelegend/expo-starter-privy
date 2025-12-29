import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { ParallaxScrollView } from '@/components/ui/parallax-scrollview';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { LootBoxModal } from '@/components/LootBoxModal';

export default function QuestDetailScreen({ route, navigation }: { route: any, navigation: any }) {
    const { quest } = route.params;
    const [showLootBox, setShowLootBox] = React.useState(false);

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return '#FFD700';
            case 'epic': return '#9333EA';
            case 'rare': return '#3B82F6';
            default: return '#10B981';
        }
    };

    // Use a placeholder image for quests if not provided
    const questImage = quest.image || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80';

    const needsVerification = quest.verificationType && quest.verificationType !== 'NONE';

    return (
        <View style={styles.container}>
            <ParallaxScrollView
                headerHeight={300}
                headerImage={
                    <Image
                        source={{ uri: questImage }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit='cover'
                    />
                }
            >
                <View style={styles.content}>
                    <View style={styles.topInfo}>
                        <View
                            style={[
                                styles.rarityBadge,
                                { backgroundColor: getRarityColor(quest.rarity) },
                            ]}
                        >
                            <Text style={styles.rarityText}>{quest.rarity.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.distanceText}>📍 {quest.distance}</Text>
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
                        <Text style={styles.sectionTitle}>Quest Objective</Text>
                        <Text style={styles.descriptionText}>{quest.description}</Text>
                    </View>

                    {quest.type === 'MAP_HUNT' && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Location Information</Text>
                            <View style={styles.locationCard}>
                                <View style={styles.locationInfoMain}>
                                    <Text style={styles.locationName}>{quest.location}</Text>
                                    <Text style={styles.countryText}>{quest.country || 'Region Unknown'}</Text>
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
                                    scrollEnabled={true}
                                    zoomEnabled={true}
                                    customMapStyle={[
                                        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                                        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                                        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
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
                                            contentFit="contain"
                                        />
                                    </Marker>
                                </MapView>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={() => {
                            if (quest.type === 'QR_SCAN') {
                                // Simulate completion for now
                                navigation.navigate('Scan');
                                // In a real app, Scan screen would report back success
                            } else if (quest.type === 'MAP_HUNT') {
                                navigation.navigate('QMap', { quest });
                                // In a real app, QMap would report back reaching destination
                            } else if (quest.type === 'VERIFY_DROP') {
                                setShowLootBox(true);
                            }
                        }}
                    >
                        <LinearGradient
                            colors={Theme.gradients.primary as any}
                            style={styles.startGradient}
                        >
                            <Text style={styles.startButtonText}>
                                {quest.type === 'QR_SCAN' ? 'Scan QR Code' :
                                    quest.type === 'MAP_HUNT' ? 'Start Tracking' :
                                        'Claim Airdrop'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ParallaxScrollView>

            {/* Floating Back Button */}
            <TouchableOpacity
                style={styles.floatingBackButton}
                onPress={() => navigation.goBack()}
            >
                <View style={styles.backButtonInner}>
                    <Text style={styles.backIcon}>←</Text>
                </View>
            </TouchableOpacity>

            <LootBoxModal
                visible={showLootBox}
                questName={quest.name}
                onClose={() => setShowLootBox(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    content: {
        padding: Theme.spacing.md,
    },
    topInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
    },
    rarityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    rarityText: {
        fontSize: 12,
        fontFamily: Theme.typography.fontFamily.semiBold,
        color: Theme.colors.text,
    },
    distanceText: {
        fontSize: 14,
        color: Theme.colors.textMuted,
        fontFamily: Theme.typography.fontFamily.medium,
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
        padding: Theme.spacing.md,
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
        backgroundColor: Theme.colors.surface,
        padding: Theme.spacing.md,
        borderRadius: Theme.borderRadius.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        marginBottom: Theme.spacing.md,
    },
    locationInfoMain: {
        gap: 2,
    },
    locationName: {
        fontSize: 16,
        fontFamily: Theme.typography.fontFamily.semiBold,
        color: Theme.colors.text,
    },
    countryText: {
        fontSize: 14,
        color: Theme.colors.textMuted,
        fontFamily: Theme.typography.fontFamily.regular,
    },
    mapContainer: {
        height: 200,
        borderRadius: Theme.borderRadius.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    map: {
        width: '100%',
        height: '100%',
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
    floatingBackButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    backButtonInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    verificationCard: {
        backgroundColor: 'rgba(98, 65, 232, 0.1)',
        padding: Theme.spacing.md,
        borderRadius: Theme.borderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(98, 65, 232, 0.3)',
        marginBottom: Theme.spacing.lg,
    },
    verificationTitle: {
        fontSize: 16,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.text,
        marginBottom: 4,
    },
    verificationDesc: {
        fontSize: 14,
        color: Theme.colors.textMuted,
        fontFamily: Theme.typography.fontFamily.regular,
        marginBottom: Theme.spacing.md,
    },
    errorContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 10,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        flex: 1,
        fontFamily: Theme.typography.fontFamily.medium,
    },
    startButtonDisabled: {
        opacity: 0.8,
    },
});
