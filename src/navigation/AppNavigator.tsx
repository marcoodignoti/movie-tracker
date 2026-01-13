import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import {
  DiscoverScreen,
  MoviesScreen,
  ShowsScreen,
  LibraryScreen,
  SearchScreen,
  MovieDetailScreen,
  ShowDetailScreen,
} from '../screens';

// Type definitions
export type RootStackParamList = {
  Main: undefined;
  MovieDetail: { movieId: number };
  ShowDetail: { showId: number };
  WatchlistMovies: undefined;
  WatchedMovies: undefined;
  WatchlistShows: undefined;
  WatchedShows: undefined;
  CurrentlyWatching: undefined;
  CollectionDetail: { collectionId: string; type: 'movie' | 'show' };
};

export type MainTabParamList = {
  Discover: undefined;
  Library: undefined;
  Movies: undefined;
  Shows: undefined;
  Search: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabBarBackground = () => (
  <BlurView
    intensity={100}
    tint="dark"
    style={StyleSheet.absoluteFill}
  />
);

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarBackground: TabBarBackground,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Discover':
              iconName = focused ? 'star' : 'star-outline';
              break;
            case 'Library':
              iconName = focused ? 'library' : 'library-outline';
              break;
            case 'Movies':
              iconName = focused ? 'film' : 'film-outline';
              break;
            case 'Shows':
              iconName = focused ? 'tv' : 'tv-outline';
              break;
            case 'Search':
              iconName = 'search';
              break;
            default:
              iconName = 'help';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Movies" component={MoviesScreen} />
      <Tab.Screen name="Shows" component={ShowsScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ animation: 'none' }}
        />
        <Stack.Screen
          name="MovieDetail"
          component={MovieDetailScreen}
          options={{
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="ShowDetail"
          component={ShowDetailScreen}
          options={{
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
  },
});
