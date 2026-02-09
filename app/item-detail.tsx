import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AppText } from '@/src/components/ui/AppText';
import { Card } from '@/src/components/ui/Card';
import { useAppTheme } from '@/src/theme/theme';
import { useScanStore } from '@/src/stores/scanStore';

export default function ItemDetailScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { selectedItem, setSelectedItem } = useScanStore();

  if (!selectedItem) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.centered}>
          <AppText style={{ color: theme.colors.text }}>No item selected</AppText>
          <TouchableOpacity onPress={() => router.back()}>
            <AppText style={{ color: theme.colors.brand, marginTop: 16 }}>Go Back</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const item = selectedItem;
  
  const getScoreColor = (score: number) => {
    if (score >= 70) return '#34C759'; // Green
    if (score >= 40) return '#FF9500'; // Amber
    return '#FF3B30'; // Red
  };

  const handleClose = () => {
    setSelectedItem(null);
    router.back();
  };

  const generateOrderScript = () => {
    const mods = item.modificationTips || [];
    if (mods.length === 0) {
      return `"Hi, I'd like the ${item.name}, please."`;
    }
    const modText = mods.slice(0, 2).map(m => {
      // Convert tip to order language
      if (m.toLowerCase().includes('sauce on the side')) return 'with the sauce on the side';
      if (m.toLowerCase().includes('dressing on the side')) return 'with dressing on the side';
      if (m.toLowerCase().includes('no bread')) return 'without the bread';
      if (m.toLowerCase().includes('sub') && m.toLowerCase().includes('salad')) return 'with a side salad instead of fries';
      if (m.toLowerCase().includes('grilled')) return 'grilled instead of fried';
      return m.toLowerCase().replace('ask for ', '').replace('request ', '');
    }).join(', and ');
    
    return `"Hi, I'd like the ${item.name}, ${modText}, please."`;
  };

  const orderScript = generateOrderScript();

  const copyScript = async () => {
    await Clipboard.setStringAsync(orderScript.replace(/"/g, ''));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const shareItem = async () => {
    try {
      await Share.share({
        message: `${item.name} - ${item.estimatedCalories} cal | Score: ${item.score}/100 | ${item.matchLabel}`,
      });
    } catch (e) {
      console.log('Share failed:', e);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <FontAwesome name="chevron-down" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={shareItem} style={styles.shareButton}>
          <FontAwesome name="share" size={18} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Score Circle */}
        <View style={styles.scoreSection}>
          <View style={[styles.scoreCircle, { borderColor: getScoreColor(item.score) }]}>
            <AppText style={[styles.scoreNumber, { color: getScoreColor(item.score) }]}>
              {item.score}
            </AppText>
            <AppText style={[styles.scoreLabel, { color: theme.colors.subtext }]}>
              /100
            </AppText>
          </View>
          <AppText style={[styles.matchLabel, { color: getScoreColor(item.score) }]}>
            {item.matchLabel || 'Match'}
          </AppText>
        </View>

        {/* Item Name & Description */}
        <View style={styles.titleSection}>
          <AppText style={[styles.itemName, { color: theme.colors.text }]}>
            {item.name}
          </AppText>
          {item.price && (
            <AppText style={[styles.price, { color: theme.colors.brand }]}>
              {item.price}
            </AppText>
          )}
          {item.description && (
            <AppText style={[styles.description, { color: theme.colors.subtext }]}>
              {item.description}
            </AppText>
          )}
        </View>

        {/* Allergen Warning */}
        {item.allergenWarning && (
          <Card style={[styles.allergenCard, { backgroundColor: '#FF3B3015', borderColor: '#FF3B30' }]}>
            <View style={styles.allergenRow}>
              <FontAwesome name="exclamation-triangle" size={18} color="#FF3B30" />
              <AppText style={[styles.allergenText, { color: '#FF3B30' }]}>
                {item.allergenWarning}
              </AppText>
            </View>
            <AppText style={[styles.allergenDisclaimer, { color: '#FF3B30' }]}>
              ⚠️ Always confirm allergens with restaurant staff
            </AppText>
          </Card>
        )}

        {/* Score Reasons */}
        {item.scoreReasons && item.scoreReasons.length > 0 && (
          <Card style={styles.reasonsCard}>
            <AppText style={[styles.cardTitle, { color: theme.colors.text }]}>
              Why this score?
            </AppText>
            {item.scoreReasons.map((reason, i) => (
              <View key={i} style={styles.reasonRow}>
                <FontAwesome 
                  name={item.score >= 50 ? 'check-circle' : 'info-circle'} 
                  size={16} 
                  color={item.score >= 50 ? '#34C759' : '#FF9500'} 
                />
                <AppText style={[styles.reasonText, { color: theme.colors.text }]}>
                  {reason}
                </AppText>
              </View>
            ))}
          </Card>
        )}

        {/* Nutrition */}
        <Card style={styles.nutritionCard}>
          <AppText style={[styles.cardTitle, { color: theme.colors.text }]}>
            Estimated Nutrition
          </AppText>
          <View style={styles.nutritionGrid}>
            <NutritionBox 
              label="Calories" 
              value={item.estimatedCalories} 
              unit="" 
              theme={theme} 
              highlight 
            />
            <NutritionBox 
              label="Protein" 
              value={item.estimatedProtein} 
              unit="g" 
              theme={theme} 
            />
            <NutritionBox 
              label="Carbs" 
              value={item.estimatedCarbs} 
              unit="g" 
              theme={theme} 
            />
            <NutritionBox 
              label="Fat" 
              value={item.estimatedFat} 
              unit="g" 
              theme={theme} 
            />
          </View>
          <AppText style={[styles.disclaimer, { color: theme.colors.subtext }]}>
            Nutrition values are estimates and may vary. Always confirm allergens with staff.
          </AppText>
        </Card>

        {/* Dietary Tags */}
        <View style={styles.tagsRow}>
          {item.isVegetarian && (
            <View style={[styles.tag, { backgroundColor: '#34C75920' }]}>
              <AppText style={[styles.tagText, { color: '#34C759' }]}>🥬 Vegetarian</AppText>
            </View>
          )}
          {item.isVegan && (
            <View style={[styles.tag, { backgroundColor: '#34C75920' }]}>
              <AppText style={[styles.tagText, { color: '#34C759' }]}>🌱 Vegan</AppText>
            </View>
          )}
          {item.isGlutenFree && (
            <View style={[styles.tag, { backgroundColor: '#FF950020' }]}>
              <AppText style={[styles.tagText, { color: '#FF9500' }]}>🌾 Gluten-Free</AppText>
            </View>
          )}
        </View>

        {/* Modification Tips */}
        {item.modificationTips && item.modificationTips.length > 0 && (
          <Card style={styles.modsCard}>
            <AppText style={[styles.cardTitle, { color: theme.colors.text }]}>
              💡 Make it Healthier
            </AppText>
            {item.modificationTips.map((tip, i) => (
              <View key={i} style={styles.modRow}>
                <View style={[styles.modBullet, { backgroundColor: theme.colors.brand }]} />
                <AppText style={[styles.modText, { color: theme.colors.text }]}>
                  {tip}
                </AppText>
              </View>
            ))}
          </Card>
        )}

        {/* What to Say */}
        <Card style={[styles.scriptCard, { backgroundColor: theme.colors.brand + '10', borderColor: theme.colors.brand }]}>
          <View style={styles.scriptHeader}>
            <AppText style={[styles.cardTitle, { color: theme.colors.text }]}>
              🗣️ What to Say
            </AppText>
            <TouchableOpacity onPress={copyScript} style={styles.copyButton}>
              <FontAwesome name="copy" size={16} color={theme.colors.brand} />
              <AppText style={[styles.copyText, { color: theme.colors.brand }]}>Copy</AppText>
            </TouchableOpacity>
          </View>
          <AppText style={[styles.scriptText, { color: theme.colors.text }]}>
            {orderScript}
          </AppText>
        </Card>

        {/* Ingredients */}
        {item.ingredients && item.ingredients.length > 0 && (
          <View style={styles.ingredientsSection}>
            <AppText style={[styles.smallTitle, { color: theme.colors.subtext }]}>
              Likely Ingredients
            </AppText>
            <AppText style={[styles.ingredientsList, { color: theme.colors.text }]}>
              {item.ingredients.join(' · ')}
            </AppText>
          </View>
        )}

        {/* Log Button */}
        <TouchableOpacity 
          style={[styles.logButton, { backgroundColor: theme.colors.brand }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // TODO: Log this meal
            handleClose();
          }}
        >
          <FontAwesome name="plus" size={18} color="#fff" />
          <AppText style={styles.logButtonText}>Log This Meal</AppText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function NutritionBox({ label, value, unit, theme, highlight = false }: {
  label: string;
  value: number;
  unit: string;
  theme: any;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.nutritionBox, highlight && { backgroundColor: theme.colors.brand + '15' }]}>
      <AppText style={[styles.nutritionValue, { color: theme.colors.text }]}>
        {value}{unit}
      </AppText>
      <AppText style={[styles.nutritionLabel, { color: theme.colors.subtext }]}>
        {label}
      </AppText>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 18,
    marginTop: -4,
  },
  matchLabel: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  itemName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  allergenCard: {
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  allergenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  allergenText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  allergenDisclaimer: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  reasonsCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 15,
    flex: 1,
  },
  nutritionCard: {
    padding: 16,
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionBox: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    flex: 1,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  nutritionLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  disclaimer: {
    fontSize: 11,
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modsCard: {
    padding: 16,
    marginBottom: 16,
  },
  modRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  modBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  modText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  scriptCard: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  scriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scriptText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  ingredientsSection: {
    marginBottom: 24,
  },
  smallTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  ingredientsList: {
    fontSize: 14,
    lineHeight: 20,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  logButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
