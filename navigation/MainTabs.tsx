import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '@/constants/Theme';
import HomeScreen from '@/screens/HomeScreen';
import MapScreen from '@/screens/MapScreen';
import ScanScreen from '@/screens/ScanScreen';
import InventoryScreen from '@/screens/InventoryScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import QuestScreen from '@/screens/QuestScreen';

// SVG Icons
import {
  HomeIcon,
  QuestsIcon,
  ScanIcon,
  InventoryIcon,
  ProfileIcon
} from '@/components/TabIcons';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const IconComponent = {
    Home: HomeIcon,
    Quests: QuestsIcon,
    Scan: ScanIcon,
    Inventory: InventoryIcon,
    Profile: ProfileIcon,
  }[name];

  if (!IconComponent) return null;

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <IconComponent
        width={24}
        height={24}
        fill={focused ? Theme.colors.primary : "#FFFFFF"}
      />
    </View>
  );
};

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
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
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon name="Scan" focused={focused} />,
          tabBarButton: (props) => (
            <View {...(props as any)} style={[props.style, styles.scanButtonContainer]}>
              <View style={styles.scanButton}>
                {props.children}
              </View>
            </View>
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
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
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
  icon: {
    fontSize: 24,
  },
  scanButtonContainer: {
    top: -15,
  },
  scanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.glow,
  },
});
