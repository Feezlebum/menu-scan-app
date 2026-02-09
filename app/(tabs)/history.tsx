import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AppText } from '@/src/components/ui/AppText';
import { Card } from '@/src/components/ui/Card';
import { useAppTheme } from '@/src/theme/theme';

interface ScanHistoryItem {
  id: string;
  restaurantName: string | null;
  itemCount: number;
  date: string;
  topPick: string | null;
}

// TODO: Replace with actual data from Supabase/local storage
const MOCK_HISTORY: ScanHistoryItem[] = [];

export default function HistoryScreen() {
  const theme = useAppTheme();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleViewScan = (scan: ScanHistoryItem) => {
    // TODO: Navigate to scan details
    console.log('View scan:', scan.id);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <AppText style={[styles.title, { color: theme.colors.text }]}>History</AppText>
        <AppText style={[styles.subtitle, { color: theme.colors.subtext }]}>
          Your past menu scans
        </AppText>
      </View>

      {MOCK_HISTORY.length > 0 ? (
        <FlatList
          data={MOCK_HISTORY}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleViewScan(item)}>
              <Card style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: theme.colors.brand + '20' }]}>
                    <FontAwesome name="camera" size={18} color={theme.colors.brand} />
                  </View>
                  <View style={styles.cardInfo}>
                    <AppText style={[styles.restaurantName, { color: theme.colors.text }]}>
                      {item.restaurantName || 'Unknown Restaurant'}
                    </AppText>
                    <AppText style={[styles.dateText, { color: theme.colors.subtext }]}>
                      {formatDate(item.date)} · {item.itemCount} items
                    </AppText>
                  </View>
                  <FontAwesome name="chevron-right" size={16} color={theme.colors.subtext} />
                </View>
                {item.topPick && (
                  <View style={[styles.topPickBanner, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <AppText style={[styles.topPickLabel, { color: theme.colors.subtext }]}>
                      Top Pick:
                    </AppText>
                    <AppText style={[styles.topPickName, { color: theme.colors.text }]}>
                      {item.topPick}
                    </AppText>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.colors.card }]}>
            <FontAwesome name="history" size={40} color={theme.colors.subtext} />
          </View>
          <AppText style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No scans yet
          </AppText>
          <AppText style={[styles.emptyText, { color: theme.colors.subtext }]}>
            Scan a menu to see your history here.{'\n'}Your past recommendations will be saved.
          </AppText>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyCard: {
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    marginTop: 2,
  },
  topPickBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  topPickLabel: {
    fontSize: 13,
  },
  topPickName: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
