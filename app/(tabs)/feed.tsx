import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { getRandomImages } from '../utils/api';
import { AnimeImage } from '../components/AnimeImage';
import type { ImageData } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 20;

export default function FeedScreen() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs для отслеживания состояния и оптимизации
  const isMounted = useRef(true);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Отслеживаем монтирование компонента
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  // Оптимизированная функция загрузки изображений
  const loadImages = useCallback(async (isInitial: boolean = true) => {
    if (!isMounted.current) return;

    try {
      console.log(`[Feed] Loading ${ITEMS_PER_PAGE} images, isInitial:`, isInitial);
      
      const newImages = await getRandomImages(ITEMS_PER_PAGE);
      
      if (!isMounted.current) return;

      if (isInitial) {
        setImages(newImages);
      } else {
        // Проверяем на дубликаты перед добавлением
        const uniqueImages = newImages.filter(newImage => 
          !images.some(existingImage => existingImage._id === newImage._id)
        );
        setImages(prev => [...prev, ...uniqueImages]);
      }

      // Кэшируем изображения
      const cachedImages = await AsyncStorage.getItem('cached_images');
      const existingImages = cachedImages ? JSON.parse(cachedImages) : [];
      
      // Добавляем только уникальные изображения в кэш
      const updatedImages = [...existingImages];
      newImages.forEach(newImage => {
        if (!existingImages.some((img: ImageData) => img._id === newImage._id)) {
          updatedImages.push(newImage);
        }
      });

      await AsyncStorage.setItem('cached_images', JSON.stringify(updatedImages));
    } catch (error) {
      console.error('[Feed] Error loading images:', error);
    }
  }, [images]); // Зависимость от images для правильной проверки дубликатов

  const onRefresh = useCallback(async () => {
    if (!isMounted.current) return;
    setRefreshing(true);
    await loadImages(true);
    setRefreshing(false);
  }, [loadImages]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !isMounted.current) return;
    
    setIsLoadingMore(true);
    await loadImages(false);
    setIsLoadingMore(false);
  }, [isLoadingMore, loadImages]);

  // Инициализация при монтировании
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

  // Оптимизированное обновление UI при возврате на экран
  useFocusEffect(
    useCallback(() => {
      if (isMounted.current) {
        setImages(prevImages => [...prevImages]);
      }
    }, [])
  );

  const renderImage = useCallback(({ item }: { item: ImageData }) => (
    <AnimeImage image={item} />
  ), []);

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
        ref={flatListRef}
        data={images}
        numColumns={1}
        renderItem={renderImage}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.list}
        initialNumToRender={ITEMS_PER_PAGE}
        maxToRenderPerBatch={ITEMS_PER_PAGE}
        windowSize={5}
        removeClippedSubviews={true}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF3366"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 4,
  }
}); 