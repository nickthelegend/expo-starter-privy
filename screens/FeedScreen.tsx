import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Share } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePrivy } from '@privy-io/expo';

const { height, width } = Dimensions.get('window');

interface FeedPost {
    id: string;
    owner_wallet: string;
    video_url: string;
    caption: string;
    likes: number;
    quest_address?: string;
    created_at: string;
}

const MOCK_POSTS: FeedPost[] = [
    {
        id: '1',
        owner_wallet: '0x123...abc',
        video_url: 'https://cdn.coverr.co/videos/coverr-neon-city-lights-5654/1080p.mp4',
        caption: 'Trying out the new Neon Quest in Tokyo! 🌃 #KyraQuest #Mantle',
        likes: 124,
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        owner_wallet: '0x456...def',
        video_url: 'https://cdn.coverr.co/videos/coverr-walking-in-tokyo-at-night-4545/1080p.mp4',
        caption: 'Found the hidden chest! 💎 This AR feature is insane.',
        likes: 89,
        created_at: new Date().toISOString()
    },
    {
        id: '3',
        owner_wallet: '0x789...ghi',
        video_url: 'https://cdn.coverr.co/videos/coverr-person-looking-at-phone-at-night-5432/1080p.mp4',
        caption: 'Checking my leaderboard rank. Top 10 soon! 🚀',
        likes: 256,
        created_at: new Date().toISOString()
    }
];

export default function FeedScreen({ navigation }: { navigation: any }) {
    const [posts, setPosts] = useState<FeedPost[]>(MOCK_POSTS);
    const [activePage, setActivePage] = useState(0);
    const insets = useSafeAreaInsets();
    const { user } = usePrivy();
    const videoRefs = useRef<{ [key: string]: Video | null }>({});

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('feed_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                setPosts(data);
            }
        } catch (e) {
            console.error(e);
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
        setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: currentLikes + 1 } : p));
        // TODO: Sync with DB
    };

    const handleShare = async (post: FeedPost) => {
        try {
            await Share.share({
                message: `Check out this quest clip! ${post.caption} \nWatch on KyraQuest.`,
            });
        } catch (error) {
            console.error(error);
        }
    };

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
                            <View style={styles.iconContainer}>
                                <Ionicons name="heart" size={32} color="#fff" />
                            </View>
                            <Text style={styles.actionText}>{item.likes}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="chatbubble-ellipses" size={30} color="#fff" />
                            </View>
                            <Text style={styles.actionText}>24</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="share-social" size={30} color="#fff" />
                            </View>
                            <Text style={styles.actionText}>Share</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <LinearGradient
                                colors={Theme.gradients.primary as any}
                                style={[styles.iconContainer, { borderWidth: 0 }]}
                            >
                                <Ionicons name="gift" size={24} color="#fff" />
                            </LinearGradient>
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
            <PagerView
                style={styles.pagerView}
                initialPage={0}
                orientation="vertical"
                onPageSelected={handlePageSelected}
            >
                {posts.map((item, index) => renderItem(item, index))}
            </PagerView>

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
        height: height,
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
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
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
    }
});
