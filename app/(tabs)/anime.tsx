import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, TextInput, ScrollView, Dimensions, Modal } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useTopAnime, useAnimeSearch, Anime, useSeasonalAnime, useCurrentSeasonAnime, useAnimeByStatus, AnimeSeason } from '../hooks/useAnime';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { Video } from 'expo-av';
import * as WebBrowser from 'expo-web-browser';

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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showSeasonalMenu, setShowSeasonalMenu] = useState(false);

  const {
    data: topAnimeData,
    fetchNextPage: fetchNextTopAnime,
    hasNextPage: hasNextTopAnimePage,
    isFetchingNextPage: isFetchingNextTopAnimePage
  } = useTopAnime();

  const {
    data: seasonalAnimeData,
    fetchNextPage: fetchNextSeasonalAnime,
    hasNextPage: hasNextSeasonalPage,
    isFetchingNextPage: isFetchingNextSeasonalPage
  } = useSeasonalAnime(selectedSeason, selectedYear);

  const {
    data: currentSeasonData,
    fetchNextPage: fetchNextCurrentSeason,
    hasNextPage: hasNextCurrentSeasonPage,
    isFetchingNextPage: isFetchingNextCurrentSeasonPage
  } = useCurrentSeasonAnime();

  const {
    data: ongoingAnimeData,
    fetchNextPage: fetchNextOngoingAnime,
    hasNextPage: hasNextOngoingPage,
    isFetchingNextPage: isFetchingNextOngoingPage
  } = useAnimeByStatus('airing');

  const {
    data: completedAnimeData,
    fetchNextPage: fetchNextCompletedAnime,
    hasNextPage: hasNextCompletedPage,
    isFetchingNextPage: isFetchingNextCompletedPage
  } = useAnimeByStatus('complete');

  const {
    data: upcomingAnimeData,
    fetchNextPage: fetchNextUpcomingAnime,
    hasNextPage: hasNextUpcomingPage,
    isFetchingNextPage: isFetchingNextUpcomingPage
  } = useAnimeByStatus('upcoming');

  const {
    data: searchData,
    fetchNextPage: fetchNextSearch,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingNextSearchPage
  } = useAnimeSearch(searchQuery);

  const removeDuplicates = (animeList: Anime[]) => {
    const seen = new Set();
    return animeList.filter(anime => {
      const duplicate = seen.has(anime.mal_id);
      seen.add(anime.mal_id);
      return !duplicate;
    });
  };

  const getAnimeData = () => {
    let data: Anime[] = [];
    
    if (searchQuery) {
      data = searchData?.pages.flatMap(page => page.data) ?? [];
    } else {
      switch (selectedFilter) {
        case 'top':
          data = topAnimeData?.pages.flatMap(page => page.data) ?? [];
          break;
        case 'seasonal':
          data = seasonalAnimeData?.pages.flatMap(page => page.data) ?? [];
          break;
        case 'ongoing':
          data = ongoingAnimeData?.pages.flatMap(page => page.data) ?? [];
          break;
        case 'finished':
          data = completedAnimeData?.pages.flatMap(page => page.data) ?? [];
          break;
        case 'upcoming':
          data = upcomingAnimeData?.pages.flatMap(page => page.data) ?? [];
          break;
        default:
          data = [];
      }
    }
    
    return removeDuplicates(data);
  };

  const loadMore = () => {
    if (searchQuery) {
      if (hasNextSearchPage && !isFetchingNextSearchPage) {
        fetchNextSearch();
      }
      return;
    }

    switch (selectedFilter) {
      case 'top':
        if (hasNextTopAnimePage && !isFetchingNextTopAnimePage) {
          fetchNextTopAnime();
        }
        break;
      case 'seasonal':
        if (hasNextSeasonalPage && !isFetchingNextSeasonalPage) {
          fetchNextSeasonalAnime();
        }
        break;
      case 'ongoing':
        if (hasNextOngoingPage && !isFetchingNextOngoingPage) {
          fetchNextOngoingAnime();
        }
        break;
      case 'finished':
        if (hasNextCompletedPage && !isFetchingNextCompletedPage) {
          fetchNextCompletedAnime();
        }
        break;
      case 'upcoming':
        if (hasNextUpcomingPage && !isFetchingNextUpcomingPage) {
          fetchNextUpcomingAnime();
        }
        break;
    }
  };

  const isLoading = () => {
    if (searchQuery) {
      return isFetchingNextSearchPage;
    }

    switch (selectedFilter) {
      case 'top':
        return isFetchingNextTopAnimePage;
      case 'seasonal':
        return isFetchingNextSeasonalPage;
      case 'ongoing':
        return isFetchingNextOngoingPage;
      case 'finished':
        return isFetchingNextCompletedPage;
      case 'upcoming':
        return isFetchingNextUpcomingPage;
      default:
        return false;
    }
  };

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
      <View style={styles.animeContent}>
        <View style={styles.imageContainer}>
          <ExpoImage
            source={{ uri: item.images.jpg.large_image_url }}
            style={styles.animeImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.topOverlay}>
            <View>
              {item.score && (
                <View style={styles.scoreContainer}>
                  <Ionicons name="star" size={12} color={COLORS.accent} />
                  <Text style={styles.scoreText}>{item.score.toFixed(1)}</Text>
                </View>
              )}
            </View>
            {item.trailer?.youtube_id && (
              <TouchableOpacity 
                style={styles.trailerButton}
                onPress={() => {
                  WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${item.trailer.youtube_id}`);
                }}
              >
                <Ionicons name="logo-youtube" size={16} color="#FF0000" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.titleEnglish} numberOfLines={2}>
            {item.title_english || item.title}
          </Text>
          {item.title_japanese && (
            <Text style={styles.titleJapanese} numberOfLines={1}>
              {item.title_japanese}
            </Text>
          )}
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.statText}>{(item.members / 1000).toFixed(0)}K</Text>
            </View>
            {item.episodes && (
              <View style={styles.statItem}>
                <Ionicons name="tv-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{item.episodes} eps</Text>
              </View>
            )}
            {item.duration && (
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{item.duration.split(' ')[0]}</Text>
              </View>
            )}
          </View>

          {item.source && (
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceText}>
                Source: {item.source}
              </Text>
            </View>
          )}

          {item.genres && item.genres.length > 0 && (
            <View style={styles.genresContainer}>
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
        {seasonalAnimeData?.pages?.[0]?.data?.length || 0} anime this season
      </Text>
    </View>
  );

  const toggleSeasonalMenu = () => {
    if (selectedFilter === 'seasonal') {
      setShowSeasonalMenu(!showSeasonalMenu);
    } else {
      setSelectedFilter('seasonal');
      setShowSeasonalMenu(true);
    }
  };

  if (isLoading() && !getAnimeData().length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
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
            onPress={toggleSeasonalMenu}
            style={[
              styles.seasonalMainButton,
              showSeasonalMenu && styles.seasonalMainButtonActive
            ]}
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
          data={getAnimeData()}
          renderItem={renderAnimeItem}
          keyExtractor={(item) => item.mal_id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            isLoading() ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            ) : null
          )}
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
    padding: 20,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    margin: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    height: 40,
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  seasonalMainButtonActive: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  seasonalButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  seasonalMainText: {
    color: COLORS.textSecondary,
    fontSize: 16,
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
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  animeItem: {
    width: (width - 48) / 2,
    marginHorizontal: 8,
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
  animeContent: {
    flex: 1,
    minHeight: 180,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  animeImage: {
    width: '100%',
    height: '100%',
  },
  topOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreContainer: {
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
  infoContainer: {
    padding: 12,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  titleEnglish: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  titleJapanese: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sourceContainer: {
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  trailerButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 'auto',
  },
  genreTag: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    fontSize: 10,
    color: COLORS.text,
  },
}); 