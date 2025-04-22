import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, TextInput, Animated, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTopAnime, useAnimeSearch, Anime, useAnimeByStatus, AnimeStatus } from '../hooks/useAnime';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#1a1a1a',
  secondary: '#2a2a2a',
  accent: '#FF3366',
  text: '#FFFFFF',
  textSecondary: '#888888',
};

type FilterType = 'ongoing' | 'finished' | 'upcoming';

const FILTER_BUTTON_WIDTH = (Dimensions.get('window').width - 32) / 3; // ширина экрана минус отступы, делённая на 3

export default function AnimeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ongoing');
  const [slideAnim] = useState(new Animated.Value(0));

  const { data: ongoingAnime, isLoading: isLoadingOngoing } = useAnimeByStatus('airing');
  const { data: finishedAnime, isLoading: isLoadingFinished } = useAnimeByStatus('complete');
  const { data: upcomingAnime, isLoading: isLoadingUpcoming } = useAnimeByStatus('upcoming');
  const { 
    data: searchData, 
    isLoading: isLoadingSearch, 
    isError, 
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useAnimeSearch(searchQuery);

  const getAnimeList = () => {
    if (searchQuery) return searchData?.pages.flatMap(page => page.data);
    switch (selectedFilter) {
      case 'ongoing': return ongoingAnime;
      case 'finished': return finishedAnime;
      case 'upcoming': return upcomingAnime;
      default: return ongoingAnime;
    }
  };

  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter);
    const position = {
      'ongoing': 0,
      'finished': FILTER_BUTTON_WIDTH,
      'upcoming': FILTER_BUTTON_WIDTH * 2
    }[filter];

    Animated.spring(slideAnim, {
      toValue: position,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    }).start();
  };

  const animeList = getAnimeList();

  const renderAnimeItem = ({ item }: { item: Anime }) => (
    <TouchableOpacity
      style={styles.animeItem}
      onPress={() => {
        router.push({
          pathname: '/anime/[id]',
          params: { id: item.mal_id }
        });
      }}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.images.jpg.image_url }}
        style={styles.animeImage}
      />
      <View style={styles.animeInfo}>
        <Text style={styles.animeTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.animeScore}>
          <Ionicons name="star" size={16} color={COLORS.accent} style={styles.scoreIcon} />
          <Text style={styles.scoreText}>{item.score}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.accent} />
      </View>
    );
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const isLoading = isLoadingOngoing || isLoadingFinished || isLoadingUpcoming || isLoadingSearch;

  if (isLoading && !animeList) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading anime: {error?.message}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Anime',
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.text,
      }} />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search anime..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.filterContainer}>
          <View style={styles.filterBackground}>
            <Animated.View 
              style={[
                styles.filterSlider,
                {
                  transform: [{
                    translateX: slideAnim
                  }]
                }
              ]} 
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, { width: FILTER_BUTTON_WIDTH }]}
            onPress={() => handleFilterChange('ongoing')}
          >
            <Text style={[styles.filterText, selectedFilter === 'ongoing' && styles.filterTextActive]}>
              Ongoing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, { width: FILTER_BUTTON_WIDTH }]}
            onPress={() => handleFilterChange('finished')}
          >
            <Text style={[styles.filterText, selectedFilter === 'finished' && styles.filterTextActive]}>
              Finished
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, { width: FILTER_BUTTON_WIDTH }]}
            onPress={() => handleFilterChange('upcoming')}
          >
            <Text style={[styles.filterText, selectedFilter === 'upcoming' && styles.filterTextActive]}>
              Upcoming
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={animeList}
          renderItem={renderAnimeItem}
          keyExtractor={(item) => `${item.mal_id}-${item.title}`}
          contentContainerStyle={styles.listContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.primary,
  },
  errorText: {
    color: COLORS.accent,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: COLORS.text,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    height: 40,
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  filterBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  filterSlider: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: FILTER_BUTTON_WIDTH - 4,
    height: 36,
    backgroundColor: COLORS.accent,
    borderRadius: 18,
  },
  filterButton: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  animeItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  animeImage: {
    width: 100,
    height: 150,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  animeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  animeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  animeScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreIcon: {
    marginRight: 4,
  },
  scoreText: {
    fontSize: 14,
    color: COLORS.text,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
}); 