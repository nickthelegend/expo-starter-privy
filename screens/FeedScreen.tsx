import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Share, Modal, TextInput, FlatList, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePrivy, useEmbeddedEthereumWallet } from '@privy-io/expo';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface FeedPost {
    id: string;
    owner_wallet: string;
    video_url: string;
    caption: string;
    likes: number;
    quest_address?: string;
    created_at: string;
    comments_count?: number;
}

interface Comment {
    id: string;
    user: string;
    text: string;
    time: string;
}

const MOCK_COMMENTS: Comment[] = [
    { id: '1', user: '0x123...456', text: 'This looks amazing! 🔥', time: '2h' },
    { id: '2', user: '0xabc...def', text: 'Where is this located?', time: '1h' },
    { id: '3', user: '0x789...012', text: 'Just completed this quest, so fun!', time: '30m' },
];

const MOCK_POSTS: FeedPost[] = [
    {
        id: '1',
        owner_wallet: '0x123...abc',
        video_url: 'https://cdn.coverr.co/videos/coverr-neon-city-lights-5654/1080p.mp4',
        caption: 'Trying out the new Neon Quest in Tokyo! 🌃 #KyraQuest #Mantle',
        likes: 124,
        comments_count: 24,
        created_at: new Date().toISOString()
    },
    {
        id: '10',
        owner_wallet: '0x456...def',
        video_url: 'https://cdn.coverr.co/videos/coverr-walking-in-tokyo-at-night-4545/1080p.mp4',
        caption: 'Found the hidden chest! 💎 This AR feature is insane.',
        likes: 89,
        comments_count: 12,
        created_at: new Date().toISOString()
    },
    {
        id: '3',
        owner_wallet: '0x789...ghi',
        video_url: 'https://cdn.coverr.co/videos/coverr-person-looking-at-phone-at-night-5432/1080p.mp4',
        caption: 'Checking my leaderboard rank. Top 10 soon! 🚀',
        likes: 256,
        comments_count: 45,
        created_at: new Date().toISOString()
    }
];

