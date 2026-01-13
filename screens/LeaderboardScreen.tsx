import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { usePrivy } from '@privy-io/expo';

interface LeaderboardEntry {
    id: string;
    wallet_address: string;
    username: string | null;
    total_xp: number;
    quests_completed: number;
    rank: number;
    avatar: string;
}

export default function LeaderboardScreen({ navigation }: { navigation: any }) {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { user } = usePrivy();
    const userAddress = user?.wallet?.address;

    const [activeSeason, setActiveSeason] = useState<any>(null);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);

            // 1. Get Active Season
            const { data: season } = await supabase
                .from('seasons')
                .select('*')
                .eq('is_active', true)
                .single();

            if (season) {
                setActiveSeason(season);

                // 2. Fetch Season Stats
                const { data: stats, error } = await supabase
                    .from('season_stats')
                    .select('*')
                    .eq('season_id', season.id)
                    .order('total_xp', { ascending: false })
                    .limit(50);

                if (stats && stats.length > 0) {
                    const formatted = stats.map((item: any, index: number) => ({
                        id: item.player_wallet, // Using wallet as ID for list
                        wallet_address: item.player_wallet,
                        username: null,
                        total_xp: item.total_xp,
                        quests_completed: item.quests_completed,
                        rank: index + 1,
                        avatar: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'
                    }));
                    setLeaderboardData(formatted);
                    return; // Exit if we found season data
                }
            }

            // 3. Fallback: Aggregate All-Time XP if no season data found
            console.log("No season data found, falling back to all-time aggregation.");

            const { data: claims, error } = await supabase
                .from('quest_claims')
                .select('player_wallet, xp_earned');

            if (error) throw error;

            const agg: Record<string, { total_xp: number, quests: number }> = {};

            claims.forEach((claim: any) => {
                const wallet = claim.player_wallet;
                if (!agg[wallet]) agg[wallet] = { total_xp: 0, quests: 0 };
                agg[wallet].total_xp += (claim.xp_earned || 0);
                agg[wallet].quests += 1;
            });

            const sorted = Object.entries(agg)
                .map(([wallet, stats]) => ({
                    id: wallet,
                    wallet_address: wallet,
                    username: null,
                    total_xp: stats.total_xp,
                    quests_completed: stats.quests,
                    avatar: '👤'
                }))
                .sort((a, b) => b.total_xp - a.total_xp)
                .map((item, index) => ({
                    ...item,
                    rank: index + 1,
                    avatar: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'
                }));

            setLeaderboardData(sorted.slice(0, 50));
        } catch (error) {
            console.error('Leaderboard error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeaderboard();
    };

    const renderItem = ({ item }: { item: LeaderboardEntry }) => {
        const isTop3 = item.rank <= 3;
        const isMe = userAddress && item.wallet_address.toLowerCase() === userAddress.toLowerCase();

        return (
            <View style={[
                styles.itemContainer,
                isTop3 && styles.top3Item,
                isMe && styles.meItem
            ]}>
                <View style={styles.rankContainer}>
                    {isTop3 ? (
                        <Text style={styles.rankEmoji}>{item.avatar}</Text>
                    ) : (
                        <Text style={styles.rankNumber}>{item.rank}</Text>
                    )}
                </View>
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, isTop3 && styles.top3Text]}>
                        {item.wallet_address.slice(0, 6)}...{item.wallet_address.slice(-4)}
                        {isMe && " (You)"}
                    </Text>
                    <Text style={styles.subText}>{item.quests_completed} quests</Text>
                </View>
                <LinearGradient
                    colors={isTop3 ? Theme.gradients.primary : ['transparent', 'transparent']}
                    style={styles.scoreBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={[styles.scoreText, isTop3 && { color: '#FFF' }]}>
                        {item.total_xp.toLocaleString()} XP
                    </Text>
                </LinearGradient>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#000000', '#0a0514', '#000000']}
                style={StyleSheet.absoluteFillObject}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={Theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Leaderboard</Text>
                    <View style={{ width: 40 }} />
                </View>

                {leaderboardData.length > 0 && (
                    <View style={styles.podiumContainer}>
                        {/* 2nd Place */}
                        {leaderboardData[1] && (
                            <View style={[styles.podiumColumn, { height: 80, backgroundColor: '#c0c0c0' }]}>
                                <Text style={styles.podiumLabel}>2nd</Text>
                                <Text style={styles.podiumScore}>{leaderboardData[1].total_xp / 1000}k</Text>
                            </View>
                        )}
                        {/* 1st Place */}
                        {leaderboardData[0] && (
                            <View style={[styles.podiumColumn, { height: 120, backgroundColor: '#ffd700' }]}>
                                <Text style={styles.podiumLabel}>1st</Text>
                                <Text style={styles.podiumScore}>{leaderboardData[0].total_xp / 1000}k</Text>
                            </View>
                        )}
                        {/* 3rd Place */}
                        {leaderboardData[2] && (
                            <View style={[styles.podiumColumn, { height: 60, backgroundColor: '#cd7f32' }]}>
                                <Text style={styles.podiumLabel}>3rd</Text>
                                <Text style={styles.podiumScore}>{leaderboardData[2].total_xp / 1000}k</Text>
                            </View>
                        )}
                    </View>
                )}

                <FlatList
                    data={leaderboardData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                    }
                    ListEmptyComponent={
                        !loading ?
                            <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>No players yet. Be the first!</Text> : null
                    }
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.spacing.lg,
        paddingVertical: Theme.spacing.md,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        fontSize: 24,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.text,
    },
    listContent: {
        padding: Theme.spacing.lg,
        paddingBottom: 100,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Theme.spacing.md,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: Theme.borderRadius.md,
        marginBottom: Theme.spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    top3Item: {
        backgroundColor: 'rgba(98, 65, 232, 0.1)',
        borderColor: Theme.colors.primary,
    },
    meItem: {
        borderWidth: 1,
        borderColor: Theme.colors.success,
    },
    rankContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankEmoji: {
        fontSize: 24,
    },
    rankNumber: {
        fontSize: 18,
        fontFamily: Theme.typography.fontFamily.mono,
        color: Theme.colors.textMuted,
    },
    userInfo: {
        flex: 1,
        marginLeft: Theme.spacing.sm,
    },
    userName: {
        fontSize: 16,
        fontFamily: Theme.typography.fontFamily.semiBold,
        color: Theme.colors.text,
    },
    subText: {
        fontSize: 12,
        color: Theme.colors.textMuted,
    },
    top3Text: {
        color: Theme.colors.text,
        fontSize: 18,
    },
    scoreBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    scoreText: {
        fontSize: 14,
        fontFamily: Theme.typography.fontFamily.mono,
        color: Theme.colors.primary,
        fontWeight: 'bold',
    },
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: Theme.spacing.xl,
        gap: 10,
        marginTop: Theme.spacing.md,
        height: 150,
    },
    podiumColumn: {
        width: 70,
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingBottom: 10,
        opacity: 0.9,
    },
    podiumLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    podiumScore: {
        fontSize: 12,
        color: '#000',
        fontWeight: '600'
    }
});
