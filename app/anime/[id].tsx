import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useAnimeDetails } from '../hooks/useAnime';

export default function AnimeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { data: animeDetails, isLoading, isError, error } = useAnimeDetails(id);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
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
        <Text>No anime details found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: animeDetails.title,
          headerBackTitle: 'Back'
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
            <Text style={styles.infoText}>Score: {animeDetails.score}</Text>
            <Text style={styles.infoText}>Episodes: {animeDetails.episodes}</Text>
            <Text style={styles.infoText}>Status: {animeDetails.status}</Text>
            <Text style={styles.infoText}>Aired: {animeDetails.aired.string}</Text>
          </View>

          <View style={styles.genresContainer}>
            {animeDetails.genres.map((genre, index) => (
              <Text key={index} style={styles.genre}>
                {genre.name}
              </Text>
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  animeImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  japaneseTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  infoContainer: {
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  genre: {
    backgroundColor: '#f0f0f0',
    padding: 5,
    margin: 3,
    borderRadius: 5,
  },
  synopsisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  synopsis: {
    fontSize: 16,
    lineHeight: 24,
  },
}); 