import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isChangingGrid, setIsChangingGrid] = useState(false);
  const { settings, reloadSettings } = useSettings();

  // Calculate the number of images to load based on the number of columns
  const getLoadCount = () => {
    // Load 2 rows for each number of columns
    return settings.gridColumns * 2;
  };

  const loadImages = async (isInitial: boolean = true) => {
    try {
      const loadCount = getLoadCount();
      console.log(`Loading ${loadCount} images for ${settings.gridColumns} columns`);
      
      const newImages = await getRandomImages(loadCount);
      
      if (isInitial) {
        setImages(newImages);
      } else {
        setImages(prev => [...prev, ...newImages]);
      }

      // Save images to cache
      const cachedImages = await AsyncStorage.getItem('cached_images');
      const existingImages = cachedImages ? JSON.parse(cachedImages) : [];
      
      // Add only new images
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
    await loadImages(true);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    await loadImages(false);
    setIsLoadingMore(false);
  };

  // Load images on first mount
  useEffect(() => {
    if (images.length === 0) {
      loadImages(true);
    }
  }, []);

  // Update UI when returning to the screen
  useFocusEffect(
    React.useCallback(() => {
      const updateUI = async () => {
        setIsChangingGrid(true);
        console.log('Feed screen focused, reloading settings...');
        await reloadSettings();
        console.log('Current grid columns:', settings.gridColumns);
        setImages(prevImages => [...prevImages]);
        // Small delay before hiding the loader for smoothness
        setTimeout(() => {
          setIsChangingGrid(false);
        }, 300);
      };
      
      updateUI();
    }, [])
  );

  if (isChangingGrid) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3366" />
      </View>
    );
  }

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
        initialNumToRender={getLoadCount()}
        maxToRenderPerBatch={getLoadCount()}
        windowSize={5}
        removeClippedSubviews={false}
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
  },
  row: {
    justifyContent: 'flex-start',
  },
}); 