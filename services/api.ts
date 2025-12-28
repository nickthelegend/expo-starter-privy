import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.backendUrl || 'https://spin-rewards-21.preview.emergentagent.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Quest APIs
export const fetchQuests = async () => {
  try {
    const response = await api.get('/api/quests');
    return response.data;
  } catch (error) {
    console.error('Error fetching quests:', error);
    return [];
  }
};

// QR Code verification
export const verifyQRCode = async (qrData: string) => {
  try {
    const response = await api.post('/api/verify-qr', { qrData });
    return response.data;
  } catch (error) {
    console.error('Error verifying QR code:', error);
    throw error;
  }
};

// Claim reward
export const claimReward = async (questId: string, walletAddress: string) => {
  try {
    const response = await api.post('/api/claim-reward', {
      questId,
      walletAddress,
    });
    return response.data;
  } catch (error) {
    console.error('Error claiming reward:', error);
    throw error;
  }
};

// Daily check-in
export const completeDailyCheckIn = async (userId: string) => {
  try {
    const response = await api.post('/api/daily-checkin', { userId });
    return response.data;
  } catch (error) {
    console.error('Error completing daily check-in:', error);
    throw error;
  }
};

// Spin to earn
export const spinWheel = async (userId: string) => {
  try {
    const response = await api.post('/api/spin', { userId });
    return response.data;
  } catch (error) {
    console.error('Error spinning wheel:', error);
    throw error;
  }
};

// Get user rewards
export const fetchUserRewards = async (walletAddress: string) => {
  try {
    const response = await api.get(`/api/rewards/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return [];
  }
};

export default api;
