import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, ActivityIndicator, Dimensions, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getTags, getRandomImages, ImageData, TagData } from '../../utils/api';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
// Увеличиваем общий отступ до 48px (16px слева + 16px между + 16px справа)
const ITEM_WIDTH = (width - 48) / 2;
const ITEMS_PER_PAGE = 20;

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  // Загрузка тегов
  const { data: tags, isLoading: isLoadingTags } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  // Фильтрация тегов
  const filteredTags = useMemo(() => {
    if (!tags) return [];
    if (!tagSearch) return tags;
    
    const searchLower = tagSearch.toLowerCase();
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(searchLower)
    );
  }, [tags, tagSearch]);

  // Популярные теги (топ 10 по количеству)
  const popularTags = useMemo(() => {
    if (!tags) return [];
    return [...tags]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [tags]);

  const loadImages = async (loadMore = false) => {
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const tagString = selectedTags.join(',');
      console.log('Loading images with tags:', tagString);
      const results = await getRandomImages(ITEMS_PER_PAGE, { 
        in: tagString,
        compress: true,
        min_size: 100000
      });
      
      console.log('Received images:', results);
      
      if (!results || results.length === 0) {
        if (!loadMore) {
          setImages([]);
        }
        return;
      }
      
      const uniqueResults = results.filter((image) => {
        return !images.some(existingImage => 
          existingImage._id === image._id || existingImage.md5 === image.md5
        );
      });

      console.log('Filtered unique images:', uniqueResults);
      setImages(prevImages => loadMore ? [...prevImages, ...uniqueResults] : uniqueResults);
    } catch (error: any) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setHasSearched(true);
    }
  };

  // Автоматический поиск при изменении выбранных тегов
  useEffect(() => {
    if (selectedTags.length > 0) {
      loadImages();
    } else {
      setImages([]);
      setHasSearched(false);
    }
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
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleImagePress = (image: ImageData) => {
    console.log('Image data before navigation:', image);
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
            data={images}
            renderItem={renderImage}
            keyExtractor={(item) => `${item._id}-${item.md5}`}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.imagesList,
              images.length === 0 && styles.emptyList
            ]}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={EmptyState}
            ListFooterComponent={renderFooter}
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
  imagesList: {
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