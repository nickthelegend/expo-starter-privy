import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/Theme';
import { Quest } from '@/constants/Types';
import { ethers } from 'ethers';

interface QuestCardProps {
    quest: Quest;
    onPress: () => void;
}

export function QuestCard({ quest, onPress }: QuestCardProps) {
    const getRarityColor = (rarity: string = 'common') => {
        switch (rarity.toLowerCase()) {
            case 'legendary': return '#FFD700';
            case 'epic': return '#9333EA';
            case 'rare': return '#3B82F6';
            default: return '#6B7280';
        }
    };

    const formattedReward = React.useMemo(() => {
        try {
            return ethers.formatUnits(quest.reward_per_claim || "0", 18);
        } catch {
            return "0";
        }
    }, [quest.reward_per_claim]);

    return (
        <TouchableOpacity style={styles.questCard} onPress={onPress}>
            <View
                style={[
                    styles.rarityBadge,
                    { backgroundColor: getRarityColor(quest.rarity || 'common') },
                ]}
            >
                <Text style={styles.rarityText}>{(quest.rarity || 'COMMON').toUpperCase()}</Text>
            </View>

            <Text style={styles.questName}>{quest.name}</Text>

            <View style={styles.questFooter}>
                <View>
                    <Text style={styles.rewardLabel}>Reward</Text>
                    <Text style={styles.rewardValue}>{formattedReward} KYRA</Text>
                </View>
                <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>
                        {quest.distance ? `📍 ${quest.distance}` : '📍 Global'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    questCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.md,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        marginBottom: Theme.spacing.md,
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
});
