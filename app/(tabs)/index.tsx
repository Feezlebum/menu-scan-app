import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/components/ui/AppText';
import { TrafficLightDot } from '@/src/components/ui/TrafficLightDot';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useHistoryStore } from '@/src/stores/historyStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Michi assets
const MichiHero = require('@/assets/michi-hero.png');
const MichiAvatar = require('@/assets/michi-avatar.png');

// Botanical assets
const CornerTopLeft = require('@/assets/botanicals/corner-top-left.png');
const CornerTopRight = require('@/assets/botanicals/corner-top-right.png');
const CornerBottomLeft = require('@/assets/botanicals/corner-bottom-left.png');
const Leaf1 = require('@/assets/botanicals/leaf-1.png');
const SmallLeaf = require('@/assets/botanicals/small-leaf.png');
const Sparkle = require('@/assets/botanicals/sparkle.png');
const Star = require('@/assets/botanicals/star.png');
const Lemon = require('@/assets/botanicals/lemon.png');
const Avocado = require('@/assets/botanicals/avocado.png');

// Michi's rotating tips
const MICHI_TIPS = [
  "Try swapping creamy dressings for vinaigrettes!",
  "Grilled > fried — same flavor, fewer calories!",
  "Ask for sauce on the side to control portions.",
  "Protein-rich dishes keep you full longer.",
  "Don't skip the veggies — they're your friends!",
  "Water before meals helps with portions.",
];

const getMichiTip = () => {
  const index = Math.floor(Date.now() / 60000) % MICHI_TIPS.length;
  return MICHI_TIPS[index];
};

