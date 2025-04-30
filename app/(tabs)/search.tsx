import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, ActivityIndicator, Dimensions, TextInput, ViewStyle, TextStyle } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getTags, getRandomImages, ImageData, TagData } from '../../utils/api';
import { router, Stack } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width } = Dimensions.get('window');
// Увеличиваем общий отступ до 48px (16px слева + 16px между + 16px справа)
const ITEM_WIDTH = (width - 48) / 2;
const ITEMS_PER_PAGE = 20;
const TAGS_CACHE_KEY = 'cached_tags';
const TAGS_CACHE_TIMESTAMP_KEY = 'cached_tags_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 часа

const COLORS = {
  primary: '#121212',
  secondary: '#1E1E1E',
  accent: '#FF4081',
  text: '#FFFFFF',
  textSecondary: '#9E9E9E',
  border: '#2C2C2C',
  cardBg: '#1A1A1A',
};

type SearchMode = 'arts' | 'characters';

interface Character {
  mal_id: number;
  name: string;
  images: {
    jpg: {
      image_url: string;
    }
  };
  about: string | null;
  pictures: {
    jpg: {
      image_url: string;
    }
  }[];
  anime: {
    role: string;
    anime: {
      title: string;
      mal_id: number;
    }
  }[];
}

interface CharacterResponse {
  data: Character[];
  pagination: {
    has_next_page: boolean;
    current_page: number;
  };
}

type SearchData = ImageData | Character;

