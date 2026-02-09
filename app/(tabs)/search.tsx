import React, { useState } from 'react';
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AppText } from '@/src/components/ui/AppText';
import { Card } from '@/src/components/ui/Card';
import { useAppTheme } from '@/src/theme/theme';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  hasMenu: boolean;
}

const POPULAR_RESTAURANTS: Restaurant[] = [
  { id: '1', name: 'Chipotle', cuisine: 'Mexican', hasMenu: true },
  { id: '2', name: 'Sweetgreen', cuisine: 'Salads', hasMenu: true },
  { id: '3', name: "McDonald's", cuisine: 'Fast Food', hasMenu: true },
  { id: '4', name: 'Shake Shack', cuisine: 'Burgers', hasMenu: true },
  { id: '5', name: 'Panera Bread', cuisine: 'Bakery Cafe', hasMenu: true },
  { id: '6', name: 'Chick-fil-A', cuisine: 'Chicken', hasMenu: true },
];

export default function SearchScreen() {
  const theme = useAppTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Restaurant[]>([]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 0) {
      const filtered = POPULAR_RESTAURANTS.filter(r => 
        r.name.toLowerCase().includes(text.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(text.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    // TODO: Navigate to restaurant menu or show pre-loaded nutrition data
    console.log('Selected:', restaurant.name);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <AppText style={[styles.title, { color: theme.colors.text }]}>Search</AppText>
        <AppText style={[styles.subtitle, { color: theme.colors.subtext }]}>
          Find restaurants with nutrition data
        </AppText>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <FontAwesome name="search" size={18} color={theme.colors.subtext} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search restaurants..."
          placeholderTextColor={theme.colors.subtext}
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <FontAwesome name="times-circle" size={18} color={theme.colors.subtext} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results or Popular */}
      {query.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FontAwesome name="search" size={40} color={theme.colors.subtext} />
              <AppText style={[styles.emptyText, { color: theme.colors.subtext }]}>
                No restaurants found
              </AppText>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectRestaurant(item)}>
              <Card style={styles.resultCard}>
                <View style={styles.resultRow}>
                  <View>
                    <AppText style={[styles.restaurantName, { color: theme.colors.text }]}>
                      {item.name}
                    </AppText>
                    <AppText style={[styles.cuisineText, { color: theme.colors.subtext }]}>
                      {item.cuisine}
                    </AppText>
                  </View>
                  {item.hasMenu && (
                    <View style={[styles.badge, { backgroundColor: theme.colors.brand + '20' }]}>
                      <AppText style={[styles.badgeText, { color: theme.colors.brand }]}>
                        Menu Available
                      </AppText>
                    </View>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.popularSection}>
          <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Popular Chains
          </AppText>
          <FlatList
            data={POPULAR_RESTAURANTS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectRestaurant(item)}>
                <Card style={styles.resultCard}>
                  <View style={styles.resultRow}>
                    <View>
                      <AppText style={[styles.restaurantName, { color: theme.colors.text }]}>
                        {item.name}
                      </AppText>
                      <AppText style={[styles.cuisineText, { color: theme.colors.subtext }]}>
                        {item.cuisine}
                      </AppText>
                    </View>
                    <FontAwesome name="chevron-right" size={16} color={theme.colors.subtext} />
                  </View>
                </Card>
              </TouchableOpacity>
            )}
          />
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
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultCard: {
    marginBottom: 10,
    padding: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: '600',
  },
  cuisineText: {
    fontSize: 14,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  popularSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
});
