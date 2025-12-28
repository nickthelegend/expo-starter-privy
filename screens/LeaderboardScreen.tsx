import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface LeaderboardScreenProps {
    navigation: any;
}

const leaderboardData = [
    { id: '1', name: 'CryptoKnight', score: '25,400 XP', rank: 1, avatar: '🥇' },
    { id: '2', name: 'MantleMaster', score: '22,150 XP', rank: 2, avatar: '🥈' },
    { id: '3', name: 'Web3Wanderer', score: '19,800 XP', rank: 3, avatar: '🥉' },
    { id: '4', name: 'ChainExplorer', score: '15,200 XP', rank: 4, avatar: '👤' },
    { id: '5', name: 'TokenHunter', score: '12,450 XP', rank: 5, avatar: '👤' },
    { id: '6', name: 'QuestSeb', score: '10,100 XP', rank: 6, avatar: '👤' },
    { id: '7', name: 'PixelPilot', score: '8,900 XP', rank: 7, avatar: '👤' },
    { id: '8', name: 'BlockBuilder', score: '7,500 XP', rank: 8, avatar: '👤' },
];

export default function LeaderboardScreen({ navigation }: LeaderboardScreenProps) {
    const renderItem = ({ item }: { item: typeof leaderboardData[0] }) => {
        const isTop3 = item.rank <= 3;
        return (
            <View style={[styles.itemContainer, isTop3 && styles.top3Item]}>
                <View style={styles.rankContainer}>
                    {isTop3 ? (
                        <Text style={styles.rankEmoji}>{item.avatar}</Text>
                    ) : (
                        <Text style={styles.rankNumber}>{item.rank}</Text>
                    )}
                </View>
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, isTop3 && styles.top3Text]}>{item.name}</Text>
                </View>
                <LinearGradient
                    colors={isTop3 ? Theme.gradients.primary : ['transparent', 'transparent']}
                    style={styles.scoreBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={[styles.scoreText, isTop3 && { color: '#FFF' }]}>{item.score}</Text>
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

                <View style={styles.podiumContainer}>
                    {/* Simple Podium Visual */}
                    <View style={[styles.podiumColumn, { height: 80, backgroundColor: '#cd7f32' }]}>
                        <Text style={styles.podiumRank}>3</Text>
                    </View>
                    <View style={[styles.podiumColumn, { height: 120, backgroundColor: '#ffd700' }]}>
                        <Text style={styles.podiumRank}>1</Text>
                    </View>
                    <View style={[styles.podiumColumn, { height: 100, backgroundColor: '#c0c0c0' }]}>
                        <Text style={styles.podiumRank}>2</Text>
                    </View>
                </View>

                <FlatList
                    data={leaderboardData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
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
    },
    podiumColumn: {
        width: 60,
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingTop: 10,
        opacity: 0.8,
    },
    podiumRank: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    }
});
