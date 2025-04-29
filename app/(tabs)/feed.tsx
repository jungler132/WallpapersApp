import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Dimensions, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { getRandomImages } from '../utils/api';
import type { ImageData } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 20;
const ITEM_WIDTH = width - 32; // Full width minus padding
const ITEM_HEIGHT = ITEM_WIDTH * 1.4; // Make images 40% taller than width

export default function FeedScreen() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const isMounted = useRef(true);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const canLoadMore = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    canLoadMore.current = true;
    return () => {
      isMounted.current = false;
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  const loadImages = useCallback(async (isInitial: boolean = true) => {
    if (!isMounted.current || (!isInitial && !canLoadMore.current)) return;

    try {
      setHasError(false);
      console.log(`[Feed] Loading ${ITEMS_PER_PAGE} images, isInitial:`, isInitial);
      
      const newImages = await getRandomImages(ITEMS_PER_PAGE);
      
      if (!isMounted.current) return;

      if (newImages.length === 0) {
        canLoadMore.current = false;
        return;
      }

      if (isInitial) {
        setImages(newImages);
        canLoadMore.current = true;
      } else {
        const uniqueImages = newImages.filter(newImage => 
          !images.some(existingImage => existingImage._id === newImage._id)
        );
        
        if (uniqueImages.length === 0) {
          canLoadMore.current = false;
          return;
        }
        
        setImages(prev => [...prev, ...uniqueImages]);
      }

      // Кэширование изображений
      try {
        const cachedImages = await AsyncStorage.getItem('cached_images');
        const existingImages = cachedImages ? JSON.parse(cachedImages) : [];
        
        const updatedImages = [...existingImages];
        newImages.forEach(newImage => {
          if (!existingImages.some((img: ImageData) => img._id === newImage._id)) {
            updatedImages.push(newImage);
          }
        });

        await AsyncStorage.setItem('cached_images', JSON.stringify(updatedImages.slice(-100))); // Ограничиваем кэш
      } catch (cacheError) {
        console.error('[Feed] Cache error:', cacheError);
      }
    } catch (error) {
      console.error('[Feed] Error loading images:', error);
      setHasError(true);
      canLoadMore.current = true; // Разрешаем повторную попытку при ошибке
    }
  }, [images]);

  const onRefresh = useCallback(async () => {
    if (!isMounted.current) return;
    setRefreshing(true);
    canLoadMore.current = true;
    await loadImages(true);
    setRefreshing(false);
  }, [loadImages]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !isMounted.current || !canLoadMore.current) return;
    
    setIsLoadingMore(true);
    await loadImages(false);
    setIsLoadingMore(false);
  }, [isLoadingMore, loadImages]);

  useEffect(() => {
    const initialize = async () => {
      if (images.length === 0) {
        await loadImages(true);
      }
      if (isMounted.current) {
        setIsLoading(false);
      }
    };
    initialize();
  }, [loadImages]);

  useFocusEffect(
    useCallback(() => {
      if (isMounted.current && images.length === 0) {
        loadImages(true);
      }
    }, [loadImages])
  );

  const handleImagePress = (image: ImageData) => {
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

  const renderImage = useCallback(({ item }: { item: ImageData }) => {
    const imageUrl = item.file_url.startsWith('http') 
      ? item.file_url 
      : `https://${item.file_url}`;

    return (
      <TouchableOpacity
        style={styles.imageContainer}
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
  }, []);

  const ListFooterComponent = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="large" color="#FF3366" />
        </View>
      );
    }
    if (hasError) {
      return (
        <View style={styles.footerError}>
          <Text style={styles.errorText}>Failed to load images. Pull to refresh.</Text>
        </View>
      );
    }
    if (!canLoadMore.current && images.length > 0) {
      return (
        <View style={styles.footerEnd}>
          <Text style={styles.endText}>No more images to load</Text>
        </View>
      );
    }
    return null;
  }, [isLoadingMore, hasError, images.length]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3366" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        key="single-column"
        ref={flatListRef}
        data={images}
        renderItem={renderImage}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.imageList}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={ListFooterComponent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF3366"
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        windowSize={5}
        scrollEventThrottle={16}
        numColumns={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageList: {
    paddingTop: 16,
    paddingBottom: 80,
  },
  imageContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerError: {
    padding: 16,
    alignItems: 'center',
  },
  footerEnd: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3366',
    fontSize: 16,
  },
  endText: {
    color: '#666',
    fontSize: 14,
  },
}); 