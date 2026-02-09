import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAppTheme } from '@/src/theme/theme';

export default function TabLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brand,
        tabBarInactiveTintColor: theme.colors.subtext,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home', 
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={22} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="history" 
        options={{ 
          title: 'History', 
          tabBarIcon: ({ color }) => <FontAwesome name="history" size={20} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="scan" 
        options={{ 
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.scanButton, { backgroundColor: theme.colors.brand }]}>
              <FontAwesome name="camera" size={24} color="#fff" />
            </View>
          ),
          tabBarItemStyle: {
            height: 70,
          },
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile', 
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={20} color={color} /> 
        }} 
      />
      {/* Hidden - keeping file but removing from tabs */}
      <Tabs.Screen 
        name="search" 
        options={{ 
          href: null, // Hides from tab bar
        }} 
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
