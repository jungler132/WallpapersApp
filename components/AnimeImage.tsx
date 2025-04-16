import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { ImageData } from '../utils/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface AnimeImageProps {
  image: ImageData;
}

export default function AnimeImage({ image }: AnimeImageProps) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: image.file_url }}
        style={styles.image}
        contentFit="cover"
        transition={1000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    marginVertical: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
}); 