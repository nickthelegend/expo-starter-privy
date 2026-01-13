# KyraQuest - Expo Mobile Full System Specification

This document contains a comprehensive breakdown of the KyraQuest mobile application logic, integrations, and database schema as of the latest implementation.

## 🚀 System Architecture
KyraQuest is a **SocialFi + Gamified Questing** platform built on the **Mantle Network (Sepolia)**. It integrates TikTok-style social interaction with real-world activity tracking.

### Tech Stack
- **Framework**: Expo (SDK 53)
- **State Management**: Zustand (`useAppStore.ts`)
- **Authentication**: Privy (Email, Web3 Wallets, OAuth)
- **Database/Backend**: Supabase (Real-time data, Auth, Storage)
- **Blockchain**: Mantle Sepolia (via `ethers.js` v6)
- **Location**: `expo-location` & `geolib` for geo-fencing.
- **Push Notifications**: `expo-notifications` (stored in Supabase).

---

## 💎 Blockchain Integrations (Mantle Sepolia)

### Contract Addresses
| Contract | Address | Purpose |
| :--- | :--- | :--- |
| **KYRA Token** | `0xA5a93...ee96` | Native ecosystem token (ERC20). |
| **QuestFactory** | `0x546Bb...e1c42` | Deploys new `Quest.sol` instances. |
| **QuestReelNFT** | `0xCC87F...a0Daa` | Mints NFTs for Video Feed posts (SocialFi). |
| **KyraShop** | `0xD221D...f3Df` | Handles coupon listing and direct purchases. |

### ABIs
Located in `constants/abis/`:
- `Quest.json`: Methods `claim()`, `hasClaimed(address)`.
- `KyraShop.json`: Methods `listItem()`, `buyItem(listingId)`.
- `QuestReelNFT.json`: Methods `mintReel(to, uri)`.

---

## 📊 Database Schema (Supabase)

### Important Tables
1. **`quests`**: Central store for all quest metadata.
   - `id` (UUID), `address` (Contract), `latitude`/`longitude` (Geo-validation), `quest_type` (map, qr, social).
2. **`quest_claims`**: Tracks user completions.
   - `player_wallet`, `quest_id`, `xp_earned`.
3. **`merchant_coupons`**: Items available in the Shop.
   - `listing_id` (on-chain ref), `price_amount`, `stock_count`.
4. **`seasons`**: Defines leaderboard periods.
   - `is_active`, `start_date`, `end_date`.
5. **`season_stats`**: Snapshots of rank per season.
   - `season_id`, `player_wallet`, `total_xp`.
6. **`user_push_tokens`**: Maps wallet addresses to Expo push tokens for targeted notifications.

---

## 🔍 Core Logic Implementations

### 1. Geo-Quest Validation
- **Screen**: `QuestDetailScreen.tsx`
- **Logic**: Uses `geolib.getDistance` between `userLocation` and `quest.metadata.latitude/longitude`.
- **Constraint**: Users must be within **100 meters** to call the contract `claim()` method.

### 2. QR Code Scanning
- **Screen**: `ScanScreen.tsx`
- **Format**: Supports `kyraquest://quest/[UUID]` or raw `UUID`.
- **Flow**: Scans QR -> Fetches Quest Metadata from Supabase -> Navigates to `QuestDetail`.

### 3. "My Inventory" UI
- **Screen**: `ProfileScreen.tsx` (Bottom section)
- **Data**: Fetches `merchant_coupon_claims` joined with `merchant_coupons`.
- **Status**: Displayed as "READY TO USE" or "REDEEMED".

### 4. Push Notifications
- **Hook**: `hooks/usePushNotifications.ts`.
- **Trigger**: Registers on login; saves token and wallet to `user_push_tokens`.
- **Admin**: The web admin panel at `/admin` can broadcast titles/bodies to all registered tokens.

---

## 🛠️ Configuration & Environment

Settings are located in `app.json` under `extra`:
- **Privy App ID**: `cmc75u6a501xajs0mpi4fxpd5`
- **Supabase URL**: `https://phidvdsfmtetcsqwmfnv.supabase.co`
- **Google Maps Key**: Needed for `MapScreen` visualization.

---

## 👨‍💻 Key Entry Points
- **`app/_layout.tsx`**: Wraps the app in `PrivyProvider` and `ThemeProvider`.
- **`navigation/MainTabs.tsx`**: Defines the 5-tab core navigation.
- **`store/useAppStore.ts`**: Handles global loading, stats, and check-in persistence.

## ⚠️ Internal Notes / Known Issues
- **ABI Formats**: All ABIs in `constants/abis/` are plain arrays. Use `const QuestABI = QuestArtifact;` NOT `.abi`.
- **Native Modules**: If adding new permissions (Location/Camera), a recompilation for the development client (`npx expo run:android`) may be required.
