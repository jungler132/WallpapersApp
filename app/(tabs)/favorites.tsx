import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageData } from '../../utils/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const SCREEN_PADDING = 16; // Отступ от краев экрана
const ITEM_MARGIN = 16; // Отступ между элементами
const ITEM_WIDTH = (width - (SCREEN_PADDING * 2) - ITEM_MARGIN) / 2; // Ширина элемента с учетом отступов
const FULL_WIDTH = width - (SCREEN_PADDING * 2); // Полная ширина для большой карточки

interface Character {
  mal_id: number;
  name: string;
  images: {
    jpg: {
      image_url: string;
    }
  };
}

type FavoriteMode = 'arts' | 'characters';

export default function FavoritesScreen() {
  const [favoriteArts, setFavoriteArts] = useState<number[]>([]);
  const [favoriteCharacters, setFavoriteCharacters] = useState<number[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<FavoriteMode>('arts');
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      // Загружаем избранные арты
      const artsData = await AsyncStorage.getItem('favorites');
      const artsArray = artsData ? JSON.parse(artsData) : [];
      setFavoriteArts(artsArray);

      // Загружаем избранных персонажей
      const charactersData = await AsyncStorage.getItem('favorite_characters');
      const charactersArray = charactersData ? JSON.parse(charactersData) : [];
      setFavoriteCharacters(charactersArray);

      // Загружаем кэшированные арты
      const cachedImages = await AsyncStorage.getItem('cached_images');
      const allImages = cachedImages ? JSON.parse(cachedImages) : [];
      const favoriteImages = allImages.filter((img: ImageData) => 
        artsArray.includes(img._id)
      );
      setImages(favoriteImages);

      // Загружаем кэшированных персонажей
      const cachedCharacters = await AsyncStorage.getItem('cached_characters');
      const allCharacters = cachedCharacters ? JSON.parse(cachedCharacters) : [];
      const favoriteChars = allCharacters.filter((char: Character) => 
        charactersArray.includes(char.mal_id)
      );
      setCharacters(favoriteChars);
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
        file_size: image.file_size?.toString() || '0',
        width: image.width.toString(),
        height: image.height.toString()
      }
    });
  };

  const handleCharacterPress = (character: Character) => {
    router.push({
      pathname: '/anime/character/[id]',
      params: { id: character.mal_id }
    });
  };

  const renderEmptyState = () => {
    const icon = mode === 'arts' ? 'image-multiple' : 'account-group';
    const text = mode === 'arts' ? 'No favorite arts' : 'No favorite characters';
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name={icon} size={64} color="#FF3366" />
        <Text style={styles.emptyText}>{text}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3366" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Favorites',
          headerStyle: {
            backgroundColor: '#121212',
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      <View style={styles.container}>
        <View style={styles.searchModeContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'arts' && styles.modeButtonActive,
            ]}
            onPress={() => setMode('arts')}
          >
            <Text style={[
              styles.modeButtonText,
              mode === 'arts' && styles.modeButtonTextActive
            ]}>Arts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              mode === 'characters' && styles.modeButtonActive,
            ]}
            onPress={() => setMode('characters')}
          >
            <Text style={[
              styles.modeButtonText,
              mode === 'characters' && styles.modeButtonTextActive
            ]}>Characters</Text>
          </TouchableOpacity>
        </View>

        {mode === 'arts' && favoriteArts.length === 0 && renderEmptyState()}
        {mode === 'characters' && favoriteCharacters.length === 0 && renderEmptyState()}

        {mode === 'arts' && favoriteArts.length > 0 && (
          <FlatList
            data={images}
            numColumns={2}
            keyExtractor={(item) => item._id.toString()}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.row}
            renderItem={({ item, index }) => {
              const isLastOdd = index === images.length - 1 && images.length % 2 !== 0;
              
              return (
                <TouchableOpacity
                  style={[
                    styles.imageCard,
                    isLastOdd && styles.largeImageCard
                  ]}
                  onPress={() => handleImagePress(item)}
                >
                  <Image
                    source={{ uri: item.file_url.startsWith('http') ? item.file_url : `https://${item.file_url}` }}
                    style={styles.image}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="memory-disk"
                    placeholder={require('../../assets/placeholder/image-placeholder.png')}
                    placeholderContentFit="contain"
                  />
                </TouchableOpacity>
              );
            }}
          />
        )}

        {mode === 'characters' && favoriteCharacters.length > 0 && (
          <FlatList
            data={characters}
            numColumns={2}
            keyExtractor={(item) => item.mal_id.toString()}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.row}
            renderItem={({ item, index }) => {
              const isLastOdd = index === characters.length - 1 && characters.length % 2 !== 0;
              
              return (
                <TouchableOpacity
                  style={[
                    styles.imageCard,
                    styles.characterCard,
                    isLastOdd && styles.largeImageCard
                  ]}
                  onPress={() => handleCharacterPress(item)}
                >
                  <Image
                    source={{ uri: item.images.jpg.image_url }}
                    style={styles.image}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="memory-disk"
                    placeholder={require('../../assets/placeholder/image-placeholder.png')}
                    placeholderContentFit="contain"
                  />
                  <View style={[
                    styles.characterNameContainer,
                    isLastOdd && { padding: 12 }
                  ]}>
                    <Text style={[
                      styles.characterName,
                      isLastOdd && { fontSize: 16 }
                    ]}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  searchModeContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
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
    marginTop: 16,
  },
  listContent: {
    padding: SCREEN_PADDING,
  },
  row: {
    justifyContent: 'center',
    gap: ITEM_MARGIN,
  },
  imageCard: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
    marginBottom: ITEM_MARGIN,
  },
  largeImageCard: {
    width: FULL_WIDTH,
    height: FULL_WIDTH, // Высота будет равна ширине для сохранения пропорций
    alignSelf: 'center', // Центрируем карточку
  },
  characterCard: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  characterNameContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
  },
  characterName: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
}); 