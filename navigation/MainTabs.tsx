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

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: { [key: string]: string } = {
    Home: '🏠',
    Map: '🗺️',
    Scan: '📱',
    Inventory: '🎒',
    Profile: '👤',
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Text style={styles.icon}>{icons[name]}</Text>
    </View>
  );
};

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 5,
        },
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon name="Home" focused={focused} />,
          tabBarTestID: 'tab-home',
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon name="Map" focused={focused} />,
          tabBarTestID: 'tab-map',
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon name="Scan" focused={focused} />,
          tabBarTestID: 'tab-scan',
          tabBarButton: (props) => (
            <View {...props} style={[props.style, styles.scanButtonContainer]}>
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
          tabBarTestID: 'tab-inventory',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabBarIcon name="Profile" focused={focused} />,
          tabBarTestID: 'tab-profile',
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
