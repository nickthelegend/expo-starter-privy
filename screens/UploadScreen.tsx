import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { Camera, CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { usePrivy, useEmbeddedEthereumWallet, getUserEmbeddedEthereumWallet } from '@privy-io/expo';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function UploadScreen({ navigation }: { navigation: any }) {
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [facing, setFacing] = useState<'back' | 'front'>('back');
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [micPermission, requestMicPermission] = useMicrophonePermissions();
    const cameraRef = useRef<any>(null);

    const { user } = usePrivy();
    const { wallets } = useEmbeddedEthereumWallet();
    const embeddedWallet = getUserEmbeddedEthereumWallet(user);
    const wallet = embeddedWallet || (user as any)?.wallet || wallets[0];

    useEffect(() => {
        (async () => {
            if (!cameraPermission?.granted) await requestCameraPermission();
            if (!micPermission?.granted) await requestMicPermission();
        })();
    }, []);

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const startRecording = async () => {
        if (cameraRef.current && !isRecording) {
            try {
                setIsRecording(true);
                const record = await cameraRef.current.recordAsync({
                    maxDuration: 60,
                });
                setVideoUri(record.uri);
                setIsRecording(false);
            } catch (error) {
                console.error("Recording failed:", error);
                setIsRecording(false);
            }
        }
    };

    const stopRecording = () => {
        if (cameraRef.current && isRecording) {
            cameraRef.current.stopRecording();
            setIsRecording(false);
        }
    };

    const handleUpload = async () => {
        if (!videoUri || !caption) {
            Alert.alert('Error', 'Please record a video and add a caption');
            return;
        }
        if (!wallet) {
            Alert.alert('Error', 'Please connect wallet first');
            return;
        }

        setUploading(true);
        try {
            // Simulating upload delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            const mockUrl = videoUri;

            const { error: dbError } = await supabase
                .from('feed_posts')
                .insert({
                    owner_wallet: wallet.address.toLowerCase(),
                    video_url: mockUrl,
                    caption: caption,
                    likes: 0
                });

            if (dbError) throw dbError;

            // Mint NFT (SocialFi)
            try {
                const { ethers } = await import("ethers");
                const QUEST_REEL_ABI = (await import("@/constants/abis/QuestReelNFT.json")).default;
                const { QUEST_REEL_NFT_ADDRESS } = await import("@/constants/Contracts");

                const rawProvider = await wallet.getProvider();
                const provider = new ethers.BrowserProvider(rawProvider);
                const signer = await provider.getSigner();
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

    if (!cameraPermission || !micPermission) {
        return <View style={styles.container} />;
    }

    if (!cameraPermission.granted || !micPermission.granted) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: 'center', color: 'white', marginTop: 100 }}>
                    We need your permission to show the camera and record audio
                </Text>
                <TouchableOpacity onPress={() => { requestCameraPermission(); requestMicPermission(); }} style={styles.permissionBtn}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {!videoUri ? (
                <View style={{ flex: 1 }}>
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing={facing}
                        mode="video"
                    >
                        <View style={styles.cameraOverlay}>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
                                <Ionicons name="close" size={30} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.flipBtn} onPress={toggleCameraFacing}>
                                <Ionicons name="camera-reverse-outline" size={30} color="white" />
                                <Text style={styles.flipText}>Flip</Text>
                            </TouchableOpacity>

                            <View style={styles.controls}>
                                <TouchableOpacity
                                    style={[styles.recordBtn, isRecording && styles.recordingActive]}
                                    onPressIn={startRecording}
                                    onPressOut={stopRecording}
                                >
                                    <View style={[styles.recordInner, isRecording && styles.recordInnerActive]} />
                                </TouchableOpacity>
                                <Text style={styles.recordText}>
                                    {isRecording ? 'Release to Stop' : 'Hold to Record'}
                                </Text>
                            </View>
                        </View>
                    </CameraView>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <Video
                        source={{ uri: videoUri }}
                        style={styles.videoPreview}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay
                        isLooping
                    />

                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.previewOverlay}
                    >
                        <TouchableOpacity style={styles.backBtn} onPress={() => setVideoUri(null)}>
                            <Ionicons name="chevron-back" size={28} color="white" />
                        </TouchableOpacity>

                        <View style={styles.inputSection}>
                            <TextInput
                                style={styles.input}
                                placeholder="Add a catchy caption..."
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                multiline
                                value={caption}
                                onChangeText={setCaption}
                                maxLength={150}
                            />

                            <TouchableOpacity
                                style={[styles.finalPostBtn, uploading && styles.disabledBtn]}
                                onPress={handleUpload}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text style={styles.finalPostText}>Share Reel</Text>
                                        <Ionicons name="arrow-forward" size={20} color="white" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    closeBtn: {
        alignSelf: 'flex-start',
    },
    flipBtn: {
        position: 'absolute',
        top: 60,
        right: 20,
        alignItems: 'center',
    },
    flipText: {
        color: 'white',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '600',
    },
    controls: {
        alignItems: 'center',
    },
    recordBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 6,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    recordingActive: {
        borderColor: 'rgba(255, 59, 48, 0.4)',
    },
    recordInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
    recordInnerActive: {
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        width: 30,
        height: 30,
    },
    recordText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        textShadowColor: 'black',
        textShadowRadius: 4,
    },
    videoPreview: {
        width: screenWidth,
        height: screenHeight,
    },
    previewOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        padding: 24,
        justifyContent: 'flex-end',
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputSection: {
        gap: 16,
    },
    input: {
        color: 'white',
        fontSize: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        height: 100,
        textAlignVertical: 'top',
    },
    finalPostBtn: {
        height: 56,
        borderRadius: 28,
        backgroundColor: Theme.gradients.primary[0],
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    finalPostText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledBtn: {
        opacity: 0.6,
    },
    permissionBtn: {
        backgroundColor: Theme.colors.primary,
        padding: 16,
        borderRadius: 12,
        alignSelf: 'center',
        marginTop: 20,
    }
});
