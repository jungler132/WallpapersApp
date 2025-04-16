import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { getRandomImages } from '../utils/api';
import { AnimeImage } from '../components/AnimeImage';
import type { ImageData } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FeedScreen() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadImages = async () => {
    try {
      const newImages = await getRandomImages(10);
      console.log('Полный массив изображений:', JSON.stringify(newImages, null, 2));
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

  useEffect(() => {
    loadImages();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        renderItem={({ item }) => {
          console.log('Rendering image:', item.file_url);
          return <AnimeImage image={item} />;
        }}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.list}
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
    padding: 8,
  },
}); 