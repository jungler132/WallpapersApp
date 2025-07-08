import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, FlatList, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useFavorites } from '../../../hooks/useFavorites';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

const COLORS = {
  primary: '#121212',
  secondary: '#1E1E1E',
  accent: '#FF4081',
  text: '#FFFFFF',
  textSecondary: '#9E9E9E',
  border: '#2C2C2C',
  cardBg: '#1A1A1A',
};

const windowWidth = Dimensions.get('window').width;
const IMAGES_PER_ROW = 2;
const IMAGE_MARGIN = 12;
const IMAGE_WIDTH = (windowWidth - (IMAGE_MARGIN * (IMAGES_PER_ROW + 1))) / IMAGES_PER_ROW;
const IMAGE_HEIGHT = IMAGE_WIDTH * 1.3;

interface CharacterDetails {
  data: {
    mal_id: number;
    url: string;
    images: {
      jpg: {
        image_url: string;
        small_image_url: string;
      };
      webp: {
        image_url: string;
        small_image_url: string;
      };
    };
    name: string;
    name_kanji: string;
    nicknames: string[];
    favorites: number;
    about: string;
    anime: {
      role: string;
      anime: {
        mal_id: number;
        title: string;
        url: string;
      }
    }[];
  };
}

interface CharacterPictures {
  data: Array<{
    jpg: {
      image_url: string;
      small_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
    };
  }>;
}

const removeDuplicatePictures = (pictures: { jpg: { image_url: string } }[]) => {
  const seen = new Set();
  return pictures.filter(picture => {
    const duplicate = seen.has(picture.jpg.image_url);
    seen.add(picture.jpg.image_url);
    return !duplicate;
  });
};

