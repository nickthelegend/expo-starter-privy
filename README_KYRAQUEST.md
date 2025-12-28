# KyraQuest - Web3 Quest & Airdrop Platform

## Overview
KyraQuest is a premium, minimalistic React Native mobile app built with Expo that enables users to explore real-world quests, scan QR codes, and claim Web3 rewards.

## Tech Stack
- **Framework**: Expo (managed workflow)
- **Language**: TypeScript
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **State Management**: Zustand
- **Authentication**: Privy React Native SDK
- **Blockchain**: ethers.js / viem (Ethereum Sepolia)
- **Camera**: Expo Camera (QR scanning)
- **Maps**: React Native Maps (Google Maps)
- **HTTP Client**: Axios
- **Storage**: AsyncStorage

## Features Implemented

### 1. Onboarding Flow
- 4 swipeable slides explaining app features
- Skip and Continue as Guest options
- Smooth animations with purple gradients

### 2. Authentication
- Privy integration with email login
- Embedded wallet auto-creation
- Support for Google/Twitter OAuth (configurable)

### 3. Main App Screens

#### Home Tab
- User greeting and stats (Level, XP, Streak)
- Daily check-in card
- Horizontal quest carousel with pagination
- Spin to Earn feature
- Featured drops section

#### Map Tab
- Dark-themed Google Maps
- Quest markers with rarity-based colors
- Quest preview modal
- "Scan QR" CTA button

#### Scan Tab
- Full-screen QR scanner
- Camera permission handling
- Focus frame overlay
- Loading state during verification
- Navigation to claim flow

#### Inventory Tab
- User stats cards (XP, Streak, Level, Items)
- Filter buttons (ALL, NFT, TOKEN, XP)
- Grid layout for rewards
- Rarity indicators
- Empty state

#### Profile Tab
- User avatar and verification badge
- Wallet address display (Ethereum Sepolia)
- Trust level progress
- Settings (Notifications, Location, Privacy, Help)
- Logout functionality

### 4. Claim Flow
- Reward preview with icon and type badge
- Wallet address confirmation
- Loading state during claiming
- Success animation
- Stats display (XP earned, total rewards)
- Navigation to inventory

## Project Structure

```
/app
├── app/
│   ├── _layout.tsx          # Root layout with Privy provider
│   └── index.tsx            # Main entry point with routing logic
├── components/
│   ├── LoginScreen.tsx      # Themed login screen
│   └── login/
│       └── PrivyUI.tsx      # Privy login button
├── constants/
│   └── Theme.ts             # Color palette and styling
├── navigation/
│   ├── AppNavigator.tsx     # Stack navigator
│   └── MainTabs.tsx         # Bottom tab navigator
├── screens/
│   ├── OnboardingScreen.tsx
│   ├── HomeScreen.tsx
│   ├── MapScreen.tsx
│   ├── ScanScreen.tsx
│   ├── InventoryScreen.tsx
│   ├── ProfileScreen.tsx
│   └── ClaimScreen.tsx
├── services/
│   └── api.ts               # API client and functions
├── store/
│   └── useAppStore.ts       # Zustand global state
└── app.json                 # Expo configuration
```

## Environment Variables (in app.json)
- `privyAppId`: Privy authentication app ID
- `privyClientId`: Privy client ID
- `supabaseUrl`: Supabase database URL
- `supabaseKey`: Supabase publishable key
- `backendUrl`: Backend API endpoint
- `googleMapsApiKey`: Google Maps API key

## Theme Colors
- Primary: #6241E8
- Secondary: #795CEB
- Background: #000000
- Surface: #181121
- Border: #1E1E1E
- Text: #FFFFFF
- Text Muted: rgba(255,255,255,0.6)

## Key Features

### Anti-Sybil Protection
- Trust level system
- Verified user badges
- Fair reward distribution

### Gamification
- Daily check-in streaks
- XP and leveling system
- Rarity tiers (Common, Rare, Epic, Legendary)
- Spin to earn mechanic

### Web3 Integration
- Privy embedded wallets
- Ethereum Sepolia network
- NFT and token rewards
- On-chain transaction support

## Running the App

```bash
# Install dependencies
yarn install

# Start Expo development server
yarn start

# Run on Android
yarn android

# Run on iOS
yarn ios
```

## Next Steps for Backend Integration

1. **Quest API**: Connect to `/api/quests` endpoint
2. **QR Verification**: Implement `/api/verify-qr` endpoint
3. **Claim Rewards**: Connect to `/api/claim-reward` with blockchain signing
4. **Daily Check-in**: Implement `/api/daily-checkin` endpoint
5. **Spin Wheel**: Connect to `/api/spin` endpoint
6. **User Rewards**: Fetch from `/api/rewards/{walletAddress}`

## Testing

All interactive elements include `data-testid` attributes for testing:
- Onboarding buttons
- Tab navigation
- Quest cards
- Claim flow
- Settings options

## Notes

- Camera permissions are required for QR scanning
- Location permissions needed for map features
- Wallet connection required only for claiming rewards
- Guest mode allows browsing without authentication
- Mock data used for UI demonstration (ready for API integration)
