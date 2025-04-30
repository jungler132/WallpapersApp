import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Константы для расчета размеров
const CONTAINER_PADDING = 16;
const CONTENT_WIDTH = SCREEN_WIDTH - (CONTAINER_PADDING * 2);
const CARD_WIDTH = CONTENT_WIDTH * 0.28; // Уменьшаем с 30% до 28%
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface Character {
  character: {
    mal_id: number;
    name: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  };
  role: string;
}

interface AnimeCharactersPreviewProps {
  characters: Character[];
  animeId: number;
}

export const AnimeCharactersPreview = ({ characters, animeId }: AnimeCharactersPreviewProps) => {
  const displayCharacters = characters.slice(0, 3);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Characters</Text>
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => router.push(`/anime/characters/${animeId}`)}
        >
          <Text style={styles.viewMoreText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#FF4081" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {displayCharacters.map((char) => (
          <View key={char.character.mal_id} style={styles.cardWrapper}>
            <TouchableOpacity
              style={styles.characterCard}
              onPress={() => router.push(`/anime/character/${char.character.mal_id}`)}
            >
              <Image
                source={{ uri: char.character.images.jpg.image_url }}
                style={styles.characterImage}
                resizeMode="cover"
              />
              <View style={styles.characterInfo}>
                <Text style={styles.characterName} numberOfLines={1}>
                  {char.character.name}
                </Text>
                <Text style={styles.characterRole} numberOfLines={1}>
                  {char.role}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: CONTAINER_PADDING,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 64, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewMoreText: {
    color: '#FF4081',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  characterCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  characterImage: {
    width: '100%',
    height: CARD_HEIGHT,
  },
  characterInfo: {
    padding: 8,
  },
  characterName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  characterRole: {
    color: '#9E9E9E',
    fontSize: 11,
  },
}); 