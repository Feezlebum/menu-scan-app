import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import { useHistoryStore } from '@/src/stores/historyStore';

export default function MealVerifyPickerScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const loggedMeals = useHistoryStore((s) => s.loggedMeals);

  const recentMeals = useMemo(() => {
    return [...loggedMeals]
      .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
      .slice(0, 25);
  }, [loggedMeals]);

  const unverifiedCount = recentMeals.filter((m) => !m.verification).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFF9F1' }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="angle-left" size={20} color={theme.colors.text} />
          <AppText style={[styles.backText, { color: theme.colors.text }]}>Back</AppText>
        </TouchableOpacity>
        <AppText style={[styles.title, { color: theme.colors.text }]}>Pick a meal to verify</AppText>
        <AppText style={[styles.subtitle, { color: theme.colors.subtext }]}>
          {unverifiedCount > 0
            ? `${unverifiedCount} recent meals still unverified`
            : 'All recent meals already have a verification result'}
        </AppText>
      </View>

      {recentMeals.length === 0 ? (
        <View style={styles.emptyWrap}>
          <AppText style={[styles.emptyText, { color: theme.colors.subtext }]}>No logged meals yet.</AppText>
          <TouchableOpacity style={[styles.scanBtn, { backgroundColor: theme.colors.brand }]} onPress={() => router.replace('/(tabs)/scan')}>
            <AppText style={styles.scanBtnText}>Scan a menu first</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {recentMeals.map((meal) => {
            const verified = !!meal.verification;
            return (
              <TouchableOpacity
                key={meal.id}
                style={[styles.card, { backgroundColor: '#fff', borderColor: '#F0E6D6' }]}
                onPress={() =>
                  router.push({
                    pathname: '/meal-verify-capture' as any,
                    params: { mealId: meal.id },
                  })
                }
              >
                <View style={styles.cardTopRow}>
                  <AppText style={[styles.mealName, { color: theme.colors.text }]} numberOfLines={1}>
                    {meal.item.name}
                  </AppText>
                  {verified ? (
                    <View style={styles.verifiedPill}>
                      <AppText style={styles.verifiedPillText}>✅ verified</AppText>
                    </View>
                  ) : (
                    <View style={styles.unverifiedPill}>
                      <AppText style={styles.unverifiedPillText}>📸 needs verify</AppText>
                    </View>
                  )}
                </View>
                <AppText style={[styles.meta, { color: theme.colors.subtext }]} numberOfLines={1}>
                  {meal.restaurantName || 'Unknown restaurant'} · {new Date(meal.loggedAt).toLocaleDateString()}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginBottom: 10 },
  backText: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { marginTop: 4, fontSize: 14 },
  listContent: { padding: 20, gap: 10, paddingBottom: 30 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 6 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  mealName: { flex: 1, fontSize: 15, fontWeight: '700' },
  meta: { fontSize: 13 },
  verifiedPill: { backgroundColor: '#E8F5E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  verifiedPillText: { color: '#2D6A4F', fontSize: 11, fontWeight: '700' },
  unverifiedPill: { backgroundColor: '#FFEFD6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  unverifiedPillText: { color: '#8B5E00', fontSize: 11, fontWeight: '700' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  emptyText: { fontSize: 15, textAlign: 'center' },
  scanBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999 },
  scanBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
