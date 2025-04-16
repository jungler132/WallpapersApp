import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Dimensions } from 'react-native';
import { getRandomImages } from '../utils/api';
import { AnimeImage } from '../components/AnimeImage';
import type { ImageData } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from '../../hooks/useSettings';
import { useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');

export default function FeedScreen() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { settings, reloadSettings } = useSettings();

  const loadImages = async () => {
    try {
      const newImages = await getRandomImages(10);
      setImages(newImages);

      // Сохраняем изображения в кэш
      const cachedImages = await AsyncStorage.getItem('cached_images');
      const existingImages = cachedImages ? JSON.parse(cachedImages) : [];
      
      // Добавляем только новые изображения
      const updatedImages = [...existingImages];
      newImages.forEach(newImage => {
        if (!existingImages.some((img: ImageData) => img._id === newImage._id)) {
          updatedImages.push(newImage);
        }
      });

      await AsyncStorage.setItem('cached_images', JSON.stringify(updatedImages));
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadImages();
    setRefreshing(false);
  };

  // Загружаем изображения при монтировании
  useEffect(() => {
    loadImages();
  }, []);

  // Обновляем UI при возвращении на экран
  useFocusEffect(
    React.useCallback(() => {
      const updateUI = async () => {
        console.log('Feed screen focused, reloading settings...');
        await reloadSettings(); // Перезагружаем настройки
        console.log('Current grid columns:', settings.gridColumns);
        setImages(prevImages => {
          console.log('Forcing FlatList update with', prevImages.length, 'images');
          return [...prevImages];
        });
      };
      
      updateUI();
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        key={`grid-${settings.gridColumns}`}
        numColumns={settings.gridColumns}
        renderItem={({ item }) => <AnimeImage image={item} />}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.list}
        columnWrapperStyle={settings.gridColumns > 1 ? styles.row : undefined}
        initialNumToRender={settings.gridColumns * 2}
        maxToRenderPerBatch={settings.gridColumns * 2}
        windowSize={5}
        removeClippedSubviews={false}
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
  list: {
    padding: 4,
  },
  row: {
    justifyContent: 'flex-start',
  },
}); 