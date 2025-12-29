import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { SearchBar } from '@/components/ui/searchbar';
import { Picker } from '@/components/ui/picker';

const mockQuests = [
    {
        id: '1',
        name: 'Mantle Mystery Hunt',
        description: 'Uncover the hidden secrets of the Mantle ecosystem. Track the signal and find the treasure chest.',
        reward: '500 KYRA',
        rewardType: 'TOKEN',
        location: 'Central Park, NY',
        distance: '0.8km',
        rarity: 'legendary',
        country: 'USA',
        coordinate: { latitude: 40.785091, longitude: -73.968285 },
        type: 'MAP_HUNT',
    },
    {
        id: '2',
        name: 'Neon Nexus Scan',
        description: 'Locate the merchant QR code in Shibuya to claim your limited edition loyalty NFT.',
        reward: 'Rare NFT',
        rewardType: 'NFT',
        location: 'Shibuya, Tokyo',
        distance: '1.2km',
        rarity: 'epic',
        country: 'Japan',
        coordinate: { latitude: 35.658034, longitude: 139.701636 },
        type: 'QR_SCAN',
    },
    {
        id: '3',
        name: 'Airdrop Eligibility',
        description: 'Prove you are a real human using Reclaim Protocol to qualify for the Kyra community airdrop.',
        reward: '1000 KYRA',
        rewardType: 'TOKEN',
        location: 'Global Drop',
        distance: 'Anywhere',
        rarity: 'rare',
        country: 'Global',
        coordinate: { latitude: 0, longitude: 0 },
        type: 'VERIFY_DROP',
    },
];

export default function QuestScreen({ navigation }: { navigation: any }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('ALL');

    const countries = [
        { label: 'All Countries', value: 'ALL' },
        { label: 'USA', value: 'USA' },
        { label: 'UK', value: 'UK' },
        { label: 'UAE', value: 'UAE' },
        { label: 'India', value: 'India' },
        { label: 'Canada', value: 'Canada' },
    ];

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return '#FFD700';
            case 'epic': return '#9333EA';
            case 'rare': return '#3B82F6';
            default: return '#6B7280';
        }
    };

    // Filter quests based on search query and country
    const filteredQuests = useMemo(() => {
        return mockQuests.filter(quest => {
            const matchesSearch = !searchQuery.trim() ||
                quest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quest.location.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCountry = selectedCountry === 'ALL' || quest.country === selectedCountry;

            return matchesSearch && matchesCountry;
        });
    }, [searchQuery, selectedCountry]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
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

                    {/* Search Bar */}
                    <SearchBar
                        placeholder="Search quests, locations, rewards..."
                        onSearch={handleSearch}
                        containerStyle={styles.searchContainer}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />

                    {/* Country Picker */}
                    <Picker
                        options={countries}
                        value={selectedCountry}
                        onValueChange={setSelectedCountry}
                        placeholder='Filter by country...'
                        style={{ marginBottom: Theme.spacing.lg }}
                    />

                    {/* Launch Quest Hero */}
                    <TouchableOpacity
                        style={styles.launchHero}
                        onPress={() => navigation.navigate('Launch')}
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
                        <Text style={styles.sectionSubtitle}>
                            {searchQuery || selectedCountry !== 'ALL' ? `Found ${filteredQuests.length} quest${filteredQuests.length !== 1 ? 's' : ''}` : 'Available Near You'}
                        </Text>
                    </View>
                </View>

                <View style={styles.questList}>
                    {filteredQuests.length > 0 ? (
                        filteredQuests.map((quest) => (
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
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateIcon}>🔍</Text>
                            <Text style={styles.emptyStateTitle}>No quests found</Text>
                            <Text style={styles.emptyStateText}>
                                Try adjusting your search terms or explore different areas
                            </Text>
                        </View>
                    )}
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
        padding: Theme.spacing.md,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 32,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.text,
        marginBottom: Theme.spacing.lg,
    },
    searchContainer: {
        marginBottom: Theme.spacing.lg,
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
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
        paddingHorizontal: Theme.spacing.md,
        paddingBottom: Theme.spacing.xl,
        gap: Theme.spacing.md,
    },
    questCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.md,
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
        fontFamily: Theme.typography.fontFamily.semiBold,
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
        fontFamily: Theme.typography.fontFamily.header,
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
    emptyState: {
        alignItems: 'center',
        paddingVertical: Theme.spacing.xl * 2,
        paddingHorizontal: Theme.spacing.md,
    },
    emptyStateIcon: {
        fontSize: 48,
        marginBottom: Theme.spacing.lg,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.text,
        marginBottom: Theme.spacing.sm,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: Theme.colors.textMuted,
        textAlign: 'center',
        lineHeight: 24,
    },
});
