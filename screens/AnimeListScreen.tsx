import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';

const COLORS = {
  primary: '#1a1a1a',
  secondary: '#2a2a2a',
  accent: '#FF3366',
  text: '#FFFFFF',
  textSecondary: '#888888',
};

interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  score: number;
}

const AnimeListScreen = ({ navigation }: any) => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnimeList();
  }, []);

  const fetchAnimeList = async () => {
    try {
      const response = await axios.get('https://api.jikan.moe/v4/top/anime');
      setAnimeList(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching anime:', error);
      setLoading(false);
    }
  };

  const renderAnimeItem = ({ item }: { item: Anime }) => (
    <TouchableOpacity
      style={styles.animeItem}
      onPress={() => navigation.navigate('AnimeDetails', { animeId: item.mal_id })}
    >
      <Image
        source={{ uri: item.images.jpg.image_url }}
        style={styles.animeImage}
      />
      <View style={styles.animeInfo}>
        <Text style={styles.animeTitle}>{item.title}</Text>
        <Text style={styles.animeScore}>Score: {item.score}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={animeList}
        renderItem={renderAnimeItem}
        keyExtractor={(item) => item.mal_id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
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
  listContainer: {
    padding: 10,
  },
  animeItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  animeImage: {
    width: 100,
    height: 150,
  },
  animeInfo: {
    flex: 1,
    padding: 10,
  },
  animeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: COLORS.text,
  },
  animeScore: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default AnimeListScreen; 