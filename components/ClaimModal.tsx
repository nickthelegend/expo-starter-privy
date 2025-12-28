import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';

interface ClaimModalProps {
    visible: boolean;
    onClose: () => void;
    reward: {
        type: 'XP' | 'TOKEN' | 'NFT';
        amount?: number | string;
        name: string;
        image?: string;
    };
}

const { width } = Dimensions.get('window');

export default function ClaimModal({ visible, onClose, reward }: ClaimModalProps) {
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 7,
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleValue.setValue(0);
            opacityValue.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            opacity: opacityValue,
                            transform: [{ scale: scaleValue }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={Theme.gradients.primary as any}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.header}>
                            <Text style={styles.congratsText}>Awesome!</Text>
                            <Text style={styles.subText}>You've earned a reward</Text>
                        </View>

                        <View style={styles.rewardContainer}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.rewardIcon}>
                                    {reward.image || (reward.type === 'XP' ? '⭐' : reward.type === 'TOKEN' ? '🪙' : '🏆')}
                                </Text>
                            </View>
                            {reward.amount && (
                                <Text style={styles.rewardAmount}>
                                    +{reward.amount} {reward.type === 'TOKEN' ? 'KYRA' : reward.type}
                                </Text>
                            )}
                            <Text style={styles.rewardName}>{reward.name}</Text>
                        </View>

                        <TouchableOpacity style={styles.button} onPress={onClose}>
                            <View style={styles.buttonInner}>
                                <Text style={styles.buttonText}>Collect</Text>
                            </View>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.85,
        borderRadius: Theme.borderRadius.xl,
        overflow: 'hidden', // Ensures gradient respects border radius
        ...Theme.shadows.glow,
    },
    gradient: {
        padding: Theme.spacing.xl,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Theme.spacing.xl,
    },
    congratsText: {
        fontSize: 32,
        fontFamily: Theme.typography.fontFamily.header,
        color: '#FFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    subText: {
        fontSize: 16,
        fontFamily: Theme.typography.fontFamily.medium,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },
    rewardContainer: {
        alignItems: 'center',
        marginBottom: Theme.spacing.xl,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: Theme.borderRadius.lg,
        padding: Theme.spacing.lg,
        width: '100%',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    rewardIcon: {
        fontSize: 40,
    },
    rewardAmount: {
        fontSize: 24,
        fontFamily: Theme.typography.fontFamily.header,
        color: '#FFF',
        marginBottom: 4,
    },
    rewardName: {
        fontSize: 16,
        fontFamily: Theme.typography.fontFamily.medium,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: Theme.borderRadius.lg,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        ...Theme.shadows.medium,
    },
    buttonInner: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.primary,
    },
});
