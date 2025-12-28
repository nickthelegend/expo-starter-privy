import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Quest {
  id: string;
  name: string;
  description: string;
  reward: string;
  rewardType: 'NFT' | 'TOKEN' | 'XP';
  location?: { latitude: number; longitude: number };
  distance?: number;
  expiresAt?: string;
  isActive: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Reward {
  id: string;
  type: 'NFT' | 'TOKEN' | 'XP';
  name: string;
  image?: string;
  amount?: number;
  claimedAt: string;
}

interface UserStats {
  xp: number;
  level: number;
  streak: number;
  totalRewards: number;
}

interface AppState {
  hasCompletedOnboarding: boolean;
  quests: Quest[];
  rewards: Reward[];
  userStats: UserStats;
  dailyCheckInCompleted: boolean;
  lastCheckInDate: string | null;
  
  // Actions
  setOnboardingComplete: (value: boolean) => void;
  setQuests: (quests: Quest[]) => void;
  addReward: (reward: Reward) => void;
  updateUserStats: (stats: Partial<UserStats>) => void;
  completeDailyCheckIn: () => void;
  loadStoredData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  hasCompletedOnboarding: false,
  quests: [],
  rewards: [],
  userStats: {
    xp: 0,
    level: 1,
    streak: 0,
    totalRewards: 0,
  },
  dailyCheckInCompleted: false,
  lastCheckInDate: null,

  setOnboardingComplete: async (value) => {
    set({ hasCompletedOnboarding: value });
    await AsyncStorage.setItem('onboarding_complete', JSON.stringify(value));
  },

  setQuests: (quests) => set({ quests }),

  addReward: (reward) => {
    const { rewards, userStats } = get();
    set({
      rewards: [reward, ...rewards],
      userStats: {
        ...userStats,
        totalRewards: userStats.totalRewards + 1,
      },
    });
  },

  updateUserStats: (stats) => {
    set((state) => ({
      userStats: { ...state.userStats, ...stats },
    }));
  },

  completeDailyCheckIn: () => {
    const today = new Date().toDateString();
    const { userStats, lastCheckInDate } = get();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = lastCheckInDate === yesterday.toDateString();
    
    set({
      dailyCheckInCompleted: true,
      lastCheckInDate: today,
      userStats: {
        ...userStats,
        streak: isConsecutive ? userStats.streak + 1 : 1,
        xp: userStats.xp + 10,
      },
    });
  },

  loadStoredData: async () => {
    try {
      const onboarding = await AsyncStorage.getItem('onboarding_complete');
      if (onboarding) {
        set({ hasCompletedOnboarding: JSON.parse(onboarding) });
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  },
}));
