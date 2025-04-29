import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../hooks/useFavorites';
import { ImageData } from '../utils/api';

interface FavoriteButtonProps {
  imageId: number;
  isFavorite: boolean;
  onToggle: (isFavorite: boolean) => void;
  imageData?: ImageData;
}

export default function FavoriteButton({ imageId, isFavorite, onToggle, imageData }: FavoriteButtonProps) {
  const { toggleFavoriteArt } = useFavorites();

  const handlePress = async () => {
    try {
      const newIsFavorite = !isFavorite;
      const success = await toggleFavoriteArt(imageId, newIsFavorite ? imageData : undefined);
      if (success) {
        onToggle(newIsFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button}>
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={24}
        color={isFavorite ? '#FF3366' : '#FFFFFF'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
}); 