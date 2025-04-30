import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useAnimeDetails, useAnimeCharacters } from '../hooks/useAnime';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { AnimeCharactersPreview } from '../components/AnimeCharactersPreview';

const COLORS = {
  primary: '#121212',
  secondary: '#1E1E1E',
  accent: '#FF4081',
  text: '#FFFFFF',
  textSecondary: '#9E9E9E',
  border: '#2C2C2C',
  cardBg: '#1A1A1A',
};

interface Genre {
  name: string;
  mal_id: number;
}

export default function AnimeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { data: anime, isLoading: isLoadingAnime, isError: isAnimeError } = useAnimeDetails(Number(id));
  const { data: charactersData, isLoading: isLoadingCharacters } = useAnimeCharacters(Number(id));

  if (isLoadingAnime || isLoadingCharacters) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (isAnimeError || !anime) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load anime details</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: anime.title,
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{ uri: anime.images.jpg.large_image_url }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          {anime.trailer?.youtube_id && (
            <TouchableOpacity
              style={styles.youtubeButton}
              onPress={() => WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${anime.trailer.youtube_id}`)}
            >
              <Image 
                source={require('../../assets/images/youtube-logo.png')} 
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          <View style={styles.overlay}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{anime.title}</Text>
              {anime.title_japanese && (
                <Text style={styles.japaneseTitle}>{anime.title_japanese}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={20} color={COLORS.accent} />
              <Text style={styles.statValue}>{anime.score || 'N/A'}</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={20} color={COLORS.accent} />
              <Text style={styles.statValue}>{anime.members?.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={20} color={COLORS.accent} />
              <Text style={styles.statValue}>{anime.favorites?.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{anime.type}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Episodes</Text>
              <Text style={styles.infoValue}>{anime.episodes || 'Unknown'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{anime.status}</Text>
            </View>
            {anime.studios && anime.studios.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Studio</Text>
                <Text style={styles.infoValue}>{anime.studios[0].name}</Text>
              </View>
            )}
          </View>

          {charactersData?.data && charactersData.data.length > 0 && (
            <View style={styles.charactersSection}>
              <AnimeCharactersPreview
                characters={charactersData.data}
                animeId={anime.mal_id}
              />
            </View>
          )}

          {anime.genres && anime.genres.length > 0 && (
            <View style={styles.genresContainer}>
              <Text style={styles.sectionTitle}>Genres</Text>
              <View style={styles.genresList}>
                {anime.genres.map((genre: Genre, index: number) => (
                  <View key={index} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {anime.synopsis && (
            <View style={styles.synopsisContainer}>
              <Text style={styles.sectionTitle}>Synopsis</Text>
              <Text style={styles.synopsis}>{anime.synopsis}</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    height: 300,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  titleContainer: {
    marginBottom: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  japaneseTitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  infoSection: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  genresContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: {
    color: COLORS.text,
    fontSize: 14,
  },
  synopsisContainer: {
    marginBottom: 24,
  },
  synopsis: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  youtubeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  charactersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  charactersButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  charactersSection: {
    marginBottom: 24,
  },
}); 