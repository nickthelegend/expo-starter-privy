import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePrivy, useEmbeddedEthereumWallet } from '@privy-io/expo';
import { supabase } from '@/lib/supabase';

export default function TokenLauncherScreen({ navigation }: { navigation: any }) {
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [supply, setSupply] = useState('1000000');
    const [loading, setLoading] = useState(false);

    const { user } = usePrivy();
    const { wallets } = useEmbeddedEthereumWallet();
    const wallet = wallets.find(w => w.chainType === 'ethereum');

    const handleCreateToken = async () => {
        if (!name || !symbol || !supply) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        try {
            setLoading(true);
            if (!wallet) throw new Error("Wallet not connected");

            const { ethers } = await import("ethers");
            const TOKEN_FACTORY_ABI = (await import("@/constants/abis/TokenFactory.json")).default;
            const { TOKEN_FACTORY_ADDRESS } = await import("@/constants/Contracts");

            const rawProvider = await wallet.getProvider();
            const provider = new ethers.BrowserProvider(rawProvider);
            const signer = await provider.getSigner();
            const factory = new ethers.Contract(TOKEN_FACTORY_ADDRESS, TOKEN_FACTORY_ABI, signer);

            Alert.alert("Creating Token", "Please sign the transaction...");

            const tx = await factory.createToken(
                name,
                symbol,
                18,
                ethers.parseEther(supply),
                "https://api.dicebear.com/7.x/identicon/svg?seed=" + symbol
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find((x: any) => x.fragment && x.fragment.name === 'TokenCreated');
            const tokenAddress = event.args[0];

            Alert.alert("Success!", `Token created at: ${tokenAddress}`);

            // Optional: Save to Supabase for easy discovery
            // await supabase.from('merchant_tokens').insert(...)

            navigation.goBack();
        } catch (err: any) {
            console.error(err);
            Alert.alert("Error", err.message || "Failed to create token");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#000000', '#111b2d', '#000000']}
                style={StyleSheet.absoluteFillObject}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Forge Token</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.inputCard}>
                        <Text style={styles.label}>Token Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Kyra Quest Coin"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputCard}>
                        <Text style={styles.label}>Symbol</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. KQC"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={symbol}
                            onChangeText={setSymbol}
                            autoCapitalize="characters"
                        />
                    </View>

                    <View style={styles.inputCard}>
                        <Text style={styles.label}>Initial Supply</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="1000000"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            keyboardType="numeric"
                            value={supply}
                            onChangeText={setSupply}
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreateToken}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={['#3B82F6', '#2563EB'] as any}
                            style={styles.gradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.buttonText}>CREATE ERC20 TOKEN</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
    },
    content: { padding: 20 },
    inputCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    label: {
        color: Theme.colors.textMuted,
        fontSize: 12,
        marginBottom: 8,
    },
    input: {
        color: 'white',
        fontSize: 18,
    },
    footer: { padding: 20 },
    createButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});
