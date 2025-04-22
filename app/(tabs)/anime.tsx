import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTopAnime } from '../hooks/useAnime';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#1a1a1a',
  secondary: '#2a2a2a',
  accent: '#FF3366',
  text: '#FFFFFF',
  textSecondary: '#888888',
};

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
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.images.jpg.image_url }}
        style={styles.animeImage}
      />
      <View style={styles.animeInfo}>
        <Text style={styles.animeTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.animeScore}>
          <Ionicons name="star" size={16} color={COLORS.accent} style={styles.scoreIcon} />
          <Text style={styles.scoreText}>{item.score}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.errorText}>Error loading anime: {error?.message}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Anime',
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.text,
      }} />
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
  listContainer: {
    padding: 16,
  },
  animeItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    overflow: 'hidden',
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
  animeImage: {
    width: 100,
    height: 150,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  animeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  animeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  animeScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreIcon: {
    marginRight: 4,
  },
  scoreText: {
    fontSize: 14,
    color: COLORS.text,
  },
}); 