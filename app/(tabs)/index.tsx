import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';

// Michi assets
const MichiAvatar = require('@/assets/michi/michi-avatar.png');
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

// Tag icons mapping
const TAG_ICONS: Record<string, string> = {
  'Weight Loss': '🔥',
  'Lower Calorie': '🔥',
  'Low Cal': '🔥',
  'Build Muscle': '💪',
  'Maintain': '⚖️',
  'Healthier': '💚',
  'High Protein': '🥩',
  'Low Carb': '🥗',
  'Keto': '🥑',
  'Vegan': '🌱',
  'Vegetarian': '🌿',
  'Mediterranean': '🫒',
  'Paleo': '🦴',
  'Gluten-Free': '🌾',
};

export default function HomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { goal, macroPriority, dietType, intolerances } = useOnboardingStore();

  const handleScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/scan');
  };

  const getGreetingText = () => {
    switch (goal) {
      case 'lose': return "Lets find lighter options";
      case 'gain': return "Time to fuel those gains";
      case 'maintain': return "Lets keep it balanced";
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
    
    // Check for gluten intolerance
    if (intolerances?.includes('gluten') || intolerances?.includes('Gluten')) {
      tags.push({ label: 'Gluten-Free', icon: '🌾', key: 'gluten' });
    }
    
    return tags.slice(0, 3); // Max 3 tags
  };

  const tags = buildTags();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.content}
      >
        {/* 1️⃣ Greeting Header */}
        <View style={styles.header}>
          <AppText 
            style={[
              styles.greeting, 
              { 
                fontFamily: theme.fonts.heading.bold,
                color: theme.colors.text 
              }
            ]}
          >
            {getGreetingText()}
          </AppText>
        </View>

        {/* 2️⃣ Michi Hero Section */}
        <View style={[styles.michiHero, { backgroundColor: theme.colors.bg }]}>
          {/* Placeholder for Michi illustration */}
          <View style={[styles.michiPlaceholder, { backgroundColor: theme.colors.cardCream }]}>
            <View style={[styles.michiCircle, { backgroundColor: theme.colors.michiTeal }]}>
              <AppText style={styles.michiEmoji}>🐹</AppText>
            </View>
            <AppText style={[styles.michiPlaceholderText, { color: theme.colors.caption }]}>
              Michi illustration placeholder
            </AppText>
            {/* Decorative elements placeholders */}
            <View style={[styles.deco1, { backgroundColor: theme.colors.secondary + '40' }]} />
            <View style={[styles.deco2, { backgroundColor: theme.colors.accent + '40' }]} />
          </View>
        </View>

        {/* 3️⃣ Scan a Menu CTA Button */}
        <TouchableOpacity 
          style={[styles.scanButton, { backgroundColor: theme.colors.brand }]}
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

        {/* 4️⃣ Two-Column Card Row */}
        <View style={styles.cardRow}>
          {/* Left — Your Focus */}
          <View style={[styles.focusCard, { backgroundColor: theme.colors.cardSage }]}>
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
                    style={[styles.tag, { backgroundColor: '#fff', borderColor: theme.colors.secondary }]}
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
          <View style={[styles.michiCard, { backgroundColor: theme.colors.cardPeach }]}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    lineHeight: 36,
  },
  // Michi Hero
  michiHero: {
    marginBottom: 16,
    alignItems: 'center',
  },
  michiPlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  michiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  michiEmoji: {
    fontSize: 64,
  },
  michiPlaceholderText: {
    fontSize: 13,
  },
  deco1: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  deco2: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  // Scan Button
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    marginBottom: 16,
    shadowColor: '#E86B50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
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
    borderWidth: 1,
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
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  michiSaysLabel: {
    fontSize: 14,
  },
  michiSays: {
    fontSize: 13,
    lineHeight: 18,
  },
});
