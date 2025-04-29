import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Character {
  mal_id: number;
  name: string;
  images: {
    jpg: {
      image_url: string;
    }
  };
}

export const useFavorites = () => {
  const [favoriteArts, setFavoriteArts] = useState<number[]>([]);
  const [favoriteCharacters, setFavoriteCharacters] = useState<number[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const [artsData, charactersData] = await Promise.all([
        AsyncStorage.getItem('favorites'),
        AsyncStorage.getItem('favorite_characters')
      ]);

      setFavoriteArts(artsData ? JSON.parse(artsData) : []);
      setFavoriteCharacters(charactersData ? JSON.parse(charactersData) : []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavoriteArt = async (id: number) => {
    try {
      const newFavorites = favoriteArts.includes(id)
        ? favoriteArts.filter(artId => artId !== id)
        : [...favoriteArts, id];

      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavoriteArts(newFavorites);
      return true;
    } catch (error) {
      console.error('Error toggling favorite art:', error);
      return false;
    }
  };

  const toggleFavoriteCharacter = async (id: number, characterData?: Character) => {
    try {
      const newFavorites = favoriteCharacters.includes(id)
        ? favoriteCharacters.filter(charId => charId !== id)
        : [...favoriteCharacters, id];

      await AsyncStorage.setItem('favorite_characters', JSON.stringify(newFavorites));
      
      // Если персонаж добавляется в избранное и у нас есть его данные, сохраняем их в кэш
      if (!favoriteCharacters.includes(id) && characterData) {
        const cachedCharacters = await AsyncStorage.getItem('cached_characters');
        const existingCache = cachedCharacters ? JSON.parse(cachedCharacters) : [];
        
        // Проверяем, нет ли уже этого персонажа в кэше
        const updatedCache = existingCache.filter((char: Character) => char.mal_id !== id);
        updatedCache.push(characterData);
        
        await AsyncStorage.setItem('cached_characters', JSON.stringify(updatedCache));
      }

      setFavoriteCharacters(newFavorites);
      return true;
    } catch (error) {
      console.error('Error toggling favorite character:', error);
      return false;
    }
  };

  const isArtFavorite = (id: number) => favoriteArts.includes(id);
  const isCharacterFavorite = (id: number) => favoriteCharacters.includes(id);

  return {
    favoriteArts,
    favoriteCharacters,
    toggleFavoriteArt,
    toggleFavoriteCharacter,
    isArtFavorite,
    isCharacterFavorite,
    loadFavorites
  };
}; 