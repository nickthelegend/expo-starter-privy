"use client"

import React, { useState, useEffect, useRef } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps"
import {
    Navigation,
    Trophy,
    Clock,
    MapPin,
    ChevronUp,
    ChevronDown,
    ArrowLeft,
    Award,
    Coins,
} from "lucide-react-native"
import * as Location from "expo-location"
import { getDistance } from "geolib"
import { LinearGradient } from "expo-linear-gradient"
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated"
import { useNavigation, useRoute } from "@react-navigation/native"
import { isMockingLocation, MockLocationDetectorErrorCode } from "react-native-turbo-mock-location-detector"
import { Theme } from "@/constants/Theme"

const { width, height } = Dimensions.get("window")

const GEOFENCE_RADIUS = 50 // 50 meters radius

const northEast = { latitude: 17.49617, longitude: 78.39486 } // Should probably be dynamic based on quest, but keeping map bounds for now if needed or removing restrictions
const maxLatitudeDelta = 0.008
const maxLongitudeDelta = 0.008

// Custom map style
const MAP_STYLE = [
    {
        featureType: "all",
        elementType: "all",
        stylers: [
            {
                invert_lightness: true,
            },
            {
                saturation: "-9",
            },
            {
                lightness: "0",
            },
            {
                visibility: "simplified",
            },
        ],
    },
    {
        featureType: "landscape.man_made",
        elementType: "all",
        stylers: [
            {
                weight: "1.00",
            },
        ],
    },
    {
        featureType: "road.highway",
        elementType: "all",
        stylers: [
            {
                weight: "0.49",
            },
        ],
    },
    {
        featureType: "road.highway",
        elementType: "labels",
        stylers: [
            {
                visibility: "on",
            },
            {
                weight: "0.01",
            },
            {
                lightness: "-7",
            },
            {
                saturation: "-35",
            },
        ],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text",
        stylers: [
            {
                visibility: "on",
            },
        ],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.stroke",
        stylers: [
            {
                visibility: "off",
            },
        ],
    },
    {
        featureType: "road.highway",
        elementType: "labels.icon",
        stylers: [
            {
                visibility: "on",
            },
        ],
    },
]