export default function FeedScreen({ navigation, route }: { navigation: any, route?: any }) {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [showGift, setShowGift] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [giftAmount, setGiftAmount] = useState('1');
    const [gifting, setGifting] = useState(false);
    const insets = useSafeAreaInsets();
    const { user } = usePrivy();
    const { wallets } = useEmbeddedEthereumWallet();
    const wallet = wallets.find(w => w.chainType === 'ethereum');
    const videoRefs = useRef<{ [key: string]: Video | null }>({});

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            console.log("Fetching reels from Supabase...");
            const { data, error } = await supabase
                .from('feed_posts')
                .select('*');

            if (error) {
                console.error("Supabase error fetching reels:", error);
                return;
            }

            console.log(`Fetched ${data?.length || 0} reels.`);

            if (data && data.length > 0) {
                // Random algorithm: Shuffle the array
                const shuffled = [...data].sort(() => Math.random() - 0.5);

                // Deep link handling: If postId is provided, move it to the top or find its index
                const postId = route?.params?.postId;
                if (postId) {
                    const targetIndex = shuffled.findIndex(p => p.id === postId);
                    if (targetIndex !== -1) {
                        // Move to top for initial focus
                        const targetPost = shuffled.splice(targetIndex, 1)[0];
                        shuffled.unshift(targetPost);
                    }
                }

                setPosts(shuffled);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePageSelected = (e: any) => {
        const page = e.nativeEvent.position;
        setActivePage(page);

        // Play active, pause others
        Object.keys(videoRefs.current).forEach((key, index) => {
            const video = videoRefs.current[key];
            if (video) {
                if (index === page) {
                    video.playAsync();
                } else {
                    video.pauseAsync();
                }
            }
        });
    };

    const handleLike = async (id: string, currentLikes: number) => {
        // Optimistic update
        setPosts(prev => prev.map(p => (p.id === id ? { ...p, likes: currentLikes + 1, isLiked: true } : p)));
        // TODO: Sync with DB
    };

    const handleShare = async (post: FeedPost) => {
        try {
            const shareUrl = `kyraquest://reel/${post.id}`;
            await Share.share({
                message: `Check out this quest clip! ${post.caption} \nWatch here: ${shareUrl}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleGiftMNT = async () => {
        if (!wallet) {
            Alert.alert("Error", "Please connect your wallet first.");
            return;
        }

        const amount = parseFloat(giftAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert("Error", "Please enter a valid amount.");
            return;
        }

        setGifting(true);
        try {
            const currentPost = posts[activePage];
            const { ethers } = await import("ethers");
            const rawProvider = await wallet.getProvider();
            const provider = new ethers.BrowserProvider(rawProvider);
            const signer = await provider.getSigner();

            const tx = await signer.sendTransaction({
                to: currentPost.owner_wallet, // Normally would be a real wallet, for demo we send to post owner
                value: ethers.parseEther(giftAmount)
            });

            Alert.alert("Transaction Sent", `Hash: ${tx.hash}`);
            await tx.wait();
            Alert.alert("Success", `Gifted ${giftAmount} MNT successfully!`);
            setShowGift(false);
        } catch (error: any) {
            console.error(error);
            Alert.alert("Gift Failed", error.message || "Failed to send MNT.");
        } finally {
            setGifting(false);
        }
    };

    const renderComment = ({ item }: { item: Comment }) => (
        <View style={styles.commentItem}>
            <View style={styles.commentAvatar}>
                <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                    <Text style={styles.commentUser}>{item.user}</Text>
                    <Text style={styles.commentTime}>{item.time}</Text>
                </View>
                <Text style={styles.commentText}>{item.text}</Text>
            </View>
        </View>
    );

    const renderItem = (item: FeedPost, index: number) => {
        const isFocused = index === activePage;

        return (
            <View style={styles.page} key={item.id}>
                <Video
                    ref={ref => { videoRefs.current[item.id] = ref; }}
                    source={{ uri: item.video_url }}
                    style={styles.video}
                    resizeMode={ResizeMode.COVER}
                    isLooping
                    shouldPlay={isFocused}
                    isMuted={false}
                />

                {/* Overlay Gradient */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
                    style={styles.overlay}
                >
                    <View style={styles.rightActions}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id, item.likes)}>
                            <View style={[styles.iconContainer, (item as any).isLiked && styles.likedIcon]}>
                                <Ionicons name={(item as any).isLiked ? "heart" : "heart-outline"} size={32} color={(item as any).isLiked ? "#FF3B30" : "#fff"} />
                            </View>
                            <Text style={styles.actionText}>{item.likes}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => setShowComments(true)}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="chatbubble-outline" size={30} color="#fff" />
                            </View>
                            <Text style={styles.actionText}>{item.comments_count || 0}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="share-social-outline" size={30} color="#fff" />
                            </View>
                            <Text style={styles.actionText}>Share</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => setShowGift(true)}>
                            <LinearGradient
                                colors={Theme.gradients.primary as any}
                                style={[styles.iconContainer, { borderWidth: 0 }]}
                            >
                                <Ionicons name="gift" size={24} color="#fff" />
                            </LinearGradient>
                            <Text style={styles.actionText}>Gift</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.bottomDetails, { paddingBottom: 80 + insets.bottom }]}>
                        <View style={styles.userInfo}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>👤</Text>
                            </View>
                            <Text style={styles.username}>
                                {item.owner_wallet?.slice(0, 6)}...{item.owner_wallet?.slice(-4)}
                            </Text>
                            <TouchableOpacity style={styles.followBtn}>
                                <Text style={styles.followText}>Follow</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.caption}>{item.caption}</Text>
                        <View style={styles.musicTag}>
                            <Ionicons name="musical-note" size={14} color="white" />
                            <Text style={styles.musicText}>Original Audio - Kyra Sounds</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={[styles.page, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={Theme.colors.primary} />
                </View>
            ) : (
                <PagerView
                    style={styles.pagerView}
                    initialPage={0}
                    orientation="vertical"
                    onPageSelected={handlePageSelected}
                >
                    {posts.map((item, index) => renderItem(item, index))}
                </PagerView>
            )}

            {/* Header Tabs */}
            <View style={[styles.header, { top: insets.top + 10 }]}>
                <TouchableOpacity><Text style={[styles.headerTab, styles.activeTab]}>For You</Text></TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity><Text style={styles.headerTab}>Following</Text></TouchableOpacity>
            </View>

            {/* Upload Button */}
            <TouchableOpacity
                style={[styles.uploadButton, { top: insets.top + 10 }]}
                onPress={() => navigation.navigate('Upload')}
            >
                <Ionicons name="add-circle-outline" size={32} color="white" />
            </TouchableOpacity>

            {/* Comment Modal */}
            <Modal
                visible={showComments}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowComments(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowComments(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.commentModal}
                    >
                        <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
                            <View style={styles.modalHandle} />
                            <Text style={styles.modalTitle}>Comments</Text>
                            <FlatList
                                data={MOCK_COMMENTS}
                                renderItem={renderComment}
                                keyExtractor={item => item.id}
                                contentContainerStyle={styles.commentList}
                                showsVerticalScrollIndicator={false}
                            />
                            <View style={[styles.commentInputContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                                <Image
                                    source={{ uri: `https://api.dicebear.com/7.x/identicon/png?seed=${wallet?.address || 'guest'}` }}
                                    style={styles.userCommentAvatar}
                                />
                                <TextInput
                                    style={styles.commentInput}
                                    placeholder="Add a comment..."
                                    placeholderTextColor={Theme.colors.textMuted}
                                    value={newComment}
                                    onChangeText={setNewComment}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        if (newComment.trim()) {
                                            setNewComment('');
                                            // Handle add comment
                                        }
                                    }}
                                >
                                    <Ionicons name="send" size={24} color={Theme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </TouchableOpacity>
            </Modal>

            {/* Gift Modal */}
            <Modal
                visible={showGift}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowGift(false)}
            >
                <View style={styles.modalOverlayCentered}>
                    <View style={styles.giftModal}>
                        <Text style={styles.giftTitle}>Gift MNT Tokens</Text>
                        <Text style={styles.giftSubtitle}>Support your favorite creators!</Text>

                        <View style={styles.giftInputWrapper}>
                            <TextInput
                                style={styles.giftInput}
                                keyboardType="numeric"
                                value={giftAmount}
                                onChangeText={setGiftAmount}
                                placeholder="0.0"
                                placeholderTextColor={Theme.colors.textMuted}
                            />
                            <Text style={styles.giftUnit}>MNT</Text>
                        </View>

                        <View style={styles.giftPresets}>
                            {['0.1', '0.5', '1', '5'].map(val => (
                                <TouchableOpacity
                                    key={val}
                                    style={[styles.presetBtn, giftAmount === val && styles.presetBtnActive]}
                                    onPress={() => setGiftAmount(val)}
                                >
                                    <Text style={[styles.presetText, giftAmount === val && styles.presetTextActive]}>{val}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.giftActions}>
                            <TouchableOpacity
                                style={styles.giftCancel}
                                onPress={() => setShowGift(false)}
                            >
                                <Text style={styles.giftCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.giftConfirm, gifting && styles.giftConfirmDisabled]}
                                onPress={handleGiftMNT}
                                disabled={gifting}
                            >
                                {gifting ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={styles.giftConfirmText}>Send Gift</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    pagerView: {
        flex: 1,
    },
    page: {
        flex: 1,
        height: screenHeight,
    },
    video: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
    },
    rightActions: {
        position: 'absolute',
        right: 16,
        bottom: 120,
        alignItems: 'center',
        gap: 20,
    },
    actionButton: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    likedIcon: {
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderColor: 'rgba(255, 59, 48, 0.3)',
    },
    actionText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    bottomDetails: {
        width: '80%',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'white',
        marginRight: 10,
    },
    avatarText: {
        fontSize: 20,
    },
    username: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 10,
    },
    followBtn: {
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    followText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    caption: {
        color: 'white',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 10,
    },
    musicTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    musicText: {
        color: 'white',
        fontSize: 14,
    },
    header: {
        position: 'absolute',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        zIndex: 10,
    },
    headerTab: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
        fontWeight: '600',
    },
    activeTab: {
        color: 'white',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    uploadButton: {
        position: 'absolute',
        right: 20,
        zIndex: 10,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalOverlayCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    commentModal: {
        backgroundColor: '#1E1E1E',
        height: '70%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 12,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    commentList: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentUser: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 8,
    },
    commentTime: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
    },
    commentText: {
        color: 'white',
        fontSize: 14,
        lineHeight: 20,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        backgroundColor: '#1E1E1E',
    },
    userCommentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 12,
        backgroundColor: '#333',
    },
    commentInput: {
        flex: 1,
        color: 'white',
        fontSize: 14,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        paddingHorizontal: 16,
        marginRight: 12,
    },
    // Gift Modal
    giftModal: {
        width: screenWidth * 0.85,
        backgroundColor: '#1E1E1E',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    giftTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    giftSubtitle: {
        color: Theme.colors.textMuted,
        fontSize: 14,
        marginBottom: 24,
    },
    giftInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        paddingHorizontal: 20,
        height: 60,
        marginBottom: 20,
    },
    giftInput: {
        flex: 1,
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    giftUnit: {
        color: Theme.colors.primary,
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    giftPresets: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    presetBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    presetBtnActive: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    presetText: {
        color: 'white',
        fontSize: 14,
    },
    presetTextActive: {
        fontWeight: 'bold',
    },
    giftActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    giftCancel: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    giftCancelText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    giftConfirm: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.colors.primary,
    },
    giftConfirmDisabled: {
        opacity: 0.5,
    },
    giftConfirmText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
