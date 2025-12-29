import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    FadeIn,
    FadeOut,
    ZoomIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withSequence,
    withDelay
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface LootBoxModalProps {
    visible: boolean;
    onClose: () => void;
    questName: string;
}

type Rarity = 'COMMON' | 'RARE' | 'LEGENDARY';

export const LootBoxModal: React.FC<LootBoxModalProps> = ({ visible, onClose, questName }) => {
    const [status, setStatus] = useState<'IDLE' | 'OPENING' | 'REVEALED'>('IDLE');
    const [reward, setReward] = useState<{ amount: string, rarity: Rarity } | null>(null);

    const scale = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            setStatus('IDLE');
            setReward(null);
            // Pre-calculate reward
            const rand = Math.random();
            if (rand < 0.05) {
                setReward({ amount: '5000 KYRA', rarity: 'LEGENDARY' });
            } else if (rand < 0.3) {
                setReward({ amount: '1000 KYRA', rarity: 'RARE' });
            } else {
                setReward({ amount: '200 KYRA', rarity: 'COMMON' });
            }
        }
    }, [visible]);

    const handleOpen = () => {
        if (status !== 'IDLE') return;

        setStatus('OPENING');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        scale.value = withSequence(
            withSpring(1.2),
            withSpring(0.8),
            withSpring(1)
        );

        setTimeout(() => {
            setStatus('REVEALED');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 1500);
    };

    const getRarityColor = (rarity: Rarity) => {
        switch (rarity) {
            case 'LEGENDARY': return '#FFD700';
            case 'RARE': return '#00D1FF';
            default: return '#4ADE80';
        }
    };

    const rarityStyles = reward ? { color: getRarityColor(reward.rarity) } : {};

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <View style={styles.overlay}>
                <LinearGradient
                    colors={['rgba(0,0,0,0.85)', 'rgba(30,20,60,0.95)', 'rgba(0,0,0,0.85)']}
                    style={StyleSheet.absoluteFillObject}
                />

                {status === 'IDLE' && (
                    <Animated.View
                        entering={FadeIn.duration(500)}
                        style={styles.idleContainer}
                    >
                        <Text style={styles.congratsText}>Quest Complete!</Text>
                        <Text style={styles.subText}>{questName}</Text>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleOpen}
                            style={styles.chestContainer}
                        >
                            <LottieView
                                source={require('@/assets/lottie/quest.json')}
                                autoPlay
                                loop
                                style={styles.lottie}
                            />
                            <View style={styles.tapPrompt}>
                                <Text style={styles.tapText}>TAP TO UNBOX</Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {status === 'OPENING' && (
                    <View style={styles.openingContainer}>
                        <LottieView
                            source={require('@/assets/lottie/quest.json')}
                            autoPlay={false}
                            progress={0.5}
                            style={styles.lottie}
                        />
                        <Text style={styles.openingText}>Opening Mystery Chest...</Text>
                    </View>
                )}

                {status === 'REVEALED' && reward && (
                    <Animated.View
                        entering={ZoomIn.springify()}
                        style={styles.revealedContainer}
                    >
                        <View style={[styles.glowEffect, { shadowColor: getRarityColor(reward.rarity) }]} />

                        <Text style={[styles.rarityLabel, rarityStyles]}>
                            {reward.rarity} REWARD
                        </Text>

                        <View style={styles.rewardCard}>
                            <Text style={styles.rewardEmoji}>
                                {reward.rarity === 'LEGENDARY' ? '💎' : reward.rarity === 'RARE' ? '💰' : '🪙'}
                            </Text>
                            <Text style={styles.rewardAmount}>{reward.amount}</Text>
                        </View>

                        <Text style={styles.addedToText}>Added to your Mantle Wallet</Text>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <LinearGradient
                                colors={Theme.gradients.primary as any}
                                style={styles.closeGradient}
                            >
                                <Text style={styles.closeButtonText}>GET IT</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    idleContainer: {
        alignItems: 'center',
    },
    congratsText: {
        fontSize: 32,
        fontFamily: Theme.typography.fontFamily.header,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    subText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 8,
        fontFamily: Theme.typography.fontFamily.medium,
    },
    chestContainer: {
        width: 300,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    lottie: {
        width: '100%',
        height: '100%',
    },
    tapPrompt: {
        position: 'absolute',
        bottom: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    tapText: {
        color: '#FFFFFF',
        letterSpacing: 2,
        fontSize: 12,
        fontFamily: Theme.typography.fontFamily.semiBold,
    },
    openingContainer: {
        alignItems: 'center',
    },
    openingText: {
        color: '#FFFFFF',
        fontSize: 18,
        marginTop: 20,
        fontFamily: Theme.typography.fontFamily.medium,
    },
    revealedContainer: {
        alignItems: 'center',
        width: '100%',
    },
    glowEffect: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 50,
        backgroundColor: 'transparent',
    },
    rarityLabel: {
        fontSize: 14,
        letterSpacing: 3,
        fontFamily: Theme.typography.fontFamily.semiBold,
        marginBottom: 20,
    },
    rewardCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 40,
        borderRadius: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        width: width * 0.7,
    },
    rewardEmoji: {
        fontSize: 64,
        marginBottom: 20,
    },
    rewardAmount: {
        fontSize: 36,
        color: '#FFFFFF',
        fontFamily: Theme.typography.fontFamily.header,
    },
    addedToText: {
        color: 'rgba(255,255,255,0.4)',
        marginTop: 20,
        fontSize: 14,
    },
    closeButton: {
        marginTop: 60,
        width: width * 0.6,
        height: 56,
    },
    closeGradient: {
        flex: 1,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: Theme.typography.fontFamily.semiBold,
    },
});
