import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/src/theme/theme';

export default function TabLayout() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? Math.max(insets.bottom, 8) : insets.bottom;

  return (
    <>
      <StatusBar style="dark" translucent={false} backgroundColor="#FFF5E6" />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: '#FFF5E6',
          zIndex: 1000,
        }}
      />
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brand, // Coral #E86B50
        tabBarInactiveTintColor: theme.colors.caption, // #9B8B7E
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopColor: theme.colors.border, // #F0E6D6
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: theme.fonts.body.semiBold,
          fontSize: 11,
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
        name="insights" 
        options={{ 
          title: 'Insights', 
          tabBarIcon: ({ color }) => <FontAwesome name="line-chart" size={20} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="scan" 
        options={{ 
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.scanFab, { backgroundColor: theme.colors.brand }]}>
              <FontAwesome name="camera" size={24} color="#fff" />
            </View>
          ),
          tabBarItemStyle: {
            height: 70,
          },
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
        name="profile" 
        options={{ 
          title: 'Profile', 
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={20} color={color} /> 
        }} 
      />
      {/* Hidden screens */}
      <Tabs.Screen 
        name="search" 
        options={{ 
          href: null,
        }} 
      />
    </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  scanFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    // Coral shadow
    shadowColor: '#E86B50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
