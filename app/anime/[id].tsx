import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useAnimeDetails } from '../hooks/useAnime';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#1a1a1a',
  secondary: '#2a2a2a',
  accent: '#FF3366',
  text: '#FFFFFF',
  textSecondary: '#888888',
};

export default function AnimeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { data: animeDetails, isLoading, isError, error } = useAnimeDetails(id);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading anime details: {error?.message}</Text>
      </View>
    );
  }

  if (!animeDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No anime details found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: animeDetails.title,
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.text,
        }} 
      />
      <ScrollView style={styles.container}>
        <Image
          source={{ uri: animeDetails.images.jpg.large_image_url }}
          style={styles.animeImage}
        />
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{animeDetails.title}</Text>
          <Text style={styles.japaneseTitle}>{animeDetails.title_japanese}</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="star" size={20} style={styles.infoIcon} />
              <Text style={styles.infoText}>Score: {animeDetails.score}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="film" size={20} style={styles.infoIcon} />
              <Text style={styles.infoText}>Episodes: {animeDetails.episodes}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} style={styles.infoIcon} />
              <Text style={styles.infoText}>Status: {animeDetails.status}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} style={styles.infoIcon} />
              <Text style={styles.infoText}>Aired: {animeDetails.aired.string}</Text>
            </View>
          </View>

          <View style={styles.genresContainer}>
            {animeDetails.genres.map((genre, index) => (
              <View key={index} style={styles.genre}>
                <Text style={styles.genreText}>{genre.name}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.synopsisTitle}>Synopsis</Text>
          <Text style={styles.synopsis}>{animeDetails.synopsis}</Text>
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
    padding: 20,
    backgroundColor: COLORS.primary,
  },
  errorText: {
    color: COLORS.accent,
    textAlign: 'center',
  },
  animeImage: {
    width: '100%',
    height: 300,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
  },
  japaneseTitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  infoContainer: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
    color: COLORS.accent,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  genre: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  genreText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  synopsisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.text,
  },
  synopsis: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
}); 