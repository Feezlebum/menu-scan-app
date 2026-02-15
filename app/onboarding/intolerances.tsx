import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { OptionCard } from '@/src/components/onboarding/OptionCard';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import MichiAssets from '@/src/utils/michiAssets';

const INTOLERANCES = [
  { value: 'none', label: 'none', emoji: '✅' },
  { value: 'peanuts', label: 'peanuts', emoji: '🥜' },
  { value: 'tree_nuts', label: 'tree nuts', emoji: '🌰' },
  { value: 'dairy', label: 'dairy / lactose', emoji: '🥛' },
  { value: 'gluten', label: 'gluten / wheat', emoji: '🌾' },
  { value: 'eggs', label: 'eggs', emoji: '🥚' },
  { value: 'fish', label: 'fish', emoji: '🐟' },
  { value: 'shellfish', label: 'shellfish / crustaceans', emoji: '🦐' },
  { value: 'soy', label: 'soy / soya', emoji: '🫘' },
  { value: 'sesame', label: 'sesame', emoji: '🌱' },
  { value: 'celery', label: 'celery', emoji: '🌿' },
  { value: 'lupin', label: 'lupin', emoji: '🫛' },
  { value: 'molluscs', label: 'molluscs', emoji: '🐌' },
  { value: 'mustard', label: 'mustard', emoji: '💛' },
  { value: 'sulphites', label: 'sulphites', emoji: '🧪' },
  { value: 'fructose', label: 'fructose', emoji: '🍎' },
  { value: 'fodmap', label: 'fodmaps', emoji: '🧄' },
  { value: 'corn', label: 'corn', emoji: '🌽' },
  { value: 'nightshades', label: 'nightshades', emoji: '🫑' },
  { value: 'red_meat', label: 'red meat', emoji: '🥩' },
  { value: 'alcohol', label: 'alcohol', emoji: '🍺' },
] as const;

export default function IntolerancesScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const {
    intolerances,
    customIntolerances,
    toggleIntolerance,
    addCustomIntolerance,
    removeCustomIntolerance,
  } = useOnboardingStore();

  const [customValue, setCustomValue] = useState('');

  const selectedSet = useMemo(() => new Set(intolerances), [intolerances]);

  const handlePick = (value: string) => {
    if (value === 'none') {
      intolerances.forEach((i) => {
        if (i !== 'none') toggleIntolerance(i);
      });
      if (!selectedSet.has('none')) toggleIntolerance('none');
      return;
    }
    if (selectedSet.has('none')) toggleIntolerance('none');
    toggleIntolerance(value);
  };

  const handleAddCustom = () => {
    const cleaned = customValue.trim().toLowerCase();
    if (!cleaned) return;
    addCustomIntolerance(cleaned);
    setCustomValue('');
  };

  return (
    <OnboardingScreen
      michiSource={MichiAssets.onboardingEmpathetic}
      dialogueText="Super important! 🚨 Do you have any allergies or intolerances? I'll always flag these for you!"
      canContinue
      onContinue={() => router.push('/onboarding/decision-anxiety' as never)}
      buttonText={intolerances.length || customIntolerances.length ? 'Continue' : 'None of these'}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.warning, { backgroundColor: theme.colors.warning + '15' }]}>
          <AppText style={[styles.warningText, { color: theme.colors.warning }]}>
            For severe allergies, please always confirm directly with restaurant staff.
          </AppText>
        </View>

        {INTOLERANCES.map((item) => (
          <OptionCard
            key={item.value}
            label={item.label}
            emoji={item.emoji}
            selected={selectedSet.has(item.value)}
            onPress={() => handlePick(item.value)}
          />
        ))}

        <View style={styles.customBlock}>
          <AppText style={[styles.customTitle, { color: theme.colors.text }]}>+ Add Custom</AppText>
          <View style={[styles.inputRow, { borderColor: theme.colors.border, backgroundColor: '#fff' }]}>
            <TextInput
              value={customValue}
              onChangeText={setCustomValue}
              placeholder="Type custom allergy"
              placeholderTextColor={theme.colors.caption}
              style={[styles.input, { color: theme.colors.text }]}
              onSubmitEditing={handleAddCustom}
            />
            <TouchableOpacity onPress={handleAddCustom} style={[styles.addBtn, { backgroundColor: theme.colors.brand }]}>
              <AppText style={styles.addBtnText}>Add</AppText>
            </TouchableOpacity>
          </View>
          <View style={styles.customList}>
            {customIntolerances.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => removeCustomIntolerance(item)}
                style={[styles.customChip, { borderColor: theme.colors.border, backgroundColor: '#fff' }]}
              >
                <AppText style={[styles.customChipText, { color: theme.colors.text }]}>{item} ×</AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  warning: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  warningText: {
    fontSize: 13,
    textAlign: 'center',
  },
  customBlock: {
    marginTop: 8,
  },
  customTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputRow: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  customList: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  customChipText: {
    fontSize: 13,
  },
});