export default function CharacterDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const { isCharacterFavorite, toggleFavoriteCharacter } = useFavorites();
  const characterId = typeof id === 'string' ? parseInt(id) : Array.isArray(id) ? parseInt(id[0]) : 0;
  const isFavorite = isCharacterFavorite(characterId);

  const { data: character, isLoading: isLoadingCharacter, isError: isErrorCharacter } = useQuery<CharacterDetails>({
    queryKey: ['characterDetails', characterId],
    queryFn: async () => {
      const response = await axios.get(`https://api.jikan.moe/v4/characters/${characterId}/full`);
      return response.data;
    },
  });

  const { data: pictures, isLoading: isLoadingPictures } = useQuery<CharacterPictures>({
    queryKey: ['characterPictures', characterId],
    queryFn: async () => {
      const response = await axios.get(`https://api.jikan.moe/v4/characters/${characterId}/pictures`);
      return {
        ...response.data,
        data: removeDuplicatePictures(response.data.data)
      };
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const allImages = React.useMemo(() => {
    if (!character || !character.data) return [];
    
    const mainImage = { image_url: character.data.images.jpg.image_url };
    const galleryImages = pictures?.data.map(pic => ({ image_url: pic.jpg.image_url })) || [];
    
    // Check if main image URL exists in gallery images
    const mainImageExists = galleryImages.some(img => img.image_url === mainImage.image_url);
    
    // Only add main image if it's not in gallery
    return mainImageExists ? galleryImages : [mainImage, ...galleryImages];
  }, [character, pictures]);

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      if (!permissionResponse?.granted) {
        const permission = await requestPermission();
        if (!permission.granted) {
          Toast.show({
            type: 'error',
            text1: 'Permission Required',
            text2: 'Please grant permission to save images',
          });
          return;
        }
      }

      setDownloadingIndex(index);

      const filename = imageUrl.split('/').pop() || 'image.jpg';
      const result = await FileSystem.downloadAsync(
        imageUrl,
        FileSystem.documentDirectory + filename
      );

      if (result.status === 200) {
        const asset = await MediaLibrary.createAssetAsync(result.uri);
        await MediaLibrary.createAlbumAsync('Anime Characters', asset, false);
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Image saved to gallery',
        });

        await FileSystem.deleteAsync(result.uri);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save image',
      });
    } finally {
      setDownloadingIndex(null);
    }
  };

  // Заголовок всегда корректный
  const headerTitle = isLoadingCharacter || isErrorCharacter || !character ? 'Character' : character.data.name;

  return (
    <>
      <Stack.Screen
        options={{
          title: headerTitle,
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.text,
          headerRight: !isLoadingCharacter && !isErrorCharacter && character ? () => (
            <TouchableOpacity
              onPress={async () => {
                const success = await toggleFavoriteCharacter(characterId, character?.data ? {
                  mal_id: character.data.mal_id,
                  name: character.data.name,
                  images: {
                    jpg: {
                      image_url: character.data.images.jpg.image_url
                    }
                  }
                } : undefined);
                if (success) {
                  Toast.show({
                    type: 'success',
                    text1: isFavorite ? 'Removed from favorites' : 'Added to favorites',
                  });
                }
              }}
              style={styles.favoriteButton}
            >
              <MaterialCommunityIcons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? COLORS.accent : COLORS.text}
              />
            </TouchableOpacity>
          ) : undefined,
          headerShadowVisible: false,
        }}
      />
      {isLoadingCharacter ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : isErrorCharacter || !character ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load character details</Text>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Image
              source={{ uri: character.data.images.jpg.image_url }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{character.data.name}</Text>
              {character.data.name_kanji && (
                <Text style={styles.nameKanji}>{character.data.name_kanji}</Text>
              )}
            </View>
          </View>

          <View style={styles.adContainer}>
            <BannerAd
              unitId="ca-app-pub-6203993897795010/7237871892"
              size={BannerAdSize.MEDIUM_RECTANGLE}
              onAdLoaded={() => console.log('Character ad loaded')}
              onAdFailedToLoad={(error) => console.error('Character ad failed to load:', error)}
            />
          </View>

          {character.data.nicknames.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nicknames</Text>
              <View style={styles.nicknamesList}>
                {character.data.nicknames.map((nickname, index) => (
                  <View key={index} style={styles.nicknameTag}>
                    <Text style={styles.nicknameText}>{nickname}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorites</Text>
            <Text style={styles.favoritesCount}>{character.data.favorites}</Text>
          </View>

          {character.data.about && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.about}>{character.data.about}</Text>
            </View>
          )}

          {character.data.anime && character.data.anime.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Appears In</Text>
              {character.data.anime.map((appearance, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.animeItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    router.push({
                      pathname: '/anime/[id]',
                      params: { id: appearance.anime.mal_id }
                    });
                  }}
                >
                  <Text style={styles.animeTitle}>{appearance.anime.title}</Text>
                  <Text style={styles.animeRole}>{appearance.role}</Text>
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={20} 
                    color={COLORS.textSecondary}
                    style={styles.animeArrow}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {allImages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <FlatList
                data={allImages}
                numColumns={2}
                renderItem={({ item, index }) => (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.image_url }}
                      style={styles.galleryImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => downloadImage(item.image_url, index)}
                      disabled={downloadingIndex !== null}
                    >
                      {downloadingIndex === index ? (
                        <ActivityIndicator color={COLORS.text} size="small" />
                      ) : (
                        <Ionicons name="download-outline" size={24} color={COLORS.text} />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.galleryContainer}
              />
            </View>
          )}
        </ScrollView>
      )}
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  errorText: {
    color: COLORS.accent,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    padding: 16,
  },
  mainImage: {
    width: 200,
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  nameContainer: {
    alignItems: 'center',
  },
  name: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nameKanji: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  nicknamesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nicknameTag: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  nicknameText: {
    color: COLORS.text,
    fontSize: 14,
  },
  favoritesCount: {
    color: COLORS.text,
    fontSize: 16,
  },
  about: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  animeItem: {
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  animeTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    flex: 1,
  },
  animeRole: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  animeArrow: {
    marginLeft: 'auto',
  },
  galleryContainer: {
    padding: IMAGE_MARGIN / 2,
  },
  imageContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    padding: IMAGE_MARGIN / 2,
    position: 'relative',
    backgroundColor: COLORS.cardBg,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  downloadButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  favoriteButton: {
    marginRight: 16,
  },
  adContainer: {
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
}); 