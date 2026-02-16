import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/src/components/ui/AppText';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useAppTheme } from '@/src/theme/theme';
import MichiMoji from '@/src/components/MichiMoji';

const MichiExcited = require('@/assets/michi-excited.png');

export default function MealLogSuccessScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ mealId?: string; mealName?: string }>();

  const mealName = params.mealName || 'Meal';
  const mealId = params.mealId;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFF5E6' }]} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <Image source={MichiExcited} style={styles.hero} resizeMode="contain" />
        <AppText style={[styles.title, { color: theme.colors.text }]}>Meal logged! 🎉</AppText>
        <AppText style={[styles.subtitle, { color: theme.colors.subtext }]}>{mealName}</AppText>

        <PrimaryButton
          label="📸 Snap when it arrives"
          onPress={() =>
            router.replace({
              pathname: '/meal-verify-capture' as any,
              params: { mealId },
            })
          }
        />

        <TouchableOpacity style={styles.secondary} onPress={() => router.replace('/(tabs)/history')}>
          <MichiMoji name="think" size={14} />
          <AppText style={[styles.secondaryText, { color: theme.colors.subtext }]}>I’ll do it later</AppText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.done} onPress={() => router.replace('/(tabs)')}>
          <AppText style={[styles.doneText, { color: theme.colors.caption }]}>Done</AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center', gap: 14 },
  hero: { width: 160, height: 160, alignSelf: 'center' },
  title: { textAlign: 'center', fontSize: 28, fontWeight: '700' },
  subtitle: { textAlign: 'center', fontSize: 16, marginBottom: 10 },
  secondary: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 8 },
  secondaryText: { fontSize: 15, fontWeight: '600' },
  done: { alignItems: 'center', marginTop: 8 },
  doneText: { fontSize: 14 },
});
