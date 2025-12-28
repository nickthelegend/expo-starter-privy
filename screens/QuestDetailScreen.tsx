import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
} from 'react-native';
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
        </View>
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
        fontWeight: '600',
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
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
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
    },
    rewardValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Theme.colors.primary,
    },
    section: {
        marginBottom: Theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.md,
    },
    descriptionText: {
        fontSize: 16,
        color: Theme.colors.textMuted,
        lineHeight: 24,
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
    },
    locationIcon: {
        fontSize: 24,
    },
    locationName: {
        fontSize: 16,
        fontWeight: '600',
        color: Theme.colors.text,
        marginBottom: 2,
    },
    distanceText: {
        fontSize: 12,
        color: Theme.colors.textMuted,
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
        fontWeight: 'bold',
    },
});
