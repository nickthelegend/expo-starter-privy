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
                    <Text style={styles.headerTitle}>Active Quests</Text>
                    <View style={styles.questSummary}>
                        <LinearGradient
                            colors={['#6241E8', '#9333EA']}
                            style={styles.summaryGradient}
                        >
                            <Text style={styles.summaryCount}>{mockQuests.length}</Text>
                            <Text style={styles.summaryLabel}>Quests Available</Text>
                        </LinearGradient>
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
        fontSize: 28,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.lg,
    },
    questSummary: {
        borderRadius: Theme.borderRadius.lg,
        overflow: 'hidden',
        height: 120,
        marginBottom: Theme.spacing.md,
    },
    summaryGradient: {
        flex: 1,
        padding: Theme.spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryCount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    summaryLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
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
        fontWeight: 'bold',
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
