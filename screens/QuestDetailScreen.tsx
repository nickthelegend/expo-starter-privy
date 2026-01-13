import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Share,
    Linking
} from 'react-native';
import { ParallaxScrollView } from '@/components/ui/parallax-scrollview';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { LootBoxModal } from '@/components/LootBoxModal';
import { Quest } from '@/constants/Types';
import { supabase } from '@/lib/supabase';
import { ethers } from 'ethers';
import { usePrivy, useEmbeddedEthereumWallet, getUserEmbeddedEthereumWallet } from '@privy-io/expo';
import QuestArtifact from '@/constants/abis/Quest.json';
import * as LinkingExpo from 'expo-linking';
import { KYRA_TOKEN_ADDRESS } from '@/constants/Contracts';

const QuestABI = QuestArtifact;

export default function QuestDetailScreen({ route, navigation }: { route: any, navigation: any }) {
    const { quest }: { quest: Quest } = route.params;
    const [showLootBox, setShowLootBox] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [hasClaimed, setHasClaimed] = useState(false);

    // Auth & Wallet
    const { user } = usePrivy();
    const { wallets } = useEmbeddedEthereumWallet();
    const embeddedWallet = getUserEmbeddedEthereumWallet(user);
    const wallet = embeddedWallet || (user as any)?.wallet || wallets[0];

    // Referral Logic
    const [referralAddress, setReferralAddress] = useState<string | null>(null);

    useEffect(() => {
        // Check if opened with a referral
        const url = LinkingExpo.useURL();
        if (url) {
            const { queryParams } = LinkingExpo.parse(url);
            if (queryParams?.ref) {
                setReferralAddress(queryParams.ref as string);
            }
        }
        checkClaimStatus();
    }, []);

    const checkClaimStatus = async () => {
        if (!wallet?.address) return;
        try {
            const { data, error } = await supabase
                .from('quest_claims')
                .select('*')
                .eq('quest_id', quest.id)
                .eq('player_wallet', wallet.address.toLowerCase())
                .order('claimed_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0) {
                const lastClaim = data[0];

                if (quest.is_recurring && quest.recurring_interval) {
                    const lastClaimTime = new Date(lastClaim.claimed_at).getTime();
                    const now = Date.now();
                    const intervalMs = quest.recurring_interval * 1000;

                    if (now - lastClaimTime > intervalMs) {
                        // Eligible to claim again
                        setHasClaimed(false);
                    } else {
                        setHasClaimed(true);
                    }
                } else {
                    setHasClaimed(true);
                }
            } else {
                setHasClaimed(false);
            }
        } catch (error) {
            console.error("Error checking claim:", error);
        }
    };

    const handleClaim = async () => {
        if (!wallet) {
            Alert.alert("Connect Wallet", "Please log in to claim quests.");
            return;
        }

        setClaiming(true);
        try {
            const provider = await wallet.getProvider();
            if (!provider) throw new Error("No provider found");

            // 1. Geo-Validation (if 'map' quest)
            if (quest.quest_type === 'map' && quest.metadata?.latitude && quest.metadata?.longitude) {
                console.log("Starting Geo Validation...");
                setClaiming(true); // Ensure loading state

                // Dynamically import to avoid load-time errors if native module missing
                const Location = await import('expo-location');
                const { getDistance } = await import('geolib');

                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    throw new Error("Location permission is required for this quest.");
                }

                const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                const userCoords = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                };
                const questCoords = {
                    latitude: quest.metadata.latitude,
                    longitude: quest.metadata.longitude
                };

                const distance = getDistance(userCoords, questCoords);
                const MAX_DISTANCE = 100; // meters

                console.log(`Dist: ${distance}m, Max: ${MAX_DISTANCE}m`);

                if (distance > MAX_DISTANCE) {
                    throw new Error(`You are too far away! \nDistance: ${distance}m \nRequired: <${MAX_DISTANCE}m`);
                }
            }

            const web3Provider = new ethers.BrowserProvider(provider);
            const signer = await web3Provider.getSigner();
            const questContract = new ethers.Contract(quest.address, QuestABI, signer);

            // Ref Logic: address(0) if none
            const refAddr = referralAddress || ethers.ZeroAddress;

            console.log(`Claiming quest ${quest.address} with ref ${refAddr}`);

            let tx;
            if (quest.quest_type === 'qr') {
                Alert.alert("QR Required", "Please locate the QR code to claim.");
                setClaiming(false);
                return;
            } else {
                tx = await questContract.claim(refAddr);
            }

            console.log("Tx sent:", tx.hash);
            const receipt = await tx.wait();

            // Sync to Supabase
            await supabase.from('quest_claims').insert({
                quest_id: quest.id,
                player_wallet: wallet.address.toLowerCase(),
                tx_hash: receipt.hash,
                xp_earned: 100
            });

            // Update local stats
            await supabase.from('quests').update({
                claims_made: (quest.claims_made || 0) + 1
            }).eq('id', quest.id);

            setHasClaimed(true);
            Alert.alert("🎉 Quest Completed!", "Reward claimed successfully.");

            if (quest.proof_type === 'social') {
                setShowLootBox(true);
            }

        } catch (error: any) {
            console.error("Claim failed:", error);
            // Enhanced Error Handling
            let title = "Claim Failed";
            let msg = error.message || "Unknown error";

            if (msg.includes("user rejected")) {
                msg = "Transaction was cancelled.";
            } else if (msg.includes("too far")) {
                title = "📍 Out of Range";
            }

            Alert.alert(title, msg);
        } finally {
            setClaiming(false);
        }
    };

    const handleShare = async () => {
        if (!wallet?.address) {
            Alert.alert("Login Required", "Login to share your referral link!");
            return;
        }

        // Deep link format: kyraquest://quest/[id]?ref=waallet
        // Or universal link if configured. Using string concatenation for simplicity.
        const link = LinkingExpo.createURL(`quest/${quest.id}`, {
            queryParams: { ref: wallet.address }
        });

        try {
            await Share.share({
                message: `Join me on this quest! ${quest.name} \nReward: ${quest.reward_per_claim} KYRA \n${link}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const getRarityColor = (rarity: string = 'common') => {
        switch (rarity.toLowerCase()) {
            case 'legendary': return '#FFD700';
            case 'epic': return '#9333EA';
            case 'rare': return '#3B82F6';
            default: return '#10B981';
        }
    };

    const questImage = quest.image_url || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800&q=80';

    return (
        <View style={styles.container}>
            <ParallaxScrollView
                headerHeight={300}
                headerImage={
                    <Image
                        source={{ uri: questImage }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit='cover'
                    />
                }
            >
                <View style={styles.content}>
                    <View style={styles.topInfo}>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <View style={[styles.badge, { backgroundColor: getRarityColor(quest.rarity) }]}>
                                <Text style={styles.badgeText}>{(quest.rarity || 'COMMON').toUpperCase()}</Text>
                            </View>
                            {quest.referral_bps > 0 && (
                                <View style={[styles.badge, { backgroundColor: '#DB2777' }]}>
                                    <Text style={styles.badgeText}>REFERRAL</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.distanceText}>
                            {quest.distance || (quest.quest_type === 'map' ? 'Map Quest' : 'Global')}
                        </Text>
                    </View>

                    <Text style={styles.title}>{quest.name}</Text>

                    <View style={styles.rewardContainer}>
                        <LinearGradient
                            colors={['#181121', '#241a2f'] as any}
                            style={styles.rewardCard}
                        >
                            <Text style={styles.rewardLabel}>QUEST REWARD</Text>
                            <Text style={styles.rewardValue}>
                                {ethers.formatUnits(quest.reward_per_claim || "0", 18)} KYRA
                            </Text>
                        </LinearGradient>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Objective</Text>
                        <Text style={styles.descriptionText}>{quest.description}</Text>
                    </View>

                    {quest.quest_type === 'map' && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Location</Text>
                            <View style={styles.mapContainer}>
                                <MapView
                                    provider={PROVIDER_GOOGLE}
                                    style={styles.map}
                                    initialRegion={{
                                        latitude: quest.metadata?.latitude || 37.78825,
                                        longitude: quest.metadata?.longitude || -122.4324,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}
                                >
                                    <Marker
                                        coordinate={{
                                            latitude: quest.metadata?.latitude || 37.78825,
                                            longitude: quest.metadata?.longitude || -122.4324,
                                        }}
                                    />
                                </MapView>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.startButton, (hasClaimed || claiming) && styles.disabledButton]}
                        onPress={handleClaim}
                        disabled={hasClaimed || claiming}
                    >
                        <LinearGradient
                            colors={(hasClaimed ? ['#333', '#444'] : Theme.gradients.primary) as any}
                            style={styles.startGradient}
                        >
                            <Text style={styles.startButtonText}>
                                {claiming ? 'Claiming...' : hasClaimed ? 'Claimed' : 'Claim Reward'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.shareButton}
                        onPress={handleShare}
                    >
                        <Text style={styles.shareText}>Share & Earn Referral Bonus</Text>
                        <Ionicons name="share-outline" size={20} color="white" />
                    </TouchableOpacity>

                </View>
            </ParallaxScrollView>

            {/* Floating Back Button */}
            <TouchableOpacity
                style={styles.floatingBackButton}
                onPress={() => navigation.goBack()}
            >
                <View style={styles.backButtonInner}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </View>
            </TouchableOpacity>

            <LootBoxModal
                visible={showLootBox}
                questName={quest.name}
                onClose={() => setShowLootBox(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    content: {
        padding: Theme.spacing.md,
    },
    topInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.md,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontFamily: Theme.typography.fontFamily.semiBold,
        color: Theme.colors.text,
    },
    distanceText: {
        fontSize: 14,
        color: Theme.colors.textMuted,
        fontFamily: Theme.typography.fontFamily.medium,
    },
    title: {
        fontSize: 32,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.text,
        marginBottom: Theme.spacing.lg,
    },
    rewardContainer: {
        marginBottom: Theme.spacing.xl,
    },
    rewardCard: {
        padding: Theme.spacing.md,
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
        fontFamily: Theme.typography.fontFamily.medium,
    },
    rewardValue: {
        fontSize: 24,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.primary,
    },
    section: {
        marginBottom: Theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.text,
        marginBottom: Theme.spacing.md,
    },
    descriptionText: {
        fontSize: 16,
        color: Theme.colors.textMuted,
        lineHeight: 24,
        fontFamily: Theme.typography.fontFamily.regular,
    },
    mapContainer: {
        height: 200,
        borderRadius: Theme.borderRadius.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    startButton: {
        borderRadius: Theme.borderRadius.md,
        overflow: 'hidden',
        marginTop: Theme.spacing.lg,
        marginBottom: Theme.spacing.md,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: Theme.borderRadius.md,
    },
    shareText: {
        color: 'white',
        fontFamily: Theme.typography.fontFamily.medium,
    },
    startGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    startButtonText: {
        color: Theme.colors.text,
        fontSize: 18,
        fontFamily: Theme.typography.fontFamily.header,
    },
    display: {
        opacity: 0.5,
    },
    disabledButton: {
        opacity: 0.7,
    },
    floatingBackButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
    },
    backButtonInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
