import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { useAnimeCharacters } from '../../hooks/useAnime';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#121212',
  secondary: '#1E1E1E',
  accent: '#FF4081',
  text: '#FFFFFF',
  textSecondary: '#9E9E9E',
  border: '#2C2C2C',
  cardBg: '#1A1A1A',
  inputBg: '#2A2A2A',
};

export default function CharactersScreen() {
  const { id } = useLocalSearchParams();
  const { data: charactersData, isLoading, isError } = useAnimeCharacters(Number(id));
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCharacters = useMemo(() => {
    if (!charactersData?.data) return [];
    return charactersData.data.filter(item => 
      item.character.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [charactersData?.data, searchQuery]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (isError || !charactersData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load characters</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Characters',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.text,
        }}
      />
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search characters..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredCharacters}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.characterCard}
            onPress={() => router.push(`/anime/character/${item.character.mal_id}`)}
          >
            <Image
              source={{ uri: item.character.images.jpg.image_url }}
              style={styles.characterImage}
            />
            <View style={styles.characterInfo}>
              <Text style={styles.characterName}>{item.character.name}</Text>
              <Text style={styles.roleText}>{item.role}</Text>
              {item.voice_actors.length > 0 && (
                <View style={styles.voiceActorInfo}>
                  <Text style={styles.voiceActorLabel}>Voice Actor:</Text>
                  <Text style={styles.voiceActorText}>
                    {item.voice_actors[0].person.name} ({item.voice_actors[0].language})
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        )}
        keyExtractor={(item) => item.character.mal_id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    margin: 16,
    padding: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    padding: 0,
  },
  list: {
    padding: 16,
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
  characterCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  characterImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  characterInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  characterName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleText: {
    color: COLORS.accent,
    fontSize: 14,
    marginBottom: 8,
  },
  voiceActorInfo: {
    marginTop: 4,
  },
  voiceActorLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  voiceActorText: {
    color: COLORS.text,
    fontSize: 14,
  },
}); 