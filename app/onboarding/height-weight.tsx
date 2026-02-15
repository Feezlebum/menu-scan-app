import React, { useMemo, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen } from '@/src/components/onboarding/OnboardingScreen';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { ActivityLevel, useOnboardingStore } from '@/src/stores/onboardingStore';
import MichiAssets from '@/src/utils/michiAssets';

const ACTIVITY: Array<{ value: ActivityLevel; label: string; desc: string; emoji: string }> = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise', emoji: '🛋️' },
  { value: 'light', label: 'Lightly Active', desc: '1-3 days per week', emoji: '🚶' },
  { value: 'moderate', label: 'Moderately Active', desc: '3-5 days per week', emoji: '🏃' },
  { value: 'active', label: 'Very Active', desc: '6-7 days per week', emoji: '💪' },
  { value: 'very_active', label: 'Extremely Active', desc: 'Athlete or physical job', emoji: '🔥' },
];

function kgToLbs(kg: number) { return kg * 2.20462; }
function lbsToKg(lbs: number) { return lbs / 2.20462; }
function cmToFeetIn(cm: number) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return { feet, inches };
}
function feetInToCm(feet: number, inches: number) {
  return Math.round((feet * 12 + inches) * 2.54);
}

export default function HeightWeightScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const {
    unitSystem,
    heightCm,
    currentWeightKg,
    goalWeightKg,
    activityLevel,
    setUnitSystem,
    setHeight,
    setCurrentWeight,
    setGoalWeight,
    setActivityLevel,
  } = useOnboardingStore();

  const initHeight = useMemo(() => {
    if (!heightCm) return { feet: '', inches: '', cm: '' };
    const fi = cmToFeetIn(heightCm);
    return { feet: String(fi.feet), inches: String(fi.inches), cm: String(heightCm) };
  }, [heightCm]);

  const [heightMetric, setHeightMetric] = useState(initHeight.cm);
  const [heightFeet, setHeightFeet] = useState(initHeight.feet);
  const [heightInches, setHeightInches] = useState(initHeight.inches);
  const [weightMetric, setWeightMetric] = useState(currentWeightKg ? String(currentWeightKg) : '');
  const [goalMetric, setGoalMetric] = useState(goalWeightKg ? String(goalWeightKg) : '');
  const [weightImperial, setWeightImperial] = useState(currentWeightKg ? String(Math.round(kgToLbs(currentWeightKg))) : '');
  const [goalImperial, setGoalImperial] = useState(goalWeightKg ? String(Math.round(kgToLbs(goalWeightKg))) : '');

  const setMetricMode = (metric: boolean) => {
    const next = metric ? 'metric' : 'imperial';
    setUnitSystem(next);
  };

  const currentKg = unitSystem === 'metric'
    ? Number.parseFloat(weightMetric || '0')
    : lbsToKg(Number.parseFloat(weightImperial || '0'));
  const targetKg = unitSystem === 'metric'
    ? Number.parseFloat(goalMetric || '0')
    : lbsToKg(Number.parseFloat(goalImperial || '0'));
  const currentHeightCm = unitSystem === 'metric'
    ? Number.parseInt(heightMetric || '0', 10)
    : feetInToCm(Number.parseInt(heightFeet || '0', 10), Number.parseInt(heightInches || '0', 10));

  const validHeight = Number.isFinite(currentHeightCm) && currentHeightCm >= 100 && currentHeightCm <= 250;
  const validWeight = Number.isFinite(currentKg) && currentKg >= 30 && currentKg <= 300;
  const validGoal = Number.isFinite(targetKg) && targetKg >= 30 && targetKg <= 300;
  const canContinue = validHeight && validWeight && validGoal && !!activityLevel;

  const applyValues = () => {
    setHeight(currentHeightCm);
    setCurrentWeight(Number(currentKg.toFixed(1)));
    setGoalWeight(Number(targetKg.toFixed(1)));
  };

  return (
    <OnboardingScreen
      michiSource={MichiAssets.onboardingMeasure}
      dialogueText="Almost there! I need a few details to calculate your perfect nutrition targets. Don't worry — this stays between us! 🤫"
      canContinue={canContinue}
      onContinue={() => {
        applyValues();
        router.push('/onboarding/intolerances' as never);
      }}
      buttonText="Continue"
    >
      <View style={styles.wrap}>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => setMetricMode(true)}
            style={[styles.toggle, { borderColor: unitSystem === 'metric' ? theme.colors.brand : theme.colors.border, backgroundColor: unitSystem === 'metric' ? '#FFF0EC' : '#fff' }]}
          >
            <AppText style={[styles.toggleText, { color: theme.colors.text }]}>Metric</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMetricMode(false)}
            style={[styles.toggle, { borderColor: unitSystem === 'imperial' ? theme.colors.brand : theme.colors.border, backgroundColor: unitSystem === 'imperial' ? '#FFF0EC' : '#fff' }]}
          >
            <AppText style={[styles.toggleText, { color: theme.colors.text }]}>Imperial</AppText>
          </TouchableOpacity>
        </View>

        {unitSystem === 'metric' ? (
          <>
            <Input label="Height (cm)" value={heightMetric} setValue={setHeightMetric} placeholder="170" />
            <Input label="Current Weight (kg)" value={weightMetric} setValue={setWeightMetric} placeholder="70" decimal />
            <Input label="Target Weight (kg)" value={goalMetric} setValue={setGoalMetric} placeholder="65" decimal />
          </>
        ) : (
          <>
            <AppText style={[styles.label, { color: theme.colors.subtext }]}>Height (ft / in)</AppText>
            <View style={styles.inlineRow}>
              <Input value={heightFeet} setValue={setHeightFeet} placeholder="5" compact />
              <Input value={heightInches} setValue={setHeightInches} placeholder="10" compact />
            </View>
            <Input label="Current Weight (lbs)" value={weightImperial} setValue={setWeightImperial} placeholder="154" decimal />
            <Input label="Target Weight (lbs)" value={goalImperial} setValue={setGoalImperial} placeholder="143" decimal />
          </>
        )}

        <AppText style={[styles.label, { color: theme.colors.subtext, marginTop: 10 }]}>Activity Level</AppText>
        {ACTIVITY.map((a) => {
          const selected = activityLevel === a.value;
          return (
            <TouchableOpacity
              key={a.value}
              onPress={() => setActivityLevel(a.value)}
              style={[styles.activity, { borderColor: selected ? theme.colors.brand : theme.colors.border, backgroundColor: selected ? '#FFF0EC' : '#fff' }]}
            >
              <AppText style={styles.activityEmoji}>{a.emoji}</AppText>
              <View style={{ flex: 1 }}>
                <AppText style={[styles.activityTitle, { color: theme.colors.text }]}>{a.label}</AppText>
                <AppText style={[styles.activityDesc, { color: theme.colors.subtext }]}>{a.desc}</AppText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingScreen>
  );
}

function Input({
  label,
  value,
  setValue,
  placeholder,
  decimal,
  compact,
}: {
  label?: string;
  value: string;
  setValue: (v: string) => void;
  placeholder: string;
  decimal?: boolean;
  compact?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <View style={{ flex: compact ? 1 : undefined }}>
      {label ? <AppText style={[styles.label, { color: theme.colors.subtext }]}>{label}</AppText> : null}
      <View style={[styles.inputWrap, { borderColor: theme.colors.border, backgroundColor: '#fff' }, compact ? { marginTop: 0 } : null]}>
        <TextInput
          value={value}
          onChangeText={(t) => setValue(t.replace(decimal ? /[^0-9.]/g : /[^0-9]/g, ''))}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.caption}
          keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
          style={[styles.input, { color: theme.colors.text }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 6 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  toggle: { flex: 1, borderWidth: 2, borderRadius: 999, alignItems: 'center', paddingVertical: 8 },
  toggleText: { fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '700', marginTop: 10, marginBottom: 6, textTransform: 'uppercase' },
  inlineRow: { flexDirection: 'row', gap: 8 },
  inputWrap: { borderWidth: 2, borderRadius: 12, paddingHorizontal: 12, height: 46, justifyContent: 'center' },
  input: { fontSize: 16, fontWeight: '700' },
  activity: { borderWidth: 2, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 10, marginBottom: 8, flexDirection: 'row', gap: 10, alignItems: 'center' },
  activityEmoji: { fontSize: 18 },
  activityTitle: { fontSize: 14, fontWeight: '700' },
  activityDesc: { fontSize: 12, marginTop: 2 },
});
