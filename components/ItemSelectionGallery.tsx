import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Item {
    id: string;
    type: 'NFT' | 'TOKEN' | 'XP';
    name: string;
    image: string;
    rarity: string;
    amount?: number;
    description?: string;
}

interface ItemSelectionGalleryProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (item: Item) => void;
    items: Item[];
}

export function ItemSelectionGallery({ visible, onClose, onSelect, items }: ItemSelectionGalleryProps) {
    const renderItem = ({ item }: { item: Item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                onSelect(item);
                onClose();
            }}
        >
            <View style={styles.cardInner}>
                <Text style={styles.cardImage}>{item.image}</Text>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardType}>{item.type}</Text>
                {item.amount !== undefined && (
                    <Text style={styles.cardAmount}>Amt: {item.amount}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Select Reward</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={Theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Theme.colors.surface,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '80%',
        padding: Theme.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.lg,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Theme.typography.fontFamily.header,
        color: Theme.colors.text,
    },
    closeButton: {
        padding: 5,
    },
    listContent: {
        paddingBottom: 40,
    },
    card: {
        flex: 1,
        margin: 8,
        height: 150,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: Theme.borderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    cardInner: {
        flex: 1,
        padding: Theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardImage: {
        fontSize: 40,
        marginBottom: 8,
    },
    cardName: {
        color: Theme.colors.text,
        fontSize: 14,
        fontFamily: Theme.typography.fontFamily.semiBold,
        textAlign: 'center',
    },
    cardType: {
        color: Theme.colors.textMuted,
        fontSize: 12,
        fontFamily: Theme.typography.fontFamily.regular,
    },
    cardAmount: {
        color: Theme.colors.primary,
        fontSize: 12,
        fontFamily: Theme.typography.fontFamily.mono,
        marginTop: 4,
    },
});
