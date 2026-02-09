import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';

const HomeBackground = require('@/assets/botanicals/home-background.png');

export default function InsightsScreen() {
  const theme = useAppTheme();

  return (
    <ImageBackground source={HomeBackground} style={styles.container} resizeMode="cover">
      <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <AppText style={[styles.title, { color: theme.colors.text }]}>Insights</AppText>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondary }]}>
          <FontAwesome name="line-chart" size={48} color={theme.colors.brand} />
        </View>
        <AppText style={[styles.comingSoon, { color: theme.colors.text }]}>
          Coming Soon
        </AppText>
        <AppText style={[styles.description, { color: theme.colors.subtext }]}>
          Track your dining patterns, nutrition trends,{'\n'}and progress over time.
        </AppText>
      </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  comingSoon: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
