import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteButtonProps {
  imageId: number;
  isFavorite: boolean;
  onToggle: (isFavorite: boolean) => void;
}

export default function FavoriteButton({ imageId, isFavorite, onToggle }: FavoriteButtonProps) {
  const handlePress = async () => {
    try {
      const newIsFavorite = !isFavorite;
      const favorites = await AsyncStorage.getItem('favorites');
      let favoritesArray = favorites ? JSON.parse(favorites) : [];

      if (newIsFavorite) {
        if (!favoritesArray.includes(imageId)) {
          favoritesArray.push(imageId);
        }
      } else {
        favoritesArray = favoritesArray.filter((id: number) => id !== imageId);
      }

      await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
      onToggle(newIsFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={handlePress}
    >
      <Ionicons 
        name={isFavorite ? "heart" : "heart-outline"} 
        size={24} 
        color={isFavorite ? "#FF3366" : "#FFFFFF"} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
}); 