import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';

const COLORS = {
  primary: '#1a1a1a',
  secondary: '#2a2a2a',
  accent: '#FF3366',
  text: '#FFFFFF',
  textSecondary: '#888888',
};

interface AnimeDetails {
  title: string;
  title_japanese: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  synopsis: string;
  score: number;
  episodes: number;
  status: string;
  aired: {
    string: string;
  };
  genres: Array<{
    name: string;
  }>;
}

const AnimeDetailsScreen = ({ route }: any) => {
  const { animeId } = route.params;
  const [animeDetails, setAnimeDetails] = useState<AnimeDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnimeDetails();
  }, [animeId]);

  const fetchAnimeDetails = async () => {
    try {
      const response = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}/full`);
      setAnimeDetails(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching anime details:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!animeDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>Error loading anime details</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: animeDetails.images.jpg.large_image_url }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{animeDetails.title}</Text>
        <Text style={styles.title}>{animeDetails.title_japanese}</Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Score: {animeDetails.score}</Text>
          <Text style={styles.infoText}>Episodes: {animeDetails.episodes}</Text>
          <Text style={styles.infoText}>Status: {animeDetails.status}</Text>
          <Text style={styles.infoText}>Aired: {animeDetails.aired.string}</Text>
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
  );
};

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
  content: {
    padding: 15,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.text,
  },
  synopsisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.text,
  },
  synopsis: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    color: COLORS.textSecondary,
  },
  infoContainer: {
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: COLORS.text,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  genre: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  genreText: {
    color: COLORS.text,
    fontSize: 14,
  },
});

export default AnimeDetailsScreen; 