export default function SearchScreen() {
  console.log('�� [Search] Component mounted');
  const insets = useSafeAreaInsets();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [characterSearch, setCharacterSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [characterSearchTimeout, setCharacterSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const flatListRef = useRef<FlatList>(null);
  const lastScrollPosition = useRef(0);
  const [searchMode, setSearchMode] = useState<SearchMode>('arts');

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Загрузка тегов с кэшированием
  const { data: tags, isLoading: isLoadingTags } = useQuery<TagData[]>({
    queryKey: ['tags'],
    queryFn: async () => {
      try {
        // Проверяем кэш
        const cachedTags = await AsyncStorage.getItem(TAGS_CACHE_KEY);
        const cachedTimestamp = await AsyncStorage.getItem(TAGS_CACHE_TIMESTAMP_KEY);
        const now = Date.now();

        if (cachedTags && cachedTimestamp) {
          const timestamp = parseInt(cachedTimestamp);
          // Если кэш не устарел, используем его
          if (now - timestamp < CACHE_DURATION) {
            console.log('📦 [Search] Using cached tags');
            return JSON.parse(cachedTags) as TagData[];
          }
        }

        // Если кэша нет или он устарел, загружаем новые теги
        console.log('🌐 [Search] Fetching fresh tags');
        const freshTags = await getTags();
        
        // Сохраняем в кэш
        await AsyncStorage.setItem(TAGS_CACHE_KEY, JSON.stringify(freshTags));
        await AsyncStorage.setItem(TAGS_CACHE_TIMESTAMP_KEY, now.toString());
        
        return freshTags;
      } catch (error) {
        console.error('❌ [Search] Error loading tags:', error);
        // В случае ошибки пытаемся использовать кэш, даже если он устарел
        const cachedTags = await AsyncStorage.getItem(TAGS_CACHE_KEY);
        if (cachedTags) {
          console.log('⚠️ [Search] Using stale cache due to error');
          return JSON.parse(cachedTags) as TagData[];
        }
        throw error;
      }
    },
    staleTime: CACHE_DURATION,
    gcTime: CACHE_DURATION * 2,
  });

  // Фильтрация тегов
  const filteredTags = useMemo(() => {
    console.log('🔍 [Search] Filtering tags with search:', tagSearch);
    if (!tags) {
      console.log('📦 [Search] No tags available yet');
      return [];
    }
    if (!tagSearch) {
      console.log('📦 [Search] No search term, returning all tags');
      return tags;
    }
    
    const searchLower = tagSearch.toLowerCase();
    const filtered = tags.filter(tag => 
      tag.name.toLowerCase().includes(searchLower)
    );
    console.log('📊 [Search] Filtered tags count:', filtered.length);
    return filtered;
  }, [tags, tagSearch]);

  // Популярные теги (топ 10 по количеству)
  const popularTags = useMemo(() => {
    if (!tags) return [];
    return [...tags]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [tags]);

  const handleScroll = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    // Если пользователь прокрутил достаточно далеко и мы не загружаем уже
    if (isCloseToBottom && !isLoadingMore && selectedTags.length > 0) {
      console.log('📥 [Search] Preloading next page...');
      loadImages(true).finally(() => {
        if (isMounted.current) {
          setIsLoadingMore(false);
        }
      });
    }
    
    lastScrollPosition.current = contentOffset.y;
  }, [isLoadingMore, selectedTags]);

  const loadImages = async (isLoadMore: boolean = false) => {
    if (!isMounted.current) return;

    console.log('🔄 [Search] Starting loadImages, isLoadMore:', isLoadMore);
    console.log('🏷️ [Search] Current selected tags in loadImages:', selectedTags);

    if (!isLoadMore) {
      console.log('🧹 [Search] Starting new search - clearing all images');
      setIsLoading(true);
      setImages([]);
      setHasSearched(false);
    } else {
      setIsLoadingMore(true);
    }

    try {
      console.log('🌐 [Search] Fetching new images...');
      const newImages = await getRandomImages(selectedTags);
      
      if (!isMounted.current) return;
      
      const filteredImages = newImages.filter(image => 
        selectedTags.every(tag => image.tags.includes(tag))
      );
      
      console.log('✅ [Search] Received new images:', filteredImages.length);
      setHasSearched(true);
      
      if (isLoadMore) {
        console.log('📥 [Search] Appending new images to existing ones');
        // Проверяем на дубликаты перед добавлением
        const uniqueImages = filteredImages.filter(newImage => 
          !images.some(existingImage => existingImage._id === newImage._id)
        );
        setImages(prevImages => [...prevImages, ...uniqueImages]);
      } else {
        console.log('📥 [Search] Setting new images');
        setImages(filteredImages);
      }
    } catch (error) {
      console.error('❌ [Search] Error loading images:', error);
      if (isMounted.current) {
        setImages([]);
        setHasSearched(false);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  };

  const debouncedLoadImages = useCallback((loadMore = false) => {
    if (!isMounted.current) return;

    console.log('⏱️ [Search] Starting debounced load, loadMore:', loadMore);
    console.log('📝 [Search] Current selected tags in debounce:', selectedTags);
    
    if (searchTimeout) {
      console.log('🧹 [Search] Clearing previous timeout');
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (isMounted.current) {
        console.log('⏰ [Search] Timeout triggered, loading images');
        console.log('📝 [Search] Current selected tags in timeout:', selectedTags);
        loadImages(loadMore);
      }
    }, 500);

    setSearchTimeout(timeout);
  }, [searchTimeout, selectedTags]);

  // Автоматический поиск при изменении выбранных тегов
  useEffect(() => {
    if (!isMounted.current) return;

    console.log('🔄 [Search] Selected tags changed:', selectedTags);
    if (selectedTags.length > 0) {
      console.log('🔍 [Search] Tags selected, starting new search');
      setImages([]); // Очищаем изображения при изменении тегов
      setHasSearched(false); // Сбрасываем флаг поиска
      debouncedLoadImages();
    } else {
      console.log('🧹 [Search] No tags selected, clearing all results');
      setImages([]);
      setHasSearched(false);
    }

    return () => {
      if (searchTimeout) {
        console.log('🧹 [Search] Cleaning up timeout on unmount');
        clearTimeout(searchTimeout);
      }
    };
  }, [selectedTags]);

  const handleLoadMore = () => {
    if (!isLoadingMore && selectedTags.length > 0) {
      loadImages(true);
    }
  };

  const EmptyState = () => {
    if (searchMode === 'characters' && !characterSearch.trim()) {
      return (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="account-search" size={64} color="#FF3366" />
          <Text style={styles.emptyStateText}>Enter Character Name to Search</Text>
        </View>
      );
    }

    if (!hasSearched && searchMode === 'arts') {
      return (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="tag-multiple" size={64} color="#FF3366" />
          <Text style={styles.emptyStateText}>Select Tags to Search</Text>
        </View>
      );
    }

    if (hasSearched && images.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="image-search" size={64} color="#FF3366" />
          <Text style={styles.emptyStateText}>No Images Found</Text>
          <Text style={styles.emptyStateSubtext}>Try different tags or combinations</Text>
        </View>
      );
    }

    return null;
  };

  const handleTagPress = (tag: string) => {
    console.log('👆 [Search] Tag pressed:', tag);
    console.log('📝 [Search] Current selected tags before change:', selectedTags);
    
    if (selectedTags.includes(tag)) {
      console.log('➖ [Search] Removing tag:', tag);
      setSelectedTags(prevTags => {
        const newTags = prevTags.filter(t => t !== tag);
        console.log('📝 [Search] New tags after removal:', newTags);
        return newTags;
      });
    } else {
      console.log('➕ [Search] Adding tag:', tag);
      setSelectedTags(prevTags => {
        const newTags = [...prevTags, tag];
        console.log('📝 [Search] New tags after addition:', newTags);
        return newTags;
      });
    }
  };

  const handleImagePress = (image: ImageData) => {
    console.log('🖼️ [Search] Image pressed:', {
      id: image._id,
      tags: image.tags,
      url: image.file_url
    });
    router.push({
      pathname: '/image/[id]',
      params: {
        ...image,
        id: image._id.toString(),
        file_url: image.file_url,
        cached_uri: '',
        tags: JSON.stringify(image.tags),
        md5: image.md5,
        width: image.width.toString(),
        height: image.height.toString(),
        source: image.source,
        author: image.author,
        has_children: image.has_children.toString(),
        _id: image._id.toString(),
        file_size: image.file_size?.toString() || '0'
      },
    });
  };

  const renderTag = ({ item }: { item: TagData }) => (
    <TouchableOpacity
      style={[
        styles.tag,
        selectedTags.includes(item.name) && styles.selectedTag,
      ]}
      onPress={() => handleTagPress(item.name)}
    >
      <Text style={[
        styles.tagText,
        selectedTags.includes(item.name) && styles.selectedTagText,
      ]}>
        #{item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderImage = ({ item, index }: { item: ImageData; index: number }) => {
    // Добавляем протокол к URL изображения
    const imageUrl = item.file_url.startsWith('http') 
      ? item.file_url 
      : `https://${item.file_url}`;

    return (
      <TouchableOpacity
        style={[
          styles.imageContainer,
          index % 2 === 1 && styles.rightColumnImage
        ]}
        onPress={() => handleImagePress(item)}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
          placeholder={require('../../assets/placeholder/image-placeholder.png')}
          placeholderContentFit="contain"
          priority="high"
        />
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color="#FF3366" />
      </View>
    );
  };

  const renderTagsList = (title: string, data: TagData[]) => (
    <View style={styles.tagsSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        renderItem={renderTag}
        keyExtractor={(item) => item.name}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsList}
      />
    </View>
  );

  const { 
    data: charactersData, 
    fetchNextPage: fetchNextCharacters, 
    hasNextPage: hasNextCharactersPage, 
    isFetchingNextPage: isFetchingNextCharactersPage,
    isLoading: isLoadingCharacters,
    isError: isCharactersError,
    error: charactersError,
    refetch
  } = useInfiniteQuery<CharacterResponse>({
    queryKey: ['characterSearch', characterSearch],
    queryFn: async ({ pageParam = 1 }) => {
      if (!characterSearch.trim()) return { data: [], pagination: { has_next_page: false, current_page: 1 } };
      const response = await axios.get(`https://api.jikan.moe/v4/characters?q=${characterSearch}&page=${pageParam}&fields=about,pictures`);
      return response.data;
    },
    getNextPageParam: (lastPage: CharacterResponse) => {
      if (lastPage.pagination?.has_next_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
    enabled: searchMode === 'characters',
    initialPageParam: 1,
  });

  const loadMore = () => {
    if (searchMode === 'arts') {
      handleLoadMore();
    } else {
      if (hasNextCharactersPage && !isFetchingNextCharactersPage) {
        fetchNextCharacters();
      }
    }
  };

  const getSearchData = (): SearchData[] => {
    if (searchMode === 'arts') {
      return images;
    } else {
      const filteredData = charactersData?.pages.flatMap(page => 
        page.data.filter(character => {
          console.log('Checking character:', character.name);
          console.log('Image URL:', character.images?.jpg?.image_url);
          
          // Проверяем URL изображения на наличие MAL-логотипа или иконки
          const isMALLogo = character.images?.jpg?.image_url?.toLowerCase().includes('mal') ||
                           character.images?.jpg?.image_url?.toLowerCase().includes('questionmark') ||
                           character.images?.jpg?.image_url?.toLowerCase().includes('default') ||
                           character.images?.jpg?.image_url?.toLowerCase().includes('placeholder') ||
                           character.images?.jpg?.image_url?.includes('apple-touch-icon-256.png');
          
          console.log('Is MAL logo:', isMALLogo);
          
          // Проверяем наличие дополнительных изображений
          const hasPictures = Array.isArray(character.pictures) && character.pictures.length > 0;
          console.log('Has pictures:', hasPictures);
          
          // Проверяем наличие описания
          const hasAbout = character.about && character.about.trim().length > 0;
          console.log('Has about:', hasAbout);
          
          // Проверяем имя
          const hasName = character.name && character.name.trim().length > 0;
          console.log('Has name:', hasName);
          
          // Теперь разрешаем отображение даже с MAL иконкой, так как мы заменим ее на свою
          const shouldInclude = hasName && (hasPictures || hasAbout);
          console.log('Should include:', shouldInclude);
          
          return shouldInclude;
        })
      ) ?? [];
      
      console.log('Filtered data length:', filteredData.length);
      return filteredData as SearchData[];
    }
  };

  const renderCharacterItem = useCallback(({ item }: { item: Character }) => {
    const isPlaceholder = item.images?.jpg?.image_url?.includes('apple-touch-icon-256.png');
    
    // Берем первые 2 аниме для отображения
    const animeAppearances = item.anime?.slice(0, 2).map(appearance => ({
      title: appearance.anime.title,
      role: appearance.role
    }));
    const totalAnime = item.anime?.length || 0;
    const hasMoreAnime = totalAnime > 2;

    return (
      <TouchableOpacity
        style={[styles.imageCard, styles.characterCard]}
        onPress={() => {
          router.push({
            pathname: '/anime/character/[id]',
            params: { id: item.mal_id }
          });
        }}
        activeOpacity={0.7}
      >
        {isPlaceholder ? (
          <View style={[styles.image, styles.placeholderContainer]}>
            <MaterialCommunityIcons name="account" size={64} color="#666666" />
          </View>
        ) : (
          <Image
            source={{ uri: item.images.jpg.image_url }}
            style={styles.image}
            contentFit="cover"
            transition={300}
            placeholder={require('../../assets/placeholder/image-placeholder.png')}
            placeholderContentFit="contain"
          />
        )}
        <View style={styles.characterInfoContainer}>
          <Text style={styles.characterName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.animeList}>
            {animeAppearances?.map((appearance, index) => (
              <Text key={index} style={styles.animeItem} numberOfLines={1}>
                {appearance.title}
                <Text style={styles.roleText}> • {appearance.role}</Text>
              </Text>
            ))}
            {hasMoreAnime && (
              <Text style={styles.moreAnimeText}>
                +{totalAnime - 2} more anime
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const renderItem = ({ item }: { item: SearchData }) => {
    if (searchMode === 'arts') {
      return renderImage({ item: item as ImageData, index: 0 });
    } else {
      return renderCharacterItem({ item: item as Character });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Search',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.text,
        }}
      />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.searchModeContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              searchMode === 'arts' && styles.modeButtonActive,
              { marginRight: 8 }
            ]}
            onPress={() => setSearchMode('arts')}
          >
            <Text style={[
              styles.modeButtonText,
              searchMode === 'arts' && styles.modeButtonTextActive
            ]}>Arts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              searchMode === 'characters' && styles.modeButtonActive,
              { marginLeft: 8 }
            ]}
            onPress={() => setSearchMode('characters')}
          >
            <Text style={[
              styles.modeButtonText,
              searchMode === 'characters' && styles.modeButtonTextActive
            ]}>Characters</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialCommunityIcons name="magnify" size={24} color="#666666" />
            <TextInput
              style={styles.searchInput}
              placeholder={searchMode === 'arts' ? "Search tags..." : "Search characters..."}
              placeholderTextColor="#666666"
              value={searchMode === 'arts' ? tagSearch : characterSearch}
              onChangeText={searchMode === 'arts' ? setTagSearch : setCharacterSearch}
            />
            {(searchMode === 'arts' ? tagSearch : characterSearch) ? (
              <TouchableOpacity onPress={() => searchMode === 'arts' ? setTagSearch('') : setCharacterSearch('')}>
                <MaterialCommunityIcons name="close" size={20} color="#666666" />
              </TouchableOpacity>
            ) : null}
          </View>

          {searchMode === 'arts' && (
            <>
              {!tagSearch && renderTagsList('Popular Tags', popularTags)}
              
              {tagSearch && filteredTags.length > 0 && (
                renderTagsList('Search Results', filteredTags)
              )}

              {tagSearch && filteredTags.length === 0 && (
                <View style={styles.noTagsFound}>
                  <Text style={styles.noTagsFoundText}>No tags found</Text>
                </View>
              )}
            </>
          )}
        </View>

        {searchMode === 'arts' && (
          <View style={styles.selectedTagsContainer}>
            {selectedTags.length > 0 && (
              <FlatList
                data={selectedTags}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.selectedTag}
                    onPress={() => handleTagPress(item)}
                  >
                    <Text style={styles.selectedTagText}>#{item}</Text>
                    <MaterialCommunityIcons name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectedTagsList}
              />
            )}
          </View>
        )}

        {searchMode === 'characters' && isLoadingCharacters ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF3366" />
          </View>
        ) : searchMode === 'characters' && isCharactersError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {charactersError?.message || 'Failed to load characters'}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setCharacterSearch(characterSearch);
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagesContainer}>
            {(searchMode === 'arts' && selectedTags.length > 0) || 
             (searchMode === 'characters' && characterSearch.trim().length > 0) ? (
              <Text style={styles.sectionTitle}>Search Results</Text>
            ) : null}
            {isLoading ? (
              <ActivityIndicator color="#FF3366" style={styles.loader} />
            ) : (
              <FlatList
                ref={flatListRef}
                data={getSearchData()}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={2}
                contentContainerStyle={styles.imageList}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ListEmptyComponent={EmptyState}
                ListFooterComponent={() => (
                  (searchMode === 'arts' && isLoadingMore) || 
                  (searchMode === 'characters' && isFetchingNextCharactersPage) ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={COLORS.accent} />
                    </View>
                  ) : null
                )}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
              />
            )}
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tagsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tagsList: {
    paddingRight: 16,
  },
  tag: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedTag: {
    backgroundColor: '#FF3366',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectedTagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  imagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  imageList: {
    paddingBottom: 16,
    gap: 16,
  },
  imageContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    marginBottom: 16,
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rightColumnImage: {
    marginRight: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loader: {
    marginTop: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 300,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#999999',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  noTagsFound: {
    padding: 16,
    alignItems: 'center',
  },
  noTagsFoundText: {
    color: '#666666',
    fontSize: 16,
  },
  selectedTagsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  selectedTagsList: {
    gap: 8,
  },
  searchModeContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 0,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#FF3366',
  },
  modeButtonText: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  characterCard: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  characterInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 8,
  },
  characterName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  animeList: {
    gap: 2,
  },
  animeItem: {
    color: COLORS.text,
    fontSize: 11,
    textAlign: 'center',
  },
  roleText: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  moreAnimeText: {
    color: COLORS.accent,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  imageCard: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    marginBottom: 16,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
  } as ViewStyle,
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
  } as ViewStyle,
  errorText: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 16,
  } as TextStyle,
  retryButton: {
    padding: 12,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
  } as ViewStyle,
  retryButtonText: {
    color: COLORS.text,
    fontSize: 14,
  } as TextStyle,
  placeholderContainer: {
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 