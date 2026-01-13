import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { CollectionCard, SectionHeader } from '../components';
import { useLibraryStore } from '../store/libraryStore';

type RootStackParamList = {
  CollectionDetail: { collectionId: string; type: 'movie' | 'show' };
  WatchlistMovies: undefined;
  WatchedMovies: undefined;
  WatchlistShows: undefined;
  WatchedShows: undefined;
  CurrentlyWatching: undefined;
};

export const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [collectionType, setCollectionType] = useState<'movie' | 'show'>('movie');

  const {
    movieWatchlist,
    watchedMovies,
    movieCollections,
    showWatchlist,
    watchedShows,
    currentlyWatchingShows,
    showCollections,
    createMovieCollection,
    createShowCollection,
  } = useLibraryStore();

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    if (collectionType === 'movie') {
      createMovieCollection(newCollectionName.trim());
    } else {
      createShowCollection(newCollectionName.trim());
    }

    setNewCollectionName('');
    setShowCreateModal(false);
  };

  const getMoviePosters = (movieIds: number[]): (string | null)[] => {
    return movieIds
      .slice(0, 2)
      .map((id) => {
        const movie = watchedMovies.find((m) => m.id === id) ||
          movieWatchlist.find((m) => m.id === id);
        return movie?.posterPath || null;
      });
  };

  const getShowPosters = (showIds: number[]): (string | null)[] => {
    return showIds
      .slice(0, 2)
      .map((id) => {
        const show = watchedShows.find((s) => s.id === id) ||
          showWatchlist.find((s) => s.id === id) ||
          currentlyWatchingShows.find((s) => s.id === id);
        return show?.posterPath || null;
      });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <View style={styles.headerButtons}>
          <Pressable style={styles.headerButton}>
            <Ionicons name="chevron-down" size={20} color={colors.text} />
          </Pressable>
          <Pressable
            style={styles.headerButton}
            onPress={() => {
              setCollectionType('movie');
              setShowCreateModal(true);
            }}
          >
            <Ionicons name="add" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Movies Section */}
        <SectionHeader
          title="Movies"
          subtitle={`${movieWatchlist.length} in watchlist, ${watchedMovies.length} watched`}
        />
        <View style={styles.collectionsGrid}>
          <CollectionCard
            title="Watchlist"
            posterPaths={movieWatchlist.slice(0, 2).map((m) => m.posterPath)}
            onPress={() => navigation.navigate('WatchlistMovies')}
            color={colors.primary}
          />
          <CollectionCard
            title="Watched"
            posterPaths={watchedMovies.slice(0, 2).map((m) => m.posterPath)}
            onPress={() => navigation.navigate('WatchedMovies')}
            color={colors.accent}
          />
          {movieCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              title={collection.name}
              posterPaths={getMoviePosters(collection.movies)}
              onPress={() =>
                navigation.navigate('CollectionDetail', {
                  collectionId: collection.id,
                  type: 'movie',
                })
              }
              color={colors.secondary}
            />
          ))}
        </View>

        {/* Shows Section */}
        <SectionHeader
          title="Shows"
          subtitle={`${currentlyWatchingShows.length} airing next, ${showWatchlist.length} in watchlist, ${watchedShows.length} watching`}
        />
        <View style={styles.collectionsGrid}>
          <CollectionCard
            title="Airing Next"
            posterPaths={currentlyWatchingShows.slice(0, 2).map((s) => s.posterPath)}
            onPress={() => navigation.navigate('CurrentlyWatching')}
            color={colors.primary}
          />
          <CollectionCard
            title="Watched"
            posterPaths={watchedShows.slice(0, 2).map((s) => s.posterPath)}
            onPress={() => navigation.navigate('WatchedShows')}
            color={colors.accent}
          />
          <CollectionCard
            title="Watchlist"
            posterPaths={showWatchlist.slice(0, 2).map((s) => s.posterPath)}
            onPress={() => navigation.navigate('WatchlistShows')}
            color={colors.success}
          />
          {showCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              title={collection.name}
              posterPaths={getShowPosters(collection.shows)}
              onPress={() =>
                navigation.navigate('CollectionDetail', {
                  collectionId: collection.id,
                  type: 'show',
                })
              }
              color={colors.secondary}
            />
          ))}
        </View>
      </ScrollView>

      {/* Create Collection Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>New Collection</Text>
            <Pressable onPress={handleCreateCollection}>
              <Text style={styles.modalDone}>Done</Text>
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Collection Name</Text>
            <TextInput
              style={styles.input}
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              placeholder="Enter collection name"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />

            <Text style={styles.inputLabel}>Type</Text>
            <View style={styles.typeSelector}>
              <Pressable
                style={[
                  styles.typeButton,
                  collectionType === 'movie' && styles.typeButtonActive,
                ]}
                onPress={() => setCollectionType('movie')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    collectionType === 'movie' && styles.typeButtonTextActive,
                  ]}
                >
                  Movies
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typeButton,
                  collectionType === 'show' && styles.typeButtonActive,
                ]}
                onPress={() => setCollectionType('show')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    collectionType === 'show' && styles.typeButtonTextActive,
                  ]}
                >
                  Shows
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.largeTitle,
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalCancel: {
    ...typography.body,
    color: colors.primary,
  },
  modalTitle: {
    ...typography.headline,
    color: colors.text,
  },
  modalDone: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    padding: spacing.md,
  },
  inputLabel: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  typeButtonTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
});
