import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageData } from '../utils/api';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoritesData = await AsyncStorage.getItem('favorites');
      console.log('Loaded favorites from storage:', favoritesData);
      
      const favoritesArray = favoritesData ? JSON.parse(favoritesData) : [];
      setFavorites(favoritesArray);
      console.log('Parsed favorites array:', favoritesArray);

      if (favoritesArray.length > 0) {
        const imagesData = await Promise.all(
          favoritesArray.map(async (id: number) => {
            try {
              const response = await fetch(`https://danbooru.donmai.us/posts/${id}.json`);
              const data = await response.json();
              console.log('Loaded image data for ID:', id, data);
              
              return {
                _id: data.id,
                file_url: data.file_url,
                file_size: data.file_size,
                tags: data.tag_string.split(' '),
                md5: data.md5,
                width: data.image_width,
                height: data.image_height,
                source: data.source,
                author: data.tag_string_artist,
                has_children: data.has_children
              } as ImageData;
            } catch (error) {
              console.error('Error loading image data for ID:', id, error);
              return null;
            }
          })
        );

        const validImages = imagesData.filter((img): img is ImageData => img !== null);
        console.log('Valid images loaded:', validImages);
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
        file_size: image.file_size.toString(),
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
        <Text style={styles.emptyText}>Нет избранных изображений</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        numColumns={2}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => handleImagePress(item)}
          >
            <Image
              source={{ uri: item.file_url }}
              style={styles.image}
              resizeMode="cover"
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
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
}); 