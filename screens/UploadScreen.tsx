import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { supabase } from '@/lib/supabase';
import { usePrivy, useEmbeddedEthereumWallet, getUserEmbeddedEthereumWallet } from '@privy-io/expo';

export default function UploadScreen({ navigation }: { navigation: any }) {
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);

    const { user } = usePrivy();
    const { wallets } = useEmbeddedEthereumWallet();
    const embeddedWallet = getUserEmbeddedEthereumWallet(user);
    const wallet = embeddedWallet || (user as any)?.wallet || wallets[0];

    const pickVideo = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setVideoUri(result.assets[0].uri);
        }
    };

    const handleUpload = async () => {
        if (!videoUri || !caption) {
            Alert.alert('Error', 'Please select a video and add a caption');
            return;
        }
        if (!wallet) {
            Alert.alert('Error', 'Please connect wallet first');
            return;
        }

        setUploading(true);
        try {
            // 1. Upload to Supabase Storage (Mocking for now as we need bucket setup)
            // const { data, error } = await supabase.storage.from('reels').upload(...)

            // Simulating upload delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            const mockUrl = videoUri; // Use local URI or the result from storage

            // 2. Insert to feed_posts table
            const { error: dbError } = await supabase
                .from('feed_posts')
                .insert({
                    owner_wallet: wallet.address.toLowerCase(),
                    video_url: mockUrl, // In prod, this is the public URL
                    caption: caption,
                    likes: 0
                });

            if (dbError) throw dbError;

            // 3. Mint NFT (SocialFi)
            // Note: This requires the wallet to sign the transaction
            try {
                Alert.alert("Minting NFT", "Please sign the transaction to mint your Reel.");

                const { ethers } = await import("ethers");
                const QUEST_REEL_ABI = (await import("@/constants/abis/QuestReelNFT.json")).default;
                const { QUEST_REEL_NFT_ADDRESS } = await import("@/constants/Contracts");

                const provider = await wallet.getEthersProvider();
                const signer = provider.getSigner();
                const contract = new ethers.Contract(QUEST_REEL_NFT_ADDRESS, QUEST_REEL_ABI, signer);

                const tx = await contract.mintReel(wallet.address, mockUrl);
                await tx.wait();

                Alert.alert("Success", "Your reel has been posted and minted as an NFT!");
            } catch (mintError) {
                console.error("Minting failed:", mintError);
                Alert.alert("Partial Success", "Post created but NFT minting failed.");
            }

            navigation.goBack();
        } catch (error: any) {
            console.error(error);
            Alert.alert('Upload Failed', error.message || "Unknown error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#000000', '#1a103c']}
                style={StyleSheet.absoluteFillObject}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Post</Text>
                <TouchableOpacity onPress={handleUpload} disabled={uploading}>
                    {uploading ? <ActivityIndicator color={Theme.colors.primary} /> : <Text style={styles.postButton}>Post</Text>}
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {videoUri ? (
                    <View style={styles.previewContainer}>
                        <Video
                            source={{ uri: videoUri }}
                            style={styles.videoPreview}
                            resizeMode={ResizeMode.COVER}
                            shouldPlay
                            isLooping
                            isMuted
                        />
                        <TouchableOpacity style={styles.changeButton} onPress={pickVideo}>
                            <Text style={styles.changeText}>Change Video</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.uploadBox} onPress={pickVideo}>
                        <Ionicons name="cloud-upload-outline" size={48} color={Theme.colors.textMuted} />
                        <Text style={styles.uploadText}>Select Video from Gallery</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Write a caption..."
                        placeholderTextColor={Theme.colors.textMuted}
                        multiline
                        value={caption}
                        onChangeText={setCaption}
                        maxLength={200}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    postButton: {
        color: Theme.colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    uploadBox: {
        height: 250,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
        marginBottom: 20,
    },
    uploadText: {
        color: Theme.colors.textMuted,
        marginTop: 10,
    },
    previewContainer: {
        height: 400,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: '#000',
    },
    videoPreview: {
        width: '100%',
        height: '100%',
    },
    changeButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    changeText: {
        color: 'white',
        fontSize: 12,
    },
    inputContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 16,
    },
    input: {
        color: 'white',
        fontSize: 16,
        height: 80,
        textAlignVertical: 'top',
    }
});
