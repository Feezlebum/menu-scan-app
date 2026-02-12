import React, { useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { AppText } from '@/src/components/ui/AppText';
import { Card } from '@/src/components/ui/Card';
import { useAppTheme } from '@/src/theme/theme';
import { useTranslationStore } from '@/src/stores/translationStore';
import type { TranslationResult, TranslatedMenuItem, OrderingPhrase } from '@/src/lib/translationService';

const FLAG_MAP: Record<string, string> = {
  th: '🇹🇭',
  ja: '🇯🇵',
  ko: '🇰🇷',
  zh: '🇨🇳',
  es: '🇪🇸',
  fr: '🇫🇷',
  it: '🇮🇹',
  de: '🇩🇪',
  ar: '🇸🇦',
  hi: '🇮🇳',
};

function parseParamResult(raw?: string | string[]): TranslationResult | null {
  if (!raw) return null;
  const str = Array.isArray(raw) ? raw[0] : raw;
  if (!str) return null;

  try {
    return JSON.parse(str) as TranslationResult;
  } catch {
    return null;
  }
}

export default function TranslationResultsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ translationData?: string }>();
  const { currentTranslation, clearTranslation } = useTranslationStore();

  const translationData = useMemo(() => parseParamResult(params.translationData) ?? currentTranslation, [params.translationData, currentTranslation]);

  if (!translationData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}> 
        <View style={styles.centered}>
          <AppText style={[styles.emptyTitle, { color: theme.colors.text }]}>No translation results available</AppText>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.colors.brand }]} onPress={() => router.back()}>
            <AppText style={styles.backButtonText}>Go Back</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const flag = FLAG_MAP[translationData.languageCode] ?? '🌍';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}> 
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            clearTranslation();
            router.back();
          }}
          style={styles.closeButton}
        >
          <FontAwesome name="chevron-left" size={18} color={theme.colors.subtext} />
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <AppText style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>
            {flag} {translationData.detectedLanguage} → English
          </AppText>
          <AppText style={[styles.headerSubtitle, { color: theme.colors.subtext }]}>Michi translation + pronunciation guide</AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Translated Menu</AppText>
          {translationData.translatedItems.map((item, idx) => (
            <TranslatedItemCard key={`${item.original}-${idx}`} item={item} />
          ))}
        </View>

        {!!translationData.orderingPhrases.length && (
          <View style={styles.section}>
            <AppText style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>How to Order</AppText>
            <Card style={styles.card}>
              {translationData.orderingPhrases.map((phrase, idx) => (
                <PhraseRow key={`${phrase.english}-${idx}`} phrase={phrase} isLast={idx === translationData.orderingPhrases.length - 1} />
              ))}
            </Card>
          </View>
        )}

        {!!translationData.culturalTips.length && (
          <View style={styles.section}>
            <AppText style={[styles.sectionTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Cultural Tips</AppText>
            <Card style={styles.card}>
              {translationData.culturalTips.map((tip, idx) => (
                <View key={`${tip}-${idx}`} style={styles.tipRow}>
                  <AppText style={[styles.tipBullet, { color: theme.colors.brand }]}>•</AppText>
                  <AppText style={[styles.tipText, { color: theme.colors.text }]}>{tip}</AppText>
                </View>
              ))}
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TranslatedItemCard({ item }: { item: TranslatedMenuItem }) {
  const theme = useAppTheme();

  const healthColor =
    item.health === 'healthy'
      ? theme.colors.trafficGreen
      : item.health === 'moderate'
      ? theme.colors.trafficAmber
      : theme.colors.trafficRed;

  return (
    <Card style={styles.card}>
      <AppText style={[styles.originalText, { color: theme.colors.text, fontFamily: theme.fonts.body.semiBold }]}>{item.original}</AppText>
      <AppText style={[styles.translatedText, { color: theme.colors.brand }]}>{item.translated}</AppText>
      {!!item.phonetic && <AppText style={[styles.phoneticText, { color: theme.colors.subtext }]}>/{item.phonetic}/</AppText>}

      <View style={styles.metaRow}>
        <View style={[styles.healthBadge, { backgroundColor: `${healthColor}20` }]}>
          <AppText style={[styles.healthText, { color: healthColor }]}>{item.health}</AppText>
        </View>
        {!!item.price && <AppText style={[styles.priceText, { color: theme.colors.text }]}>{item.price}</AppText>}
        <AppText style={[styles.confidenceText, { color: theme.colors.caption }]}>conf {Math.round(item.confidence * 100)}%</AppText>
      </View>

      {!!item.allergens.length && (
        <AppText style={[styles.allergenText, { color: theme.colors.trafficRed }]}>Allergens: {item.allergens.join(', ')}</AppText>
      )}
    </Card>
  );
}

function PhraseRow({ phrase, isLast }: { phrase: OrderingPhrase; isLast?: boolean }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.phraseRow, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}> 
      <AppText style={[styles.phraseEnglish, { color: theme.colors.text, fontFamily: theme.fonts.body.semiBold }]}>{phrase.english}</AppText>
      <AppText style={[styles.phraseOriginal, { color: theme.colors.brand }]}>{phrase.original}</AppText>
      {!!phrase.phonetic && <AppText style={[styles.phrasePhonetic, { color: theme.colors.subtext }]}>/{phrase.phonetic}/</AppText>}
      <AppText style={[styles.phraseContext, { color: theme.colors.caption }]}>{phrase.context}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { fontSize: 18, marginBottom: 14 },
  backButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  backButtonText: { color: '#fff', fontWeight: '700' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  closeButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 20 },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  content: { padding: 16, paddingBottom: 28, gap: 18 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 20 },
  card: { padding: 14, gap: 8 },
  originalText: { fontSize: 17 },
  translatedText: { fontSize: 16 },
  phoneticText: { fontSize: 13, fontStyle: 'italic' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  healthBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  healthText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  priceText: { fontSize: 13 },
  confidenceText: { fontSize: 12, marginLeft: 'auto' },
  allergenText: { fontSize: 12, marginTop: 4 },
  phraseRow: { paddingVertical: 8 },
  phraseEnglish: { fontSize: 15 },
  phraseOriginal: { fontSize: 15, marginTop: 2 },
  phrasePhonetic: { fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  phraseContext: { fontSize: 11, marginTop: 3, textTransform: 'capitalize' },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  tipBullet: { fontSize: 18, lineHeight: 22 },
  tipText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
