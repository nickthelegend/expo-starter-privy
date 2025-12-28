import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface LaunchScreenProps {
    navigation: any;
}

export default function LaunchScreen({ navigation }: LaunchScreenProps) {
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
                    <Text style={styles.title}>Initialize Launch</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.sectionTitle}>Select Protocol</Text>
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity style={styles.optionCard}>
                            <LinearGradient
                                colors={['rgba(98, 65, 232, 0.2)', 'rgba(98, 65, 232, 0.05)']}
                                style={styles.optionGradient}
                            >
                                <Text style={styles.optionIcon}>🚀</Text>
                                <Text style={styles.optionTitle}>Deploy Quest</Text>
                                <Text style={styles.optionDesc}>Create a new quest for others to find.</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionCard}>
                            <LinearGradient
                                colors={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.05)']}
                                style={styles.optionGradient}
                            >
                                <Text style={styles.optionIcon}>📡</Text>
                                <Text style={styles.optionTitle}>Broadcast Signal</Text>
                                <Text style={styles.optionDesc}>Alert nearby explorers to a drop.</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>Configuration</Text>
                    <View style={styles.configCard}>
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>Target Range</Text>
                            <Text style={styles.configValue}>500m</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>Duration</Text>
                            <Text style={styles.configValue}>24 Hours</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.configItem}>
                            <Text style={styles.configLabel}>Reward Pool</Text>
                            <Text style={styles.configValue}>1000 KYRA</Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.launchButton}>
                        <LinearGradient
                            colors={Theme.gradients.primary}
                            style={styles.launchGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.launchButtonText}>INITIATE LAUNCH SEQUENCE</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
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
    optionsContainer: {
        flexDirection: 'row',
        gap: Theme.spacing.md,
    },
    optionCard: {
        flex: 1,
        borderRadius: Theme.borderRadius.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    optionGradient: {
        padding: Theme.spacing.lg,
        alignItems: 'center',
        height: 160,
        justifyContent: 'center',
    },
    optionIcon: {
        fontSize: 32,
        marginBottom: Theme.spacing.md,
    },
    optionTitle: {
        fontSize: 16,
        fontFamily: Theme.typography.fontFamily.semiBold,
        color: Theme.colors.text,
        marginBottom: 4,
        textAlign: 'center',
    },
    optionDesc: {
        fontSize: 12,
        fontFamily: Theme.typography.fontFamily.regular,
        color: Theme.colors.textMuted,
        textAlign: 'center',
    },
    configCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: Theme.borderRadius.md,
        padding: Theme.spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    configItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
});