export default function HomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { goal, macroPriority, dietType, intolerances } = useOnboardingStore();
  const { loggedMeals } = useHistoryStore();
  
  const lastMeal = loggedMeals[0];

  const handleScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/scan');
  };

  const getGreetingText = () => {
    switch (goal) {
      case 'lose': return "Let's find lighter options";
      case 'gain': return "Time to fuel those gains";
      case 'maintain': return "Let's keep it balanced";
      default: return "Ready to eat smart?";
    }
  };

  // Build unique tags with icons
  const buildTags = () => {
    const tags: { label: string; icon: string; key: string }[] = [];
    
    if (goal === 'lose') {
      tags.push({ label: 'Lower Calorie', icon: '🔥', key: 'goal' });
    } else if (goal === 'gain') {
      tags.push({ label: 'Build Muscle', icon: '💪', key: 'goal' });
    } else if (goal === 'maintain') {
      tags.push({ label: 'Maintain', icon: '⚖️', key: 'goal' });
    }
    
    if (dietType === 'vegan') {
      tags.push({ label: 'Vegan', icon: '🌱', key: 'diet' });
    } else if (dietType === 'keto') {
      tags.push({ label: 'Keto', icon: '🥑', key: 'diet' });
    } else if (dietType === 'lowcarb' || macroPriority === 'lowcarb') {
      tags.push({ label: 'Low Carb', icon: '🥗', key: 'diet' });
    } else if (dietType === 'mediterranean') {
      tags.push({ label: 'Mediterranean', icon: '🫒', key: 'diet' });
    }
    
    if (intolerances?.includes('gluten') || intolerances?.includes('Gluten')) {
      tags.push({ label: 'Gluten-Free', icon: '🌾', key: 'gluten' });
    }
    
    return tags.slice(0, 3);
  };

  const tags = buildTags();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Botanical decorations - corner garlands at 15-20% opacity */}
      <View style={styles.botanicalLayer} pointerEvents="none">
        {/* Corner garlands - clearly visible warm illustrated frames */}
        <Image source={CornerTopLeft} style={styles.cornerTopLeft} resizeMode="contain" />
        <Image source={CornerTopRight} style={styles.cornerTopRight} resizeMode="contain" />
        <Image source={CornerBottomLeft} style={styles.cornerBottomLeft} resizeMode="contain" />
        <Image source={CornerBottomLeft} style={styles.cornerBottomRight} resizeMode="contain" />
        
        {/* Scattered food items in content area - 15-20% opacity */}
        {/* Near Michi (left side, around salad area) */}
        <Image source={Avocado} style={styles.avocadoNearMichi} resizeMode="contain" />
        {/* Between cards area (right side) */}
        <Image source={Lemon} style={styles.lemonBetweenCards} resizeMode="contain" />
        {/* Near scan button (left) */}
        <Image source={Leaf1} style={styles.leafNearScan} resizeMode="contain" />
        {/* Near Last Logged card */}
        <Image source={SmallLeaf} style={styles.leafNearLastLogged} resizeMode="contain" />
        {/* Sparkle stars scattered */}
        <Image source={Sparkle} style={styles.sparkleTop} resizeMode="contain" />
        <Image source={Star} style={styles.starMid} resizeMode="contain" />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.content}
        >
          {/* Greeting Header */}
          <View style={styles.header}>
            <AppText 
              variant="heading"
              style={[
                styles.greeting, 
                { 
                  fontFamily: 'Baloo2-Bold',
                  color: theme.colors.text 
                }
              ]}
            >
              {getGreetingText()}
            </AppText>
          </View>

          {/* Michi Hero - NO card border, sits on background */}
          <View style={styles.michiHero}>
            <Image 
              source={MichiHero} 
              style={styles.michiHeroImage}
              resizeMode="contain"
            />
          </View>

          {/* Scan a Menu CTA Button */}
          <TouchableOpacity 
            style={styles.scanButton}
            onPress={handleScan}
            activeOpacity={0.9}
          >
            <FontAwesome name="camera" size={20} color="#fff" style={styles.scanIcon} />
            <AppText 
              style={[
                styles.scanButtonText, 
                { fontFamily: theme.fonts.heading.semiBold }
              ]}
            >
              Scan a Menu
            </AppText>
          </TouchableOpacity>

          {/* Two-Column Card Row */}
          <View style={styles.cardRow}>
            {/* Left — Your Focus */}
            <View style={[styles.focusCard, { backgroundColor: '#E8F5E2' }]}>
              <AppText 
                style={[
                  styles.cardTitle, 
                  { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }
                ]}
              >
                Your Focus
              </AppText>
              <View style={styles.tagsContainer}>
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <View 
                      key={tag.key} 
                      style={[styles.tag, { backgroundColor: '#fff', borderColor: '#6BAF7A' }]}
                    >
                      <AppText style={styles.tagIcon}>{tag.icon}</AppText>
                      <AppText 
                        style={[
                          styles.tagText, 
                          { fontFamily: theme.fonts.body.semiBold, color: theme.colors.text }
                        ]}
                      >
                        {tag.label}
                      </AppText>
                    </View>
                  ))
                ) : (
                  <AppText style={[styles.noTags, { color: theme.colors.caption }]}>
                    Set in Profile
                  </AppText>
                )}
              </View>
            </View>

            {/* Right — Michi says */}
            <View style={[styles.michiCard, { backgroundColor: '#FFE8D6' }]}>
              <View style={styles.michiSaysHeader}>
                <Image source={MichiAvatar} style={styles.michiAvatar} />
                <AppText 
                  style={[
                    styles.michiSaysLabel, 
                    { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }
                  ]}
                >
                  Michi says:
                </AppText>
              </View>
              <AppText 
                style={[
                  styles.michiSays, 
                  { fontFamily: theme.fonts.body.regular, color: theme.colors.text }
                ]}
              >
                {getMichiTip()}
              </AppText>
            </View>
          </View>

          {/* Last Scan Preview - fills empty space */}
          {lastMeal ? (
            <View style={[styles.lastScanCard, { backgroundColor: '#fff', borderColor: theme.colors.border }]}>
              <View style={styles.lastScanHeader}>
                <AppText style={[styles.lastScanLabel, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
                  📋 Last Logged
                </AppText>
                <AppText style={[styles.lastScanTime, { color: theme.colors.caption }]}>
                  {formatTimeAgo(lastMeal.loggedAt)}
                </AppText>
              </View>
              <View style={styles.lastScanContent}>
                <TrafficLightDot tone={lastMeal.item.trafficLight} size={12} />
                <View style={styles.lastScanInfo}>
                  <AppText 
                    style={[styles.lastScanName, { fontFamily: theme.fonts.body.semiBold, color: theme.colors.text }]} 
                    numberOfLines={1}
                  >
                    {lastMeal.item.name}
                  </AppText>
                  <AppText style={[styles.lastScanMacros, { color: theme.colors.caption }]}>
                    {lastMeal.item.estimatedCalories} cal · {lastMeal.item.estimatedProtein}g P · {lastMeal.item.estimatedCarbs}g C
                  </AppText>
                </View>
              </View>
              {lastMeal.restaurantName && (
                <AppText style={[styles.restaurantName, { color: theme.colors.caption }]}>
                  {lastMeal.restaurantName}
                </AppText>
              )}
            </View>
          ) : (
            <View style={[styles.welcomeCard, { backgroundColor: '#FFF0D4' }]}>
              <AppText style={[styles.welcomeEmoji]}>👋</AppText>
              <AppText style={[styles.welcomeTitle, { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }]}>
                Welcome to MenuScan!
              </AppText>
              <AppText style={[styles.welcomeText, { fontFamily: theme.fonts.body.regular, color: theme.colors.subtext }]}>
                Scan your first restaurant menu to get personalized healthy recommendations.
              </AppText>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  // Botanical decorations layer
  botanicalLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  // Corner garlands - 18% opacity (clearly visible warm illustrated frames)
  cornerTopLeft: {
    position: 'absolute',
    top: 40,
    left: -20,
    width: 160,
    height: 160,
    opacity: 0.18,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 50,
    right: -25,
    width: 150,
    height: 150,
    opacity: 0.18,
    transform: [{ scaleX: -1 }],
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 80,
    left: -20,
    width: 140,
    height: 140,
    opacity: 0.18,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 80,
    right: -20,
    width: 140,
    height: 140,
    opacity: 0.18,
    transform: [{ scaleX: -1 }], // Flip horizontally
  },
  // Scattered food items - 15-20% opacity with slight rotations
  avocadoNearMichi: {
    position: 'absolute',
    top: 320,
    left: 15,
    width: 35,
    height: 35,
    opacity: 0.15,
    transform: [{ rotate: '-15deg' }],
  },
  lemonBetweenCards: {
    position: 'absolute',
    top: 680,
    right: 20,
    width: 30,
    height: 30,
    opacity: 0.12,
    transform: [{ rotate: '20deg' }],
  },
  leafNearScan: {
    position: 'absolute',
    top: 560,
    left: 25,
    width: 25,
    height: 25,
    opacity: 0.15,
    transform: [{ rotate: '30deg' }],
  },
  leafNearLastLogged: {
    position: 'absolute',
    top: 850,
    right: 30,
    width: 20,
    height: 20,
    opacity: 0.12,
    transform: [{ rotate: '-25deg' }],
  },
  sparkleTop: {
    position: 'absolute',
    top: 200,
    right: 40,
    width: 18,
    height: 18,
    opacity: 0.15,
  },
  starMid: {
    position: 'absolute',
    top: 480,
    right: 25,
    width: 16,
    height: 16,
    opacity: 0.12,
  },
  // Header
  header: {
    marginBottom: 8,
    zIndex: 1,
  },
  greeting: {
    fontSize: 32,
    lineHeight: 40,
  },
  // Michi Hero - larger, no card
  michiHero: {
    alignItems: 'center',
    marginBottom: 12,
    zIndex: 1,
  },
  michiHeroImage: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75,
  },
  // Scan Button
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    marginBottom: 16,
    backgroundColor: '#E86B50',
    shadowColor: '#E86B50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 1,
  },
  scanIcon: {
    marginRight: 10,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  // Two-column row
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    zIndex: 1,
  },
  focusCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
  },
  cardTitle: {
    fontSize: 15,
    marginBottom: 10,
  },
  tagsContainer: {
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 4,
  },
  tagIcon: {
    fontSize: 12,
  },
  tagText: {
    fontSize: 12,
  },
  noTags: {
    fontSize: 13,
  },
  michiCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
  },
  michiSaysHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  michiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  michiSaysLabel: {
    fontSize: 14,
  },
  michiSays: {
    fontSize: 13,
    lineHeight: 18,
  },
  // Last Scan Card
  lastScanCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    zIndex: 1,
  },
  lastScanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lastScanLabel: {
    fontSize: 15,
  },
  lastScanTime: {
    fontSize: 12,
  },
  lastScanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lastScanInfo: {
    flex: 1,
  },
  lastScanName: {
    fontSize: 15,
  },
  lastScanMacros: {
    fontSize: 12,
    marginTop: 2,
  },
  restaurantName: {
    fontSize: 12,
    marginTop: 8,
  },
  // Welcome Card (when no history)
  welcomeCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  welcomeEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
