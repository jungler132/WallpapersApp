import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageData, getImageById } from '../utils/api';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoritesData = await AsyncStorage.getItem('favorites');
      const favoritesArray = favoritesData ? JSON.parse(favoritesData) : [];
      setFavorites(favoritesArray);

      if (favoritesArray.length > 0) {
        const imagesData = await Promise.all(
          favoritesArray.map(async (id: number) => {
            try {
              const image = await getImageById(id);
              return image;
            } catch (error) {
              console.error('Error loading image data for ID:', id, error);
              return null;
            }
          })
        );

        const validImages = imagesData.filter((img): img is ImageData => img !== null);
        setImages(validImages);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePress = (image: ImageData) => {
    router.push({
      pathname: '/image/[id]',
      params: {
        ...image,
        tags: JSON.stringify(image.tags),
        id: image._id.toString(),
        has_children: image.has_children.toString(),
        width: image.width.toString(),
        height: image.height.toString()
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3366" />
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No favorite images</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        numColumns={2}
        keyExtractor={(item) => item._id.toString()}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={true}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => handleImagePress(item)}
          >
            <Image
              source={{ uri: item.file_url }}
              style={styles.image}
              contentFit="cover"
              transition={1000}
              cachePolicy="memory-disk"
              placeholder={require('../assets/placeholder/image-placeholder.png')}
              recyclingKey={item._id.toString()}
            />
          </TouchableOpacity>
        )}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  imageContainer: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
  },
  image: {
    flex: 1,
    borderRadius: 8,
  },
}); 