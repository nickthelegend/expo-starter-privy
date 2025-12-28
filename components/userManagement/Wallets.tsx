import {
  useEmbeddedEthereumWallet,
  useEmbeddedSolanaWallet,
  usePrivy,
} from "@privy-io/expo";
import { useCreateWallet } from "@privy-io/expo/extended-chains";
import { View, Text, Button, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { createPublicClient, http, formatEther } from "viem";
import { mantleSepoliaTestnet } from "viem/chains";
import { Theme } from "@/constants/Theme";
import { LinearGradient } from "expo-linear-gradient";

const MANTLE_RPC_URL = "https://mantle-sepolia.g.alchemy.com/v2/3qRB0TMQQv3hyKgav_6lF";

export default function Wallets() {
  const [error, setError] = useState<string | null>(null);
  const [mantleBalance, setMantleBalance] = useState<string | null>(null);
  const { user } = usePrivy();
  const { create: createEthereumWallet } = useEmbeddedEthereumWallet();
  const { create: createSolanaWallet } = useEmbeddedSolanaWallet();
  const { createWallet } = useCreateWallet();

  const wallets = user?.linked_accounts.filter(
    (account) => account.type === "wallet",
  );

  const ethWallet = wallets?.find((w) => w.chain_type === 'ethereum');

  useEffect(() => {
    const fetchBalance = async () => {
      if (!ethWallet?.address) return;

      try {
        const publicClient = createPublicClient({
          chain: mantleSepoliaTestnet,
          transport: http(MANTLE_RPC_URL),
        });

        const balance = await publicClient.getBalance({
          address: ethWallet.address as `0x${string}`,
        });

        setMantleBalance(formatEther(balance));
      } catch (err) {
        console.error("Error fetching Mantle balance:", err);
      }
    };

    fetchBalance();
  }, [ethWallet?.address]);

  type ExtendedChainType =
    | "bitcoin-segwit"
    | "stellar"
    | "cosmos"
    | "sui"
    | "tron"
    | "near"
    | "ton"
    | "spark";
  type chainTypes = "ethereum" | "solana" | ExtendedChainType;

  const ALL_CHAIN_TYPES: chainTypes[] = [
    "ethereum",
    "solana",
    "bitcoin-segwit",
    "stellar",
    "cosmos",
    "sui",
    "tron",
    "near",
    "ton",
    "spark",
  ];

  const createWallets = (chainType: chainTypes) => {
    switch (chainType) {
      case "ethereum":
        return createEthereumWallet({ createAdditional: true });
      case "solana":
        return createSolanaWallet?.({
          createAdditional: true,
          recoveryMethod: "privy",
        });

      default:
        return createWallet({
          chainType: chainType as ExtendedChainType,
        }).catch((err: any) => {
          console.log(err);
          setError(err?.message ? String(err.message) : String(err));
        });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallets</Text>

      {/* Mantle Balance Display */}
      {ethWallet && (
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['rgba(124, 58, 237, 0.1)', 'rgba(124, 58, 237, 0.05)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.balanceHeader}>
            <View style={styles.networkBadge}>
              <Text style={styles.networkText}>Mantle L2 Network</Text>
            </View>
            <Text style={styles.walletAddress}>
              {ethWallet.address.slice(0, 6)}...{ethWallet.address.slice(-4)}
            </Text>
          </View>

          <View style={styles.balanceContent}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>
              {mantleBalance ? `${parseFloat(mantleBalance).toFixed(4)} MNT` : 'Loading...'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.walletList}>
        {ALL_CHAIN_TYPES.map((chainType, i) => (
          <Button
            key={`create-wallet-${chainType}-${i}`}
            title={`Create ${chainType} Wallet`}
            onPress={() => createWallets(chainType)}
          />
        ))}
      </View>
      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  walletList: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  balanceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  networkBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  networkText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '600',
  },
  walletAddress: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  balanceContent: {
    gap: 4,
  },
  balanceLabel: {
    color: Theme.colors.textMuted,
    fontSize: 14,
  },
  balanceValue: {
    color: Theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
