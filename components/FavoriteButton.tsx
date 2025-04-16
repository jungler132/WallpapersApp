import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FavoriteButtonProps {
  imageId: number;
  isFavorite: boolean;
  onToggle: (isFavorite: boolean) => void;
}

export default function FavoriteButton({ imageId, isFavorite, onToggle }: FavoriteButtonProps) {
  const handlePress = () => {
    onToggle(!isFavorite);
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