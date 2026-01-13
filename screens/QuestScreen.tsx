import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { SearchBar } from '@/components/ui/searchbar';
import { Picker } from '@/components/ui/picker';
import { supabase } from '@/lib/supabase';
import { Quest } from '@/constants/Types';
import { QuestCard } from '@/components/QuestCard';
import * as Location from 'expo-location';
import LinkScreen from '@/screens/ShopScreen';
import { getDistance } from 'geolib';

export default function QuestScreen({ navigation }: { navigation: any }) {
    const [activeTab, setActiveTab] = useState<'QUESTS' | 'SHOP'>('QUESTS');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('ALL');
    const [quests, setQuests] = useState<Quest[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

    const countries = [
        { label: 'All Countries', value: 'ALL' },
        { label: 'USA', value: 'USA' },
        { label: 'UK', value: 'UK' },
        { label: 'UAE', value: 'UAE' },
        { label: 'India', value: 'India' },
        { label: 'Japan', value: 'Japan' },
    ];

    const fetchQuests = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('quests')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Calculate distances if location available
            const questsWithDistance = data.map((q: any) => {
                let distanceStr = '';
                let distanceVal = 0;

                if (userLocation && q.metadata?.latitude && q.metadata?.longitude) {
                    const dist = getDistance(
                        { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude },
                        { latitude: q.metadata.latitude, longitude: q.metadata.longitude }
                    );
                    distanceVal = dist;
                    distanceStr = dist < 1000
                        ? `${dist}m`
                        : `${(dist / 1000).toFixed(1)}km`;
                } else {
                    distanceStr = q.quest_type === 'map' ? 'Map Quest' : 'Global';
                }

                return {
                    ...q,
                    distance: distanceStr,
                    distanceVal: distanceVal,
                    rarity: q.metadata?.rarity || 'common',
                    country: q.metadata?.country || 'Global',
                };
            });

            setQuests(questsWithDistance);
        } catch (error) {
            console.error('Error fetching quests:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                setUserLocation(location);
            }
            fetchQuests();
        })();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchQuests();
    }, [userLocation]);

    // Filter quests
    const filteredQuests = useMemo(() => {
        return quests.filter(quest => {
            const matchesSearch = !searchQuery.trim() ||
                quest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (quest.description && quest.description.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCountry = selectedCountry === 'ALL' || (quest as any).country === selectedCountry;

            return matchesSearch && matchesCountry;
        });
    }, [searchQuery, selectedCountry, quests]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#000000', '#0a0514', '#000000']}
                style={StyleSheet.absoluteFillObject}
            />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                }
            >
                <View style={styles.header}>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'QUESTS' && styles.tabActive]}
                            onPress={() => setActiveTab('QUESTS')}
                        >
                            <Text style={[styles.tabText, activeTab === 'QUESTS' && styles.tabTextActive]}>Quests</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'SHOP' && styles.tabActive]}
                            onPress={() => setActiveTab('SHOP')}
                        >
                            <Text style={[styles.tabText, activeTab === 'SHOP' && styles.tabTextActive]}>Shop</Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'QUESTS' ? (
                        <>
                            <SearchBar
                                placeholder="Search quests, locations, rewards..."
                                onSearch={setSearchQuery}
                                containerStyle={styles.searchContainer}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />

                            <Picker
                                options={countries}
                                value={selectedCountry}
                                onValueChange={setSelectedCountry}
                                placeholder='Filter by country...'
                                style={{ marginBottom: Theme.spacing.lg }}
                            />

                            {/* Launch Quest Hero - Keeps navigation to Launch screen if defined */}
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
                                    {searchQuery ? `Found ${filteredQuests.length} results` : 'Available Near You'}
                                </Text>
                            </View>

                        </View>
                </>
                    ) : null}
        </View>

                {
        activeTab === 'QUESTS' ? (
            <View style={styles.questList}>
                {loading && !refreshing ? (
                    <Text style={{ color: 'white', textAlign: 'center' }}>Loading quests...</Text>
                ) : filteredQuests.length > 0 ? (
                    filteredQuests.map((quest) => (
                        <QuestCard
                            key={quest.id}
                            quest={quest}
                            onPress={() => navigation.navigate('QuestDetail', { quest })}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>🔍</Text>
                        <Text style={styles.emptyStateTitle}>No quests found</Text>
                        <Text style={styles.emptyStateText}>
                            Check back later or try a different filter.
                        </Text>
                    </View>
                )}
            </View>
        ) : (
            <LinkScreen />
        )
    }
            </ScrollView >
        </View >
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
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabActive: {
        backgroundColor: Theme.colors.surface,
        ...Theme.shadows.glow,
    },
    tabText: {
        color: Theme.colors.textMuted,
        fontWeight: '600',
    },
    tabTextActive: {
        color: Theme.colors.text,
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
