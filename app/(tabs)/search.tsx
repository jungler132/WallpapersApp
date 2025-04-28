import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, ActivityIndicator, Dimensions, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getTags, getRandomImages, ImageData, TagData } from '../../utils/api';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
// Увеличиваем общий отступ до 48px (16px слева + 16px между + 16px справа)
const ITEM_WIDTH = (width - 48) / 2;
const ITEMS_PER_PAGE = 20;
const TAGS_CACHE_KEY = 'cached_tags';
const TAGS_CACHE_TIMESTAMP_KEY = 'cached_tags_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 часа

export default function SearchScreen() {
  console.log('🚀 [Search] Component mounted');
  const insets = useSafeAreaInsets();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  const flatListRef = useRef<FlatList>(null);
  const lastScrollPosition = useRef(0);

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
    if (!hasSearched) {
      return (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="tag-multiple" size={64} color="#FF3366" />
          <Text style={styles.emptyStateText}>Select Tags to Search</Text>
          <Text style={styles.emptyStateSubtext}>Combine multiple tags for better results</Text>
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons name="magnify" size={24} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tags..."
            placeholderTextColor="#666666"
            value={tagSearch}
            onChangeText={setTagSearch}
          />
          {tagSearch ? (
            <TouchableOpacity onPress={() => setTagSearch('')}>
              <MaterialCommunityIcons name="close" size={20} color="#666666" />
            </TouchableOpacity>
          ) : null}
        </View>

        {!tagSearch && renderTagsList('Popular Tags', popularTags)}
        
        {tagSearch && filteredTags.length > 0 && (
          renderTagsList('Search Results', filteredTags)
        )}

        {tagSearch && filteredTags.length === 0 && (
          <View style={styles.noTagsFound}>
            <Text style={styles.noTagsFoundText}>No tags found</Text>
          </View>
        )}
      </View>

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

      <View style={styles.imagesContainer}>
        <Text style={styles.sectionTitle}>Search Results</Text>
        {isLoading ? (
          <ActivityIndicator color="#FF3366" style={styles.loader} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={images}
            renderItem={renderImage}
            keyExtractor={(item) => item._id.toString()}
            numColumns={2}
            contentContainerStyle={styles.imageList}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ListEmptyComponent={EmptyState}
            ListFooterComponent={renderFooter}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
}); 