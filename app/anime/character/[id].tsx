import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, FlatList, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

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

export default function CharacterDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  const { data: character, isLoading: isLoadingCharacter, isError: isErrorCharacter } = useQuery<CharacterDetails>({
    queryKey: ['characterDetails', id],
    queryFn: async () => {
      const response = await axios.get(`https://api.jikan.moe/v4/characters/${id}/full`);
      return response.data;
    },
  });

  const { data: pictures, isLoading: isLoadingPictures } = useQuery<CharacterPictures>({
    queryKey: ['characterPictures', id],
    queryFn: async () => {
      const response = await axios.get(`https://api.jikan.moe/v4/characters/${id}/pictures`);
      return response.data;
    },
    enabled: !!id,
  });

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

  if (isLoadingCharacter) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (isErrorCharacter || !character) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load character details</Text>
      </View>
    );
  }

  const allImages = [
    { image_url: character.data.images.jpg.image_url },
    ...(pictures?.data.map(pic => ({ image_url: pic.jpg.image_url })) || [])
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: character.data.name,
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.text,
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{ uri: character.data.images.jpg.image_url }}
            style={styles.characterImage}
            resizeMode="cover"
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{character.data.name}</Text>
            {character.data.name_kanji && (
              <Text style={styles.nameKanji}>{character.data.name_kanji}</Text>
            )}
          </View>
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
          <Text style={styles.favoritesText}>{character.data.favorites.toLocaleString()}</Text>
        </View>

        {character.data.about && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>{character.data.about}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gallery</Text>
          {isLoadingPictures ? (
            <ActivityIndicator size="small" color={COLORS.accent} />
          ) : (
            <FlatList
              data={allImages}
              numColumns={IMAGES_PER_ROW}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <View style={styles.imageWrapper}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.image_url }}
                      style={styles.galleryImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => downloadImage(item.image_url, index)}
                      disabled={downloadingIndex === index}
                    >
                      {downloadingIndex === index ? (
                        <ActivityIndicator size="small" color={COLORS.text} />
                      ) : (
                        <Ionicons name="download-outline" size={20} color={COLORS.text} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.galleryContainer}
            />
          )}
        </View>
      </ScrollView>
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
  characterImage: {
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
  favoritesText: {
    color: COLORS.text,
    fontSize: 16,
  },
  aboutText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  galleryContainer: {
    padding: IMAGE_MARGIN / 2,
  },
  imageWrapper: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    padding: IMAGE_MARGIN / 2,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
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
}); 