import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ItemSelectionGallery } from '@/components/ItemSelectionGallery';
import { usePrivy, useEmbeddedEthereumWallet } from '@privy-io/expo';
import { supabase } from '@/lib/supabase';
import { Alert, ActivityIndicator } from 'react-native';

interface LaunchScreenProps {
    navigation: any;
}

export default function LaunchScreen({ navigation }: LaunchScreenProps) {
    const [companyName, setCompanyName] = useState('');
    const [questType, setQuestType] = useState('MAP_HUNT');
    const [selectedReward, setSelectedReward] = useState<any>(null);
    const [isGalleryVisible, setIsGalleryVisible] = useState(false);
    const [rewardAmount, setRewardAmount] = useState('1');
    const [mintAtLaunch, setMintAtLaunch] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user } = usePrivy();
    const { wallets } = useEmbeddedEthereumWallet();
    const wallet = wallets.find(w => w.chainType === 'ethereum');

    const mockInventory = [
        { id: '1', type: 'NFT' as const, name: 'Pioneer Badge', image: '🏆', rarity: 'legendary' },
        { id: '2', type: 'TOKEN' as const, name: 'KYRA Token', image: '🪙', rarity: 'common', amount: 250 },
        { id: '3', type: 'NFT' as const, name: 'Mystery Box', image: '🎁', rarity: 'epic' },
        { id: '4', type: 'TOKEN' as const, name: 'XP Potion', image: '🧪', rarity: 'rare', amount: 1 },
    ];

    const questTypes = [
        { id: 'MAP_HUNT', title: 'Map Hunt', icon: 'map-outline', desc: 'Find treasure' },
        { id: 'QR_SCAN', title: 'QR Scan', icon: 'qr-code-outline', desc: 'Scan at merchant' },
        { id: 'VERIFY_DROP', title: 'Verification', icon: 'shield-checkmark-outline', desc: 'Account drop' },
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#000000', '#1a103c', '#000000']}
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
                    <Text style={styles.title}>Quest Forge</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.sectionTitle}>Merchant Identity</Text>
                    <View style={styles.inputCard}>
                        <Text style={styles.inputLabel}>Company or Entity Name</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. Acme Corp / NFT Creator"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={companyName}
                            onChangeText={setCompanyName}
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Quest Type</Text>
                    <View style={styles.questTypeContainer}>
                        {questTypes.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                style={[
                                    styles.typeCard,
                                    questType === type.id && styles.typeCardActive
                                ]}
                                onPress={() => setQuestType(type.id)}
                            >
                                <Ionicons
                                    name={type.icon as any}
                                    size={24}
                                    color={questType === type.id ? '#FFFFFF' : Theme.colors.primary}
                                />
                                <Text style={[
                                    styles.typeCardTitle,
                                    questType === type.id && styles.typeCardTitleActive
                                ]}>
                                    {type.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Reward selection</Text>
                    <TouchableOpacity
                        style={styles.rewardPicker}
                        onPress={() => setIsGalleryVisible(true)}
                    >
                        {selectedReward ? (
                            <View style={styles.selectedRewardInfo}>
                                <Text style={styles.selectedRewardIcon}>{selectedReward.image}</Text>
                                <View>
                                    <Text style={styles.selectedRewardName}>{selectedReward.name}</Text>
                                    <Text style={styles.selectedRewardType}>{selectedReward.type}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={Theme.colors.textMuted} style={{ marginLeft: 'auto' }} />
                            </View>
                        ) : (
                            <View style={styles.pickerPlaceholder}>
                                <Ionicons name="add-circle-outline" size={24} color={Theme.colors.primary} />
                                <Text style={styles.pickerText}>Select Token or NFT to Drop</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.createTokenLink}
                        onPress={() => navigation.navigate('TokenLauncher')}
                    >
                        <Text style={styles.createTokenLinkText}>Or Create a New Reward Token →</Text>
                    </TouchableOpacity>

                    {selectedReward && (
                        <View style={styles.configCard}>
                            <View style={styles.configItem}>
                                <Text style={styles.configLabel}>Drop Amount</Text>
                                <TextInput
                                    style={styles.smallInput}
                                    keyboardType="numeric"
                                    value={rewardAmount}
                                    onChangeText={setRewardAmount}
                                />
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.configItem}>
                                <Text style={styles.configLabel}>Mint at Launch Time</Text>
                                <Switch
                                    value={mintAtLaunch}
                                    onValueChange={setMintAtLaunch}
                                    trackColor={{ false: "#767577", true: Theme.colors.primary }}
                                    thumbColor={mintAtLaunch ? "#ffffff" : "#f4f3f4"}
                                />
                            </View>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Configuration</Text>
                    <View style={styles.configCard}>
                        {questType === 'MAP_HUNT' && (
                            <>
                                <View style={styles.configItem}>
                                    <Text style={styles.configLabel}>Target Range</Text>
                                    <Text style={styles.configValue}>500m</Text>
                                </View>
                                <View style={styles.divider} />
                            </>
                        )}
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>Duration</Text>
                            <Text style={styles.configValue}>24 Hours</Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.launchButton}
                        disabled={loading}
                        onPress={async () => {
                            try {
                                setLoading(true);
                                if (!wallet) throw new Error("Wallet not connected");

                                const { ethers } = await import("ethers");
                                const QUEST_FACTORY_ABI = (await import("@/constants/abis/QuestFactory.json")).default;
                                const { QUEST_FACTORY_ADDRESS } = await import("@/constants/Contracts");

                                const rawProvider = await wallet.getProvider();
                                const provider = new ethers.BrowserProvider(rawProvider);
                                const signer = await provider.getSigner();
                                const factory = new ethers.Contract(QUEST_FACTORY_ADDRESS, QUEST_FACTORY_ABI, signer);

                                // 1. Check if we need to create a token first
                                let rewardTokenAddr = selectedReward?.address || ethers.ZeroAddress;
                                if (!rewardTokenAddr && selectedReward?.type === 'TOKEN') {
                                    // For demo, we just use a fallback or prompt "Create Token"
                                    // In real flow, user would have created token via a separate button
                                }

                                // 2. Build Config
                                const expiry = Math.floor(Date.now() / 1000) + 86400; // 24h
                                const config = {
                                    name: companyName || "New Quest",
                                    description: "Quest launched from mobile",
                                    rewardType: selectedReward?.type === 'NFT' ? 1 : 0,
                                    questType: questType === 'QR_SCAN' ? 1 : 0,
                                    rewardToken: rewardTokenAddr,
                                    rewardAmount: ethers.parseEther(rewardAmount),
                                    maxClaims: 100,
                                    expiryTimestamp: expiry,
                                    isRecurring: false,
                                    recurringInterval: 0,
                                    nftGateAddress: ethers.ZeroAddress,
                                    referralBps: 0
                                };

                                // 3. Launch On-Chain
                                Alert.alert("Confirm Launch", "Sending transaction to Mantle Sepolia...");
                                let tx;
                                if (config.rewardType === 1) {
                                    tx = await factory.createNFTQuest(config);
                                } else {
                                    tx = await factory.createTokenQuest(config);
                                }

                                const receipt = await tx.wait();
                                const questCreatedEvent = receipt.logs.find((x: any) => x.fragment && x.fragment.name === 'QuestCreated');
                                const questAddress = questCreatedEvent.args[0];

                                // 4. Sync to Supabase
                                const { error: dbError } = await supabase.from('quests').insert({
                                    address: questAddress,
                                    creator_wallet: wallet.address.toLowerCase(),
                                    title: companyName + " Hunt",
                                    description: "Scan or Visit to earn rewards.",
                                    reward_amount: parseFloat(rewardAmount),
                                    reward_token: rewardTokenAddr,
                                    quest_type: questType === 'QR_SCAN' ? 'qr' : 'map',
                                    is_active: true,
                                    claims_made: 0,
                                    max_claims: 100
                                });

                                if (dbError) throw dbError;

                                Alert.alert("🚀 Launched!", `Quest deployed to: ${questAddress}`);
                                navigation.goBack();

                            } catch (err: any) {
                                console.error(err);
                                Alert.alert("Launch Failed", err.message || "Unknown error");
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        <LinearGradient
                            colors={Theme.gradients.primary as any}
                            style={styles.launchGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.launchButtonText}>INITIATE LAUNCH SEQUENCE</Text>}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ItemSelectionGallery
                visible={isGalleryVisible}
                onClose={() => setIsGalleryVisible(false)}
                onSelect={setSelectedReward}
                items={mockInventory}
            />
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
        fontSize: 20,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.text,
    },
    content: {
        padding: Theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.text,
        marginTop: Theme.spacing.lg,
        marginBottom: Theme.spacing.md,
    },
    inputCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: Theme.borderRadius.md,
        padding: Theme.spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: Theme.spacing.sm,
    },
    inputLabel: {
        color: Theme.colors.textMuted,
        fontSize: 12,
        fontFamily: Theme.typography.fontFamily.medium,
        marginBottom: 8,
    },
    textInput: {
        color: Theme.colors.text,
        fontSize: 16,
        fontFamily: Theme.typography.fontFamily.regular,
        paddingVertical: 8,
    },
    questTypeContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: Theme.spacing.sm,
    },
    typeCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: Theme.borderRadius.md,
        padding: Theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 8,
    },
    typeCardActive: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    typeCardTitle: {
        color: Theme.colors.textMuted,
        fontSize: 12,
        fontFamily: Theme.typography.fontFamily.semiBold,
        textAlign: 'center',
    },
    typeCardTitleActive: {
        color: '#FFFFFF',
    },
    rewardPicker: {
        backgroundColor: 'rgba(98, 65, 232, 0.1)',
        borderRadius: Theme.borderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(98, 65, 232, 0.3)',
        borderStyle: 'dashed',
        padding: Theme.spacing.lg,
    },
    pickerPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    pickerText: {
        color: Theme.colors.primary,
        fontSize: 16,
        fontFamily: Theme.typography.fontFamily.semiBold,
    },
    selectedRewardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    selectedRewardIcon: {
        fontSize: 32,
    },
    selectedRewardName: {
        color: Theme.colors.text,
        fontSize: 16,
        fontFamily: Theme.typography.fontFamily.semiBold,
    },
    selectedRewardType: {
        color: Theme.colors.textMuted,
        fontSize: 14,
    },
    configCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: Theme.borderRadius.md,
        padding: Theme.spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginTop: Theme.spacing.md,
    },
    configItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Theme.spacing.sm,
    },
    configLabel: {
        color: Theme.colors.textMuted,
        fontFamily: Theme.typography.fontFamily.regular,
    },
    configValue: {
        color: Theme.colors.primary,
        fontFamily: Theme.typography.fontFamily.mono,
    },
    smallInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        color: Theme.colors.text,
        paddingHorizontal: 12,
        paddingVertical: 4,
        width: 60,
        textAlign: 'center',
        fontFamily: Theme.typography.fontFamily.mono,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: Theme.spacing.xs,
    },
    footer: {
        padding: Theme.spacing.lg,
        paddingBottom: Theme.spacing.xl,
    },
    launchButton: {
        borderRadius: Theme.borderRadius.md,
        overflow: 'hidden',
        ...Theme.shadows.glow,
    },
    launchGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    launchButtonText: {
        color: Theme.colors.text,
        fontSize: 16,
        fontFamily: Theme.typography.fontFamily.header,
        letterSpacing: 1,
    },
    createTokenLink: {
        marginTop: 12,
        alignSelf: 'flex-end',
        padding: 4,
    },
    createTokenLinkText: {
        color: Theme.colors.primary,
        fontSize: 14,
        fontFamily: Theme.typography.fontFamily.medium,
        textDecorationLine: 'underline',
    }
});
