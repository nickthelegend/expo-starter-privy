import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';

const { width } = Dimensions.get('window');

const mockQuests = [
    {
        id: '1',
        name: 'Downtown Explorer',
        reward: '100 KYRA',
        rewardType: 'TOKEN',
        distance: '0.5 km',
        rarity: 'rare',
        description: 'Explore the heart of the city and discover hidden gems.',
        location: 'Central Plaza, Downtown',
    },
    {
        id: '2',
        name: 'Mystery NFT Drop',
        reward: 'Rare NFT',
        rewardType: 'NFT',
        distance: '1.2 km',
        rarity: 'epic',
        description: 'A mysterious signal has been detected. Investigate the location to claim a rare artifact.',
        location: 'Old Lighthouse, Shoreline',
    },
    {
        id: '3',
        name: 'Community Quest',
        reward: '50 XP',
        rewardType: 'XP',
        distance: '2.1 km',
        rarity: 'common',
        description: 'Help the local community by completing simple tasks.',
        location: 'Community Center, Eastside',
    },
];

export default function QuestScreen({ navigation }: { navigation: any }) {
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
                colors={['#000000', '#0a0514', '#000000']}
                style={StyleSheet.absoluteFillObject}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Quests</Text>

                    {/* Launch Quest Hero */}
                    <TouchableOpacity
                        style={styles.launchHero}
                        onPress={() => navigation.navigate('Scan')}
                    >
                        <LinearGradient
                            colors={Theme.gradients.primary as any}
                            style={styles.launchGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.launchContent}>
                                <View>
                                    <Text style={styles.launchTitle}>Launch Nearby Quest</Text>
                                    <Text style={styles.launchSubtitle}>Scan to discover hidden items</Text>
                                </View>
                                <View style={styles.launchButtonInner}>
                                    <Text style={styles.launchIcon}>🚀</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.sectionDivider}>
                        <Text style={styles.sectionSubtitle}>Available Near You</Text>
                    </View>
                </View>

                <View style={styles.questList}>
                    {mockQuests.map((quest) => (
                        <TouchableOpacity
                            key={quest.id}
                            style={styles.questCard}
                            onPress={() => navigation.navigate('QuestDetail', { quest })}
                        >
                            <View
                                style={[
                                    styles.rarityBadge,
                                    { backgroundColor: getRarityColor(quest.rarity) },
                                ]}
                            >
                                <Text style={styles.rarityText}>{quest.rarity.toUpperCase()}</Text>
                            </View>

                            <Text style={styles.questName}>{quest.name}</Text>

                            <View style={styles.questFooter}>
                                <View>
                                    <Text style={styles.rewardLabel}>Reward</Text>
                                    <Text style={styles.rewardValue}>{quest.reward}</Text>
                                </View>
                                <View style={styles.distanceBadge}>
                                    <Text style={styles.distanceText}>📍 {quest.distance}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: Theme.spacing.lg,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 32,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.text,
        marginBottom: Theme.spacing.lg,
    },
    launchHero: {
        borderRadius: Theme.borderRadius.lg,
        overflow: 'hidden',
        marginBottom: Theme.spacing.xl,
        ...Theme.shadows.glow,
    },
    launchGradient: {
        padding: Theme.spacing.xl,
    },
    launchContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    launchTitle: {
        fontSize: 22,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.text,
        marginBottom: 4,
    },
    launchSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        fontFamily: Theme.typography.fontFamily.medium,
    },
    launchButtonInner: {
        width: 50,
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    launchIcon: {
        fontSize: 24,
    },
    sectionDivider: {
        marginBottom: Theme.spacing.md,
    },
    sectionSubtitle: {
        fontSize: 18,
        fontFamily: Theme.typography.fontFamily.semiBold,
        color: Theme.colors.textMuted,
    },
    questList: {
        paddingHorizontal: Theme.spacing.lg,
        paddingBottom: Theme.spacing.xl,
        gap: Theme.spacing.md,
    },
    questCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.lg,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    rarityBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: Theme.spacing.sm,
    },
    rarityText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    questName: {
        fontSize: 20,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.text,
        marginBottom: Theme.spacing.md,
    },
    questFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    rewardLabel: {
        fontSize: 12,
        color: Theme.colors.textMuted,
        marginBottom: 2,
    },
    rewardValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Theme.colors.primary,
    },
    distanceBadge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    distanceText: {
        fontSize: 14,
        color: Theme.colors.textMuted,
    },
});
