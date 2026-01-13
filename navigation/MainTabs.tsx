import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '@/constants/Theme';
import HomeScreen from '@/screens/HomeScreen';
import ScanScreen from '@/screens/ScanScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import QuestScreen from '@/screens/QuestScreen';
import FeedScreen from '@/screens/FeedScreen';

// SVG Icons
import {
  HomeIcon,
  QuestsIcon,
  InventoryIcon,
  ProfileIcon,
  FeedIcon
} from '@/components/TabIcons';
import InventoryScreen from '@/screens/InventoryScreen';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const IconComponent = {
    Home: HomeIcon,
    Quests: QuestsIcon,
    Feed: FeedIcon,
    Inventory: InventoryIcon,
    Profile: ProfileIcon,
  }[name];

  if (!IconComponent) return null;

  // Center button highlighting (Feed)
  const isCenter = name === 'Feed';
  const iconColor = isCenter
    ? "#FFFFFF"
    : (focused ? Theme.colors.primary : "#FFFFFF");

  return (
    <View style={[
      styles.iconContainer,
      focused && !isCenter && styles.iconContainerActive
    ]}>
      <IconComponent
        width={24}
        height={24}
        fill={iconColor}
      />
    </View>
  );
};

import { usePrivy, useEmbeddedEthereumWallet } from '@privy-io/expo';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  // Register for push notifications
  const { user } = usePrivy();
  const { wallets } = useEmbeddedEthereumWallet();
  const wallet = wallets.find(w => w.chainType === 'ethereum') || (user as any)?.wallet;
  usePushNotifications(wallet?.address);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: "#FFFFFF",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon name="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Quests"
        component={QuestScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon name="Quests" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon name="Feed" focused={focused} />,
          tabBarButton: (props) => (
            <TouchableOpacity
              {...(props as any)}
              style={[props.style, styles.centerButtonContainer]}
              activeOpacity={0.8}
            >
              <View style={styles.centerButton}>
                {props.children}
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon name="Inventory" focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon name="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(98, 65, 232, 0.1)',
    borderRadius: 12,
  },
  centerButtonContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.glow,
    borderWidth: 4,
    borderColor: Theme.colors.surface, // Matches tab bar bg to create "cutout" effect
  },
});
