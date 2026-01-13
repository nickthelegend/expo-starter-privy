import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { usePrivy, useEmbeddedEthereumWallet } from '@privy-io/expo';

interface Coupon {
    id: string;
    merchant_name: string;
    title: string;
    description: string;
    price_amount: number;
    price_token: string;
    image_url: string;
    stock_count: number;
    listing_id?: number;
}

export default function ShopScreen() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const { data, error } = await supabase
                .from('merchant_coupons')
                .select('*')
                .eq('is_active', true);

            if (data) setCoupons(data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (coupon: Coupon) => {
        // 1. Initial Prompt
        Alert.alert(
            "Purchase Coupon",
            `Buy ${coupon.title} for ${coupon.price_amount} ${coupon.price_token}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            if (!wallet) throw new Error("Wallet not connected");

                            // 2. Import Deps
                            const { ethers } = await import("ethers");
                            const KYRA_SHOP_ABI = (await import("@/constants/abis/KyraShop.json")).default;
                            const { KYRA_SHOP_ADDRESS } = await import("@/constants/Contracts");

                            // 3. Setup Provider/Signer
                            const provider = await wallet.getEthersProvider();
                            const signer = provider.getSigner();
                            const contract = new ethers.Contract(KYRA_SHOP_ADDRESS, KYRA_SHOP_ABI, signer);

                            // 4. Execute Transaction
                            // Note: We need the listingId. For demo, we assume coupon.id maps to listingId if numeric, else 0
                            const listingId = parseInt(coupon.id) || 0;

                            // TODO: Approve Tokens first (skipped for brevity, assuming existing approval or native logic)

                            const tx = await contract.buyItem(listingId);
                            Alert.alert("Transaction Sent", `Hash: ${tx.hash}`);
                            await tx.wait();

                            // 5. Success
                            Alert.alert("Success!", "Item purchased successfully.");
                            // TODO: Add record to Supabase

                        } catch (err: any) {
                            console.error(err);
                            Alert.alert("Error", err.message || "Purchase failed");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const { user } = usePrivy();
    const { wallets } = useEmbeddedEthereumWallet();
    const wallet = wallets.find(w => w.chain_type === 'ethereum');

    const renderItem = ({ item }: { item: Coupon }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleBuy(item)}>
            <Image source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} style={styles.image} />
            <View style={styles.cardContent}>
                <View style={styles.merchantBadge}>
                    <Text style={styles.merchantText}>{item.merchant_name}</Text>
                    <Ionicons name="checkmark-circle" size={12} color="#3B82F6" />
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.price}>
                    {item.price_amount} {item.price_token}
                </Text>
                <Text style={styles.stock}>{item.stock_count} left</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={coupons}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="storefront-outline" size={48} color={Theme.colors.textMuted} />
                        <Text style={styles.emptyText}>No coupons available yet.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Theme.colors.border,
        flexDirection: 'row',
        height: 120,
    },
    image: {
        width: 120,
        height: '100%',
        backgroundColor: '#333',
    },
    cardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    merchantBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    merchantText: {
        color: Theme.colors.textMuted,
        fontSize: 12,
        fontWeight: '600',
    },
    title: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    price: {
        color: Theme.colors.primary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    stock: {
        color: '#EF4444',
        fontSize: 12,
        alignSelf: 'flex-end',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        gap: 10,
    },
    emptyText: {
        color: Theme.colors.textMuted,
        fontSize: 16,
    }
});
