import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/src/components/ui/AppText';
import { Card } from '@/src/components/ui/Card';
import { TrafficLightDot } from '@/src/components/ui/TrafficLightDot';
import { useAppTheme } from '@/src/theme/theme';
import { useScanStore } from '@/src/stores/scanStore';
import type { MenuItem, TopPick } from '@/src/lib/scanService';

export default function ResultsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { currentResult, clearScan } = useScanStore();

  if (!currentResult) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.centered}>
          <AppText style={[styles.errorText, { color: theme.colors.text }]}>
            No scan results available
          </AppText>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: theme.colors.brand }]}
            onPress={() => router.back()}
          >
            <AppText style={styles.backButtonText}>Go Back</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { restaurantName, topPicks, items } = currentResult;

  const handleItemPress = (item: MenuItem) => {
    Haptics.selectionAsync();
    // TODO: Navigate to item detail
    console.log('Selected item:', item.name);
  };

  const handleClose = () => {
    clearScan();
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <AppText style={[styles.closeButton, { color: theme.colors.subtext }]}>✕</AppText>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <AppText style={[styles.headerTitle, { color: theme.colors.text }]}>
            {restaurantName || 'Menu Results'}
          </AppText>
          <AppText style={[styles.headerSubtitle, { color: theme.colors.subtext }]}>
            {items.length} items found
          </AppText>
        </View>
        <View style={styles.closeButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Top Picks */}
        {topPicks.length > 0 && (
          <View style={styles.section}>
            <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
              🏆 Top Picks For You
            </AppText>
            {topPicks.map((pick) => (
              <TopPickCard key={pick.name} pick={pick} theme={theme} onPress={() => handleItemPress(pick)} />
            ))}
          </View>
        )}

        {/* Full Menu */}
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            📋 Full Menu
          </AppText>
          {items.map((item, index) => (
            <MenuItemCard 
              key={`${item.name}-${index}`} 
              item={item} 
              theme={theme} 
              onPress={() => handleItemPress(item)} 
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TopPickCard({ pick, theme, onPress }: { pick: TopPick; theme: any; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Card style={[styles.topPickCard, { borderColor: theme.colors.brand, borderWidth: 2 }]}>
        <View style={styles.topPickHeader}>
          <View style={[styles.badge, { backgroundColor: theme.colors.brand }]}>
            <AppText style={styles.badgeText}>#{pick.rank} {pick.badge}</AppText>
          </View>
          <TrafficLightDot tone={pick.trafficLight} />
        </View>
        <AppText style={[styles.itemName, { color: theme.colors.text }]}>{pick.name}</AppText>
        {pick.description && (
          <AppText style={[styles.itemDescription, { color: theme.colors.subtext }]} numberOfLines={2}>
            {pick.description}
          </AppText>
        )}
        <View style={styles.nutritionRow}>
          <NutritionPill label="Cal" value={pick.estimatedCalories} theme={theme} />
          <NutritionPill label="P" value={pick.estimatedProtein} unit="g" theme={theme} />
          <NutritionPill label="C" value={pick.estimatedCarbs} unit="g" theme={theme} />
          <NutritionPill label="F" value={pick.estimatedFat} unit="g" theme={theme} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function MenuItemCard({ item, theme, onPress }: { item: MenuItem; theme: any; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Card style={styles.menuItemCard}>
        <View style={styles.menuItemHeader}>
          <View style={styles.menuItemLeft}>
            <TrafficLightDot tone={item.trafficLight} />
            <AppText style={[styles.itemName, { color: theme.colors.text, marginLeft: 8 }]}>
              {item.name}
            </AppText>
          </View>
          <AppText style={[styles.calorieText, { color: theme.colors.subtext }]}>
            {item.estimatedCalories} cal
          </AppText>
        </View>
        {item.price && (
          <AppText style={[styles.priceText, { color: theme.colors.brand }]}>{item.price}</AppText>
        )}
      </Card>
    </TouchableOpacity>
  );
}

function NutritionPill({ label, value, unit = '', theme }: { label: string; value: number; unit?: string; theme: any }) {
  return (
    <View style={[styles.nutritionPill, { backgroundColor: theme.colors.bg }]}>
      <AppText style={[styles.nutritionLabel, { color: theme.colors.subtext }]}>{label}</AppText>
      <AppText style={[styles.nutritionValue, { color: theme.colors.text }]}>{value}{unit}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    fontSize: 24,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  topPickCard: {
    marginBottom: 12,
    padding: 16,
  },
  topPickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  nutritionRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  nutritionPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuItemCard: {
    marginBottom: 8,
    padding: 14,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  calorieText: {
    fontSize: 14,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 20,
  },
});
