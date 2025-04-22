import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTopAnime } from '../hooks/useAnime';

export default function AnimeScreen() {
  const { data: animeList, isLoading, isError, error } = useTopAnime();

  const renderAnimeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.animeItem}
      onPress={() => {
        router.push({
          pathname: '/anime/[id]',
          params: { id: item.mal_id }
        });
      }}
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
        <Text style={styles.errorText}>Error loading anime: {error?.message}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Anime' }} />
      <View style={styles.container}>
        <FlatList
          data={animeList}
          renderItem={renderAnimeItem}
          keyExtractor={(item) => item.mal_id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      </View>
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
  listContainer: {
    padding: 10,
  },
  animeItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
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
  },
  animeScore: {
    fontSize: 14,
    color: '#666',
  },
}); 