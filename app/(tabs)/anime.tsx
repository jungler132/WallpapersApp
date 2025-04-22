import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, TextInput, ScrollView, Dimensions, Modal } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTopAnime, useAnimeSearch, Anime, useSeasonalAnime, useCurrentSeasonAnime, useAnimeByStatus, AnimeSeason } from '../hooks/useAnime';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#121212',
  secondary: '#1E1E1E',
  accent: '#FF4081',
  text: '#FFFFFF',
  textSecondary: '#9E9E9E',
  border: '#2C2C2C',
  cardBg: '#1A1A1A',
  seasonalBg: '#2A2A2A',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const { width } = Dimensions.get('window');

type FilterType = 'top' | 'seasonal' | 'ongoing' | 'finished' | 'upcoming';
const SEASONS: AnimeSeason[] = ['winter', 'spring', 'summer', 'fall'];
const CURRENT_YEAR = new Date().getFullYear();

export default function AnimeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('top');
  const [selectedSeason, setSelectedSeason] = useState<AnimeSeason>('winter');
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showSeasonalMenu, setShowSeasonalMenu] = useState(false);

  const { data: topAnime, isLoading: isLoadingTop } = useTopAnime();
  const { data: seasonalAnime, isLoading: isLoadingSeasonal } = useSeasonalAnime(selectedSeason, selectedYear);
  const { data: currentSeasonAnime, isLoading: isLoadingOngoing } = useCurrentSeasonAnime();
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
      case 'top': return topAnime;
      case 'seasonal': return seasonalAnime;
      case 'ongoing': return currentSeasonAnime;
      case 'finished': return finishedAnime;
      case 'upcoming': return upcomingAnime;
      default: return topAnime;
    }
  };

  const animeList = getAnimeList();

  const renderAnimeItem = useCallback(({ item }: { item: Anime }) => (
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
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.images.jpg.image_url }}
          style={styles.animeImage}
          resizeMode="cover"
        />
        <View style={styles.scoreContainer}>
          <Ionicons name="star" size={12} color={COLORS.accent} />
          <Text style={styles.scoreText}>{item.score?.toFixed(2) || 'N/A'}</Text>
        </View>
      </View>
      <View style={styles.animeInfo}>
        <View style={styles.titleContainer}>
          <Text style={styles.animeTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.title_japanese && (
            <Text style={styles.japaneseTitle} numberOfLines={1}>
              {item.title_japanese}
            </Text>
          )}
        </View>
        <View style={styles.metaInfo}>
          <View style={styles.metaRow}>
            <Ionicons name="tv-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{item.type || 'Unknown'}</Text>
            {item.episodes && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{item.episodes} eps</Text>
              </>
            )}
          </View>
          {item.studios && item.studios.length > 0 && (
            <Text style={styles.studioText} numberOfLines={1}>
              {item.studios[0].name}
            </Text>
          )}
          {item.genres && item.genres.length > 0 && (
            <View style={styles.genreContainer}>
              {item.genres.slice(0, 2).map((genre, index) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  ), []);

  const renderSeasonalHeader = () => (
    <View style={styles.seasonalHeader}>
      <Text style={styles.seasonalTitle}>
        {selectedSeason.charAt(0).toUpperCase() + selectedSeason.slice(1)} {selectedYear}
      </Text>
      <Text style={styles.seasonalSubtitle}>
        {seasonalAnime?.length || 0} anime this season
      </Text>
    </View>
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

  const isLoading = isLoadingTop || isLoadingSearch || isLoadingSeasonal || isLoadingOngoing || isLoadingFinished || isLoadingUpcoming;

  const toggleSeasonalMenu = () => {
    if (selectedFilter === 'seasonal') {
      setShowSeasonalMenu(!showSeasonalMenu);
    } else {
      setSelectedFilter('seasonal');
      setShowSeasonalMenu(true);
    }
  };

  if (isLoadingTop && !topAnime) {
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
        headerShadowVisible: false,
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

        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'top' && styles.filterButtonActive]}
              onPress={() => {
                setSelectedFilter('top');
                setShowSeasonalMenu(false);
              }}
            >
              <Text style={[styles.filterText, selectedFilter === 'top' && styles.filterTextActive]}>Top Anime</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'ongoing' && styles.filterButtonActive]}
              onPress={() => {
                setSelectedFilter('ongoing');
                setShowSeasonalMenu(false);
              }}
            >
              <Text style={[styles.filterText, selectedFilter === 'ongoing' && styles.filterTextActive]}>Ongoing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'upcoming' && styles.filterButtonActive]}
              onPress={() => {
                setSelectedFilter('upcoming');
                setShowSeasonalMenu(false);
              }}
            >
              <Text style={[styles.filterText, selectedFilter === 'upcoming' && styles.filterTextActive]}>Upcoming</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.seasonalMainButton,
              selectedFilter === 'seasonal' && styles.seasonalMainButtonActive
            ]}
            onPress={toggleSeasonalMenu}
          >
            <View style={styles.seasonalButtonContent}>
              <Ionicons 
                name={selectedFilter === 'seasonal' ? 'calendar' : 'calendar-outline'} 
                size={24} 
                color={selectedFilter === 'seasonal' ? COLORS.text : COLORS.textSecondary} 
              />
              <Text style={[
                styles.seasonalMainText, 
                selectedFilter === 'seasonal' && styles.seasonalMainTextActive
              ]}>
                {selectedSeason.charAt(0).toUpperCase() + selectedSeason.slice(1)} {selectedYear}
              </Text>
              <Ionicons
                name={showSeasonalMenu ? "chevron-up" : "chevron-down"}
                size={24}
                color={selectedFilter === 'seasonal' ? COLORS.text : COLORS.textSecondary}
                style={styles.seasonalIcon}
              />
            </View>
          </TouchableOpacity>
        </View>

        {showSeasonalMenu && (
          <View style={styles.seasonalFilters}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonRow}>
              {SEASONS.map((season) => (
                <TouchableOpacity
                  key={season}
                  style={[styles.seasonButton, selectedSeason === season && styles.seasonButtonActive]}
                  onPress={() => setSelectedSeason(season)}
                >
                  <Text style={[styles.seasonText, selectedSeason === season && styles.seasonTextActive]}>
                    {season.charAt(0).toUpperCase() + season.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.yearSelector}
              onPress={() => setShowYearPicker(true)}
            >
              <Text style={styles.yearSelectorText}>{selectedYear}</Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <Modal
              visible={showYearPicker}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowYearPicker(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowYearPicker(false)}
              >
                <View style={styles.yearPickerContainer}>
                  <ScrollView>
                    {Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i).map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[styles.yearOption, selectedYear === year && styles.yearOptionActive]}
                        onPress={() => {
                          setSelectedYear(year);
                          setShowYearPicker(false);
                        }}
                      >
                        <Text style={[styles.yearOptionText, selectedYear === year && styles.yearOptionTextActive]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        )}

        <FlatList
          data={animeList}
          renderItem={renderAnimeItem}
          keyExtractor={(item, index) => `${item.mal_id}-${index}`}
          contentContainerStyle={styles.listContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={8}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator color={COLORS.accent} size="large" style={styles.loader} />
            ) : (
              <Text style={styles.emptyText}>No anime found</Text>
            )
          }
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
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    height: '100%',
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  seasonalMainButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    marginTop: 12,
    marginHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  seasonalButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  seasonalMainText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  seasonalMainTextActive: {
    color: COLORS.text,
  },
  seasonalIcon: {
    marginLeft: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  seasonalFilters: {
    marginHorizontal: '5%',
    marginBottom: 16,
    backgroundColor: COLORS.seasonalBg,
    borderRadius: 16,
    padding: 16,
  },
  seasonalHeader: {
    marginBottom: 16,
  },
  seasonalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
  },
  seasonalSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  seasonRow: {
    marginBottom: 12,
  },
  seasonButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  seasonButtonActive: {
    backgroundColor: COLORS.accent,
  },
  seasonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  seasonTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  yearSelectorText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearPickerContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    padding: 16,
  },
  yearOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  yearOptionActive: {
    backgroundColor: COLORS.accent,
  },
  yearOptionText: {
    color: COLORS.text,
    fontSize: 16,
    textAlign: 'center',
  },
  yearOptionTextActive: {
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  animeItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  imageContainer: {
    position: 'relative',
    width: 120,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
  },
  animeImage: {
    width: '100%',
    height: '100%',
  },
  scoreContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  animeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  titleContainer: {
    marginBottom: 8,
  },
  animeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  japaneseTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  metaInfo: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  metaDot: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  studioText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  genreTag: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genreText: {
    color: COLORS.text,
    fontSize: 10,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loader: {
    marginTop: 20,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
}); 