export default function QMapScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { quest } = route.params as any;

    const [location, setLocation] = useState<Location.LocationObject | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [isWithinGeofence, setIsWithinGeofence] = useState(false)
    const [distance, setDistance] = useState<number | null>(null)
    const [isExpanded, setIsExpanded] = useState(true)
    const [claimLoading, setClaimLoading] = useState(false)
    const [isClaimed, setIsClaimed] = useState(false)
    const mapRef = useRef<MapView>(null)
    const [isMockLocation, setIsMockLocation] = useState(false)

    // Animation values
    const bottomSheetHeight = useSharedValue(400)
    const expandIconRotation = useSharedValue(180)

    useEffect(() => {
        setupLocation()
    }, [])

    // Update location watching configuration
    const setupLocation = async () => {
        try {
            // Check for mock location first
            const { isLocationMocked } = await isMockingLocation()
            setIsMockLocation(isLocationMocked)
            if (isLocationMocked) {
                setErrorMsg("Mock location detected. Please disable mock location to participate in quests.")
                return
            }

            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") {
                setErrorMsg("Permission to access location was denied")
                return
            }

            // Get initial location with high accuracy
            const initialLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
            })
            setLocation(initialLocation)

            if (quest && initialLocation) {
                updateDistance(initialLocation)
            }

            // Watch location
            const locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 1000,
                    distanceInterval: 1,
                },
                (newLocation) => {
                    setLocation(newLocation)
                    if (quest) {
                        updateDistance(newLocation)
                    }
                },
            )

            return () => {
                locationSubscription.remove()
            }
        } catch (error: any) {
            if (error?.code) {
                switch (error.code) {
                    case MockLocationDetectorErrorCode.GPSNotEnabled:
                        setErrorMsg("Please enable GPS to participate in quests")
                        break
                    case MockLocationDetectorErrorCode.NoLocationPermissionEnabled:
                        setErrorMsg("Location permission required to participate in quests")
                        break
                    case MockLocationDetectorErrorCode.CantDetermine:
                        console.warn("Could not determine if location is mocked")
                        break
                    default:
                        console.error("Error setting up location:", error)
                        setErrorMsg("Failed to setup location services")
                }
            } else {
                console.error("Error setting up location:", error)
                // setErrorMsg("Failed to setup location services") // proceed anyway for testing if needed
            }
        }
    }

    const updateDistance = (userLocation: Location.LocationObject) => {
        if (!quest || !quest.coordinate) return

        const questLocation = {
            latitude: quest.coordinate.latitude,
            longitude: quest.coordinate.longitude,
        }

        const newDistance = getDistance(
            {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
            },
            questLocation,
        )

        setDistance(newDistance)

        // Update geofence status
        const withinGeofence = newDistance <= GEOFENCE_RADIUS
        setIsWithinGeofence(withinGeofence)
    }

    const toggleExpand = () => {
        const newValue = !isExpanded
        setIsExpanded(newValue)
        bottomSheetHeight.value = withSpring(newValue ? 400 : 150, { damping: 15 })
        expandIconRotation.value = withTiming(newValue ? 180 : 0, { duration: 300 })
    }

    const animatedBottomSheetStyle = useAnimatedStyle(() => {
        return {
            height: bottomSheetHeight.value,
        }
    })

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${expandIconRotation.value}deg` }],
        }
    })

    const formatDistance = (meters: number | null) => {
        if (meters === null) return "Calculating..."
        if (meters < 1000) return `${meters.toFixed(0)} m`
        return `${(meters / 1000).toFixed(1)} km`
    }

    const focusOnQuest = () => {
        if (!quest || !quest.coordinate) return

        if (!isExpanded) {
            toggleExpand()
        }

        mapRef.current?.animateToRegion({
            latitude: quest.coordinate.latitude,
            longitude: quest.coordinate.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        })
    }

    const handleClaimReward = async () => {
        if (!location || !quest) return;

        setClaimLoading(true);

        // Simulate network request
        setTimeout(() => {
            setClaimLoading(false);
            setIsClaimed(true);
            Alert.alert(
                "🎉 Quest Complete!",
                `You found the treasure at ${quest.title}! Reward claimed.`,
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        }, 1500);
    }

    if (!quest) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7C3AED" />
                    <Text style={styles.loadingText}>Loading quest details...</Text>
                </View>
            </SafeAreaView>
        )
    }

    const initialRegion = {
        latitude: quest.coordinate?.latitude || 37.78825,
        longitude: quest.coordinate?.longitude || -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                showsUserLocation
                showsMyLocationButton={false}
                provider={PROVIDER_GOOGLE}
                customMapStyle={MAP_STYLE}
            >
                {quest.coordinate && (
                    <>
                        <Circle
                            center={{
                                latitude: quest.coordinate.latitude,
                                longitude: quest.coordinate.longitude,
                            }}
                            radius={GEOFENCE_RADIUS}
                            fillColor="rgba(124, 58, 237, 0.2)"
                            strokeColor="rgba(124, 58, 237, 0.5)"
                            strokeWidth={2}
                        />
                        <Marker
                            coordinate={{
                                latitude: quest.coordinate.latitude,
                                longitude: quest.coordinate.longitude,
                            }}
                            onPress={focusOnQuest}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <Image
                                source={require('@/assets/images/treasure_chest.png')}
                                style={{ width: 40, height: 40 }}
                                resizeMode="contain"
                            />
                        </Marker>
                    </>
                )}
            </MapView>

            <SafeAreaView style={StyleSheet.absoluteFill} pointerEvents="box-none">
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <View style={styles.backButtonContent}>
                        <LinearGradient colors={["#1F1F1F", "#000000"]} style={StyleSheet.absoluteFill} />
                        <ArrowLeft size={24} color="#ffffff" />
                    </View>
                </TouchableOpacity>

                {errorMsg && (
                    <View style={styles.errorContainer}>
                        <LinearGradient colors={["#EF4444", "#B91C1C"]} style={StyleSheet.absoluteFill} />
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    </View>
                )}

                {location && (
                    <TouchableOpacity
                        style={styles.centerButton}
                        onPress={() => {
                            mapRef.current?.animateToRegion({
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                                latitudeDelta: 0.005,
                                longitudeDelta: 0.005,
                            })
                        }}
                    >
                        <View style={styles.centerButtonContent}>
                            <LinearGradient colors={["#1F1F1F", "#000000"]} style={StyleSheet.absoluteFill} />
                            <Navigation size={24} color="#ffffff" />
                        </View>
                    </TouchableOpacity>
                )}
            </SafeAreaView>

            <Animated.View style={[styles.bottomSheet, animatedBottomSheetStyle]}>
                <View style={styles.bottomSheetContent}>
                    <LinearGradient
                        colors={["rgba(20, 20, 30, 0.95)", "rgba(10, 10, 15, 0.98)"]}
                        style={StyleSheet.absoluteFill}
                    />

                    <TouchableOpacity style={styles.handleContainer} onPress={toggleExpand}>
                        <View style={styles.handle} />
                        <Animated.View style={animatedIconStyle}>
                            {isExpanded ? <ChevronDown size={20} color="#ffffff" /> : <ChevronUp size={20} color="#ffffff" />}
                        </Animated.View>
                    </TouchableOpacity>

                    <View style={styles.questHeader}>
                        <View style={styles.questTitleRow}>
                            <Text style={styles.questTitle} numberOfLines={1}>
                                {quest.title}
                            </Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Active</Text>
                            </View>
                        </View>

                        <View style={styles.questMetaRow}>
                            <View style={styles.metaItem}>
                                <MapPin size={16} color="#94A3B8" />
                                <Text style={styles.metaText}>{formatDistance(distance)}</Text>
                            </View>
                            <View style={styles.metaDivider} />
                            <View style={styles.metaItem}>
                                <Clock size={16} color="#94A3B8" />
                                <Text style={styles.metaText}>{quest.expiresAt || '24h left'}</Text>
                            </View>
                        </View>
                    </View>

                    {isExpanded && (
                        <ScrollView style={styles.questContent} showsVerticalScrollIndicator={false}>
                            <Text style={styles.questDescription} numberOfLines={3}>
                                {quest.description}
                            </Text>

                            <View style={styles.rewardsCard}>
                                <View style={styles.rewardsHeader}>
                                    <Trophy size={18} color="#F59E0B" />
                                    <Text style={styles.rewardsTitle}>Rewards</Text>
                                </View>

                                <View style={styles.rewardItem}>
                                    {quest.rewardType === 'TOKEN' || quest.rewardType === 'XP' ? (
                                        <Coins size={16} color="#7C3AED" />
                                    ) : (
                                        <Award size={16} color="#7C3AED" />
                                    )}
                                    <Text style={styles.rewardValue}>{quest.reward}</Text>
                                </View>
                            </View>
                        </ScrollView>
                    )}

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[
                                styles.claimButton,
                                claimLoading && styles.loadingButton,
                                (isClaimed || !isWithinGeofence) && styles.disabledButton,
                            ]}
                            disabled={isClaimed || claimLoading || !isWithinGeofence}
                            onPress={handleClaimReward}
                        >
                            {claimLoading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <>
                                    <Trophy size={18} color="#ffffff" />
                                    <Text style={styles.buttonText}>
                                        {isClaimed ? "CLAIMED" : isWithinGeofence ? "CLAIM REWARD" : `GET CLOSER (${formatDistance(distance)})`}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },
    map: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
    },
    backButton: {
        position: "absolute",
        top: 60,
        left: 16,
        zIndex: 10,
    },
    backButtonContent: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        overflow: "hidden",
    },
    errorContainer: {
        position: "absolute",
        top: 120,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#EF4444",
        overflow: "hidden",
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    errorText: {
        color: "#EF4444",
        textAlign: "center",
        fontWeight: "600",
    },
    centerButton: {
        position: "absolute",
        bottom: 420, // push up above bottom sheet
        right: 16,
    },
    centerButtonContent: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        overflow: "hidden",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#000',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#ffffff",
    },
    bottomSheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },
    bottomSheetContent: {
        flex: 1,
        padding: 16,
    },
    handleContainer: {
        alignItems: "center",
        marginBottom: 12,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        borderRadius: 3,
        marginBottom: 5,
    },
    questHeader: {
        marginBottom: 16,
    },
    questTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    questTitle: {
        fontSize: 22,
        fontFamily: Theme.typography.fontFamily.header,
        color: "#ffffff",
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        backgroundColor: "rgba(124, 58, 237, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#7C3AED",
    },
    statusText: {
        color: "#7C3AED",
        fontSize: 12,
        fontWeight: "600",
        fontFamily: Theme.typography.fontFamily.semiBold,
    },
    questMetaRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        color: "#94A3B8",
        fontSize: 14,
        fontFamily: Theme.typography.fontFamily.medium,
    },
    metaDivider: {
        width: 1,
        height: 16,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        marginHorizontal: 12,
    },
    questContent: {
        flex: 1,
        marginBottom: 16,
    },
    questDescription: {
        color: "#ffffff",
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 16,
        fontFamily: Theme.typography.fontFamily.regular,
    },
    rewardsCard: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(124, 58, 237, 0.2)",
    },
    rewardsHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    rewardsTitle: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "600",
        fontFamily: Theme.typography.fontFamily.semiBold,
    },
    rewardItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    rewardValue: {
        color: "#ffffff",
        fontSize: 16,
        fontFamily: Theme.typography.fontFamily.medium,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
        marginTop: "auto",
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.1)",
    },
    claimButton: {
        flex: 1,
        backgroundColor: "#7C3AED",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    disabledButton: {
        backgroundColor: "#4A5568",
        opacity: 0.7,
    },
    loadingButton: {
        opacity: 0.8,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
        fontFamily: Theme.typography.fontFamily.semiBold,
    },
})
