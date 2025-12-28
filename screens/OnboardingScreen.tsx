import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/constants/Theme';
import { useAppStore } from '@/store/useAppStore';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    title: 'Explore Real-World Quests',
    description: 'Discover exciting quests and challenges on an interactive map near you',
    icon: '🗺️',
  },
  {
    title: 'Scan QR Codes',
    description: 'Scan QR codes at quest locations to claim exclusive airdrops and rewards',
    icon: '📱',
  },
  {
    title: 'Earn Daily Rewards',
    description: 'Build your streak with daily check-ins and spin to earn amazing prizes',
    icon: '🎁',
  },
  {
    title: 'Verified & Fair',
    description: 'Anti-sybil protection ensures genuine users get rewarded fairly',
    icon: '✅',
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const { setOnboardingComplete } = useAppStore();

  const handleNext = () => {
    if (currentPage < slides.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    setOnboardingComplete(true);
    onComplete();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#181121', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      <TouchableOpacity 
        style={styles.skipButton} 
        onPress={handleSkip}
        data-testid="onboarding-skip-button"
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={Theme.gradients.primary}
                style={styles.iconGradient}
              >
                <Text style={styles.icon}>{slide.icon}</Text>
              </LinearGradient>
            </View>
            
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </PagerView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          data-testid="onboarding-next-button"
        >
          <LinearGradient
            colors={Theme.gradients.primary}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>
              {currentPage === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {currentPage === slides.length - 1 && (
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGetStarted}
            data-testid="onboarding-guest-button"
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: Theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  pager: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Theme.colors.primary,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: 12,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  guestButton: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  guestButtonText: {
    color: Theme.colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
});
