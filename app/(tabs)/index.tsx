import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { useHistoryStore } from '@/src/stores/historyStore';

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
  const index = Math.floor(Date.now() / 60000) % MICHI_TIPS.length; // Changes every minute
  return MICHI_TIPS[index];
};

export default function HomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { goal, macroPriority, dietType } = useOnboardingStore();
  const { loggedMeals } = useHistoryStore();

  const handleScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/scan');
  };

  const getGreetingText = () => {
    switch (goal) {
      case 'lose': return "Let's find lighter options";
      case 'gain': return "Time to fuel those gains";
      case 'maintain': return "Balance is the goal";
      default: return "Ready to eat smart?";
    }
  };

  // Build unique tags (no duplicates)
  const buildTags = () => {
    const tags: { label: string; key: string }[] = [];
    
    if (goal) {
      const goalLabels: Record<string, string> = {
        lose: 'Weight Loss',
        gain: 'Build Muscle',
        maintain: 'Maintain',
        health: 'Healthier',
      };
      tags.push({ label: goalLabels[goal] || goal, key: 'goal' });
    }
    
    // Add macro priority only if different from diet type
    if (macroPriority && macroPriority !== 'balanced') {
      const macroLabels: Record<string, string> = {
        highprotein: 'High Protein',
        lowcarb: 'Low Carb',
        lowcal: 'Low Cal',
      };
      const macroLabel = macroLabels[macroPriority];
      // Avoid duplicate with diet type
      if (macroLabel && !(dietType === 'lowcarb' && macroPriority === 'lowcarb')) {
        tags.push({ label: macroLabel, key: 'macro' });
      }
    }
    
    if (dietType && dietType !== 'none' && dietType !== 'cico') {
      const dietLabels: Record<string, string> = {
        keto: 'Keto',
        vegan: 'Vegan',
        vegetarian: 'Vegetarian',
        lowcarb: 'Low Carb',
        mediterranean: 'Mediterranean',
        paleo: 'Paleo',
      };
      tags.push({ label: dietLabels[dietType] || dietType, key: 'diet' });
    }
    
    return tags;
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
        <View style={[styles.michiHero, { backgroundColor: theme.colors.cardCream }]}>
          <AppText style={[styles.michiPlaceholderText, { color: theme.colors.caption }]}>
            Michi animation placeholder
          </AppText>
          <View style={[styles.michiPlaceholderIcon, { backgroundColor: theme.colors.michiTeal }]}>
            <AppText style={styles.michiEmoji}>🐱</AppText>
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
            <View style={styles.cardHeader}>
              <AppText 
                style={[
                  styles.cardTitle, 
                  { fontFamily: theme.fonts.heading.semiBold, color: theme.colors.text }
                ]}
              >
                Your Focus
              </AppText>
              <AppText style={styles.leafIcon}>🌿</AppText>
            </View>
            <View style={styles.tagsContainer}>
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <View 
                    key={tag.key} 
                    style={[styles.tag, { borderColor: theme.colors.secondary }]}
                  >
                    <AppText 
                      style={[
                        styles.tagText, 
                        { fontFamily: theme.fonts.body.semiBold, color: theme.colors.secondary }
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
            <View style={[styles.michiAvatar, { backgroundColor: theme.colors.michiTeal }]}>
              <AppText style={styles.michiAvatarEmoji}>🐱</AppText>
            </View>
            <AppText 
              style={[
                styles.michiSays, 
                { fontFamily: theme.fonts.body.semiBold, color: theme.colors.text }
              ]}
            >
              {getMichiTip()}
            </AppText>
          </View>
        </View>

        {/* Last logged meal (if exists) */}
        {loggedMeals.length > 0 && (
          <View style={[styles.lastMealCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <AppText style={[styles.lastMealLabel, { color: theme.colors.caption }]}>
              📋 Last logged: {loggedMeals[0].item.name}
            </AppText>
          </View>
        )}
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
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 32,
    lineHeight: 40,
  },
  // Michi Hero
  michiHero: {
    height: 280,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  michiPlaceholderText: {
    fontSize: 14,
    marginBottom: 16,
  },
  michiPlaceholderIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  michiEmoji: {
    fontSize: 48,
  },
  // Scan Button
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginBottom: 16,
    // Coral shadow
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
    marginBottom: 16,
  },
  focusCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
  },
  leafIcon: {
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  tagText: {
    fontSize: 12,
  },
  noTags: {
    fontSize: 13,
  },
  michiCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  michiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  michiAvatarEmoji: {
    fontSize: 20,
  },
  michiSays: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Last meal
  lastMealCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  lastMealLabel: {
    fontSize: 13,
  },
});
