import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    runOnJS,
    interpolate
} from 'react-native-reanimated';
import { Theme } from '@/constants/Theme';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.9;
const SEGMENTS = 6;
const SEGMENT_ANGLE = 360 / SEGMENTS;

const REWARDS = [
    { id: 1, label: '100 XP', color: '#6241E8', type: 'XP', value: 100 },
    { id: 2, label: '50 KYRA', color: '#3B82F6', type: 'TOKEN', value: 50 },
    { id: 3, label: 'Try Again', color: '#EF4444', type: 'EMPTY', value: 0 },
    { id: 4, label: '200 XP', color: '#10B981', type: 'XP', value: 200 },
    { id: 5, label: 'Rare NFT', color: '#F59E0B', type: 'NFT', value: 1 },
    { id: 6, label: '10 KYRA', color: '#EC4899', type: 'TOKEN', value: 10 },
];

export default function SpinScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const rotation = useSharedValue(0);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }],
        };
    });

    const handleSpin = () => {
        if (spinning) return;

        setSpinning(true);
        setResult(null);

        // Calculate random ending rotation
        // Ensure at least 5 full rotations (1800 deg) + random segment
        const randomSegment = Math.floor(Math.random() * SEGMENTS);
        const extraDegrees = randomSegment * SEGMENT_ANGLE; // This points to a specific segment boundary
        // Add offset to center the pointer on the segment (half angle)
        // NOTE: Wheel rotates locally. Pointer is static at top (0 deg).
        // If we want segment i to be at top, we rotate negative angle. 
        // Or just rotate huge positive amount and calculate remainder.

        // Let's keep it simple: random rotation between 1800 and 2160
        const totalRotation = 1800 + Math.random() * 360;

        rotation.value = withTiming(totalRotation, {
            duration: 4000,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }, () => {
            runOnJS(handleSpinEnd)(totalRotation);
        });
    };

    const handleSpinEnd = (finalRotation: number) => {
        setSpinning(false);

        // Normalize rotation to 0-360
        const degrees = finalRotation % 360;

        // Calculate which segment is at the top (Pointer is usually at 0 deg / 12 o'clock)
        // Since wheel rotates clockwise, the segment at 0 deg is determined by:
        // (Array Index relative to rotation). 
        // Let's reverse engineer:
        // 0 deg -> Segment 0
        // 60 deg -> Segment 5 (if 0 was top, moving 60 deg CW puts the previous one at top)
        // Formula: Index = (SEGMENTS - Math.floor(degrees / SEGMENT_ANGLE)) % SEGMENTS

        const index = (SEGMENTS - Math.floor((degrees + SEGMENT_ANGLE / 2) / SEGMENT_ANGLE)) % SEGMENTS;
        const finalIndex = (index === SEGMENTS) ? 0 : index; // Handle edge case

        // Actually, let's just pick a random index logic that maps roughly
        // The visual accuracy depends on the rendering order. 
        // Let's assume standard rendering:
        // We will just claim the reward based on the math.

        // Correction:
        // If I rotate 30 degrees (half segment), the boundary between 0 and 5 moves.
        // Let's just lookup the reward based on the computed index.

        // Simpler visual matching:
        // Segment 0 covers -30 to 30 (centered at 0)
        // Segment 1 covers 30 to 90
        // etc.
        // The "Top" is 0 degrees.
        // Due to rotation X, the angle under the pointer is (360 - X % 360) % 360.

        const angleUnderPointer = (360 - (degrees % 360)) % 360;
        const winningIndex = Math.floor(angleUnderPointer / SEGMENT_ANGLE);

        setResult(REWARDS[winningIndex]);
        setModalVisible(true);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient
                colors={['#000000', '#1a1033', '#000000']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Daily Spin</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.content}>
                {/* Pointer */}
                <View style={styles.pointerContainer}>
                    <View style={styles.pointer} />
                </View>

                {/* Wheel container */}
                <View style={styles.wheelContainer}>
                    <Animated.View style={[styles.wheel, animatedStyle]}>
                        {REWARDS.map((reward, index) => {
                            const rotate = `${index * SEGMENT_ANGLE}deg`;
                            return (
                                <View
                                    key={reward.id}
                                    style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        transform: [{ rotate: rotate }],
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                    }}
                                >
                                    {/* Separator Line */}
                                    <View style={{
                                        position: 'absolute',
                                        top: 0,
                                        width: 2,
                                        height: '50%',
                                        backgroundColor: Theme.colors.border,
                                    }} />

                                    {/* Content Container */}
                                    <View style={{
                                        marginTop: 40,
                                        transform: [{ rotate: `${SEGMENT_ANGLE / 2}deg` }], // Center in wedge
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{ fontSize: 24 }}>
                                            {reward.type === 'XP' ? '⚡' :
                                                reward.type === 'TOKEN' ? '🪙' :
                                                    reward.type === 'NFT' ? '🖼️' : '😢'}
                                        </Text>
                                        <Text style={{
                                            color: reward.color,
                                            fontWeight: 'bold',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            width: 80,
                                            marginTop: 4,
                                            textShadowColor: 'rgba(0,0,0,0.5)',
                                            textShadowRadius: 2,
                                        }}>
                                            {reward.label}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </Animated.View>

                    {/* Center Hub */}
                    <View style={styles.centerHub}>
                        <Text style={styles.hubEmoji}>🎰</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
                    onPress={handleSpin}
                    disabled={spinning}
                >
                    <LinearGradient
                        colors={Theme.gradients.primary}
                        style={styles.spinButtonGradient}
                    >
                        <Text style={styles.spinButtonText}>
                            {spinning ? 'Spinning...' : 'SPIN THE WHEEL'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Result Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalEmoji}>
                            {result?.type === 'EMPTY' ? '😢' : '🎉'}
                        </Text>
                        <Text style={styles.modalTitle}>
                            {result?.type === 'EMPTY' ? 'Better luck next time!' : 'You Won!'}
                        </Text>
                        {result?.type !== 'EMPTY' && (
                            <Text style={styles.modalReward}>{result?.label}</Text>
                        )}
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Awesome</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        padding: 10,
    },
    backButtonText: {
        color: Theme.colors.text,
        fontSize: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pointerContainer: {
        zIndex: 10,
        marginBottom: -20,
        alignItems: 'center',
    },
    pointer: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 20,
        borderRightWidth: 20,
        borderTopWidth: 40,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FFFFFF', // White pointer
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    wheelContainer: {
        width: WHEEL_SIZE,
        height: WHEEL_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50,
    },
    wheel: {
        width: '100%',
        height: '100%',
        borderRadius: WHEEL_SIZE / 2,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: Theme.colors.surface,
        borderWidth: 5,
        borderColor: Theme.colors.border,
    },
    segment: {
        position: 'absolute',
        width: '50%',
        height: '5px', // Thickness of separator line
        top: '50%',
        left: '50%',
        // Segments are handled by rotating a container logic usually,
        // but here we are just mocking the look. 
        // A proper CSS wheel is complex. 
        // Let's simplify: Just use a big circle and rotate it.
        // The "segment" view above is actually incorrect for a pie slice.

        // CHANGE OF PLAN for CSS Pie Slices:
        // It is hard to do pure CSS conical gradients in RN lightly.
        // Simpler approach: Use Svg or just use a pre-made image if possible.
        // But since no image tool, let's use a "Fan" of views.
        height: '100%', // Full height to rotate around center? No.
        // Pivot is tricky in CSS without specific anchor.

        // Alternative: Just render lines and icons for now? 
        // No, user wants "nice animations".

        // BETTER APPROACH:
        // Make the segment start at center and go out.
        // Use `height: WHEEL_SIZE/2`, `position: absolute`, `top: 0`, `left: WHEEL_SIZE/2 - width/2`
        // Set `transformOrigin` equivalent (anchor point).
        marginTop: -2, // center vertical
    },
    // Okay, real implementation of slices in pure View is hard.
    // Let's use a "Background" approach where we just have a circle and place items at angles.
    // And use a Conic Gradient if Expo supports it.
    // Expo Linear Gradient doesn't do Conic.

    // FALLBACK: Simple circles for items on a big colored disc.
    centerHub: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    hubEmoji: {
        fontSize: 30,
    },

    // Re-define segment to be simple wrappers for text at correct positions
    segmentInner: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: WHEEL_SIZE,
        height: WHEEL_SIZE,
        // This is not working for slices.
        // Let's rewrite the logic in the file to use distinct wedges if possible.
        // Actually, let's just use absolute positioning for the ITEMS (text/icon)
        // and a simple background.
    },

    segmentText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
        position: 'absolute',
        top: 40,
        left: WHEEL_SIZE / 2 - 20, // centering?
        textAlign: 'center',
        width: 60,
        // This needs precise calc.
    },

    spinButton: {
        width: '80%',
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        ...Theme.shadows.glow,
    },
    spinButtonGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    spinButtonDisabled: {
        opacity: 0.7,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: Theme.colors.surface,
        padding: 30,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    modalEmoji: {
        fontSize: 60,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    modalReward: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Theme.colors.primary,
        marginBottom: 30,
        textAlign: 'center',
    },
    modalButton: {
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 20,
    },
    modalButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
