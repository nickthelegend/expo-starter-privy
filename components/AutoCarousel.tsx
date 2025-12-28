import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Animated,
    NativeSyntheticEvent,
    NativeScrollEvent
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_GAP = 16;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

interface Quest {
    id: string;
    name: string;
    reward: string;
    rewardType: 'TOKEN' | 'NFT' | 'XP';
    distance: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    expiresAt: string;
}

interface AutoCarouselProps {
    data: Quest[];
}

export default function AutoCarousel({ data }: AutoCarouselProps) {
    const navigation = useNavigation<any>();
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);

    // Auto-scroll logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isAutoScrolling) {
            interval = setInterval(() => {
                let nextIndex = currentIndex + 1;
                if (nextIndex >= data.length) {
                    nextIndex = 0;
                }

                scrollViewRef.current?.scrollTo({
                    x: nextIndex * SNAP_INTERVAL,
                    animated: true,
                });
                setCurrentIndex(nextIndex);
            }, 3000); // Scroll every 3 seconds
        }

        return () => clearInterval(interval);
    }, [currentIndex, isAutoScrolling, data.length]);

    const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const position = event.nativeEvent.contentOffset.x;
        const index = Math.round(position / SNAP_INTERVAL);
        setCurrentIndex(index);
        // Resume auto-scroll after a short delay if user interacted
        setIsAutoScrolling(true);
    };

    const onScrollBeginDrag = () => {
        setIsAutoScrolling(false);
    };

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
            <Animated.ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled={false} // Disable pagingEnabled to use snapToInterval correctly
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                contentContainerStyle={styles.carousel}
                onScrollBeginDrag={onScrollBeginDrag}
                onMomentumScrollEnd={onMomentumScrollEnd}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {data.map((quest, index) => {
                    // Add some simple interpolation for scale effect
                    const inputRange = [
                        (index - 1) * SNAP_INTERVAL,
                        index * SNAP_INTERVAL,
                        (index + 1) * SNAP_INTERVAL,
                    ];

                    const scale = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.95, 1, 0.95],
                        extrapolate: 'clamp',
                    });

                    return (
                        <TouchableOpacity
                            key={quest.id}
                            activeOpacity={0.9}
                            onPress={() => navigation.navigate('Scan')}
                        >
                            <Animated.View style={[styles.questCard, { width: CARD_WIDTH, transform: [{ scale }] }]}>
                                <View style={styles.questHeader}>
                                    <View
                                        style={[
                                            styles.rarityBadge,
                                            { backgroundColor: getRarityColor(quest.rarity) },
                                        ]}
                                    >
                                        <Text style={styles.rarityText}>{quest.rarity.toUpperCase()}</Text>
                                    </View>
                                    <Text style={styles.questExpiry}>{quest.expiresAt}</Text>
                                </View>

                                <Text style={styles.questName}>{quest.name}</Text>

                                <View style={styles.questFooter}>
                                    <View>
                                        <Text style={styles.rewardLabel}>Reward</Text>
                                        <Text style={styles.rewardValue}>{quest.reward}</Text>
                                    </View>
                                    <View style={styles.distanceContainer}>
                                        <Text style={styles.distance}>📍 {quest.distance}</Text>
                                    </View>
                                </View>

                                <LinearGradient
                                    colors={['transparent', 'rgba(98, 65, 232, 0.1)']}
                                    style={styles.questGradient}
                                />
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // Container styles if needed
    },
    carousel: {
        paddingRight: 16, // Padding for the last item
        paddingLeft: 0,
    },
    questCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.lg,
        marginRight: 16,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        overflow: 'hidden',
        height: 180, // Fixed height for consistency
        justifyContent: 'space-between',
    },
    questHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
    },
    rarityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    rarityText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    questExpiry: {
        fontSize: 12,
        color: Theme.colors.textMuted,
    },
    questName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.lg,
    },
    questFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    rewardLabel: {
        fontSize: 12,
        color: Theme.colors.textMuted,
        marginBottom: 4,
    },
    rewardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Theme.colors.primary,
    },
    distanceContainer: {
        backgroundColor: 'rgba(98, 65, 232, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    distance: {
        fontSize: 14,
        color: Theme.colors.text,
    },
    questGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
});
