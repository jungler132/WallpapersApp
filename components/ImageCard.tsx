import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ImageData } from '../utils/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface ImageCardProps {
  image: ImageData;
}

export default function ImageCard({ image }: ImageCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/image/[id]',
      params: { 
        id: image._id,
        file_url: image.file_url.startsWith('http') ? image.file_url : `https://${image.file_url}`,
        tags: JSON.stringify(image.tags)
      }
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container}>
        <Image
          source={{ uri: image.file_url.startsWith('http') ? image.file_url : `https://${image.file_url}` }}
          style={styles.image}
          contentFit="cover"
          transition={1000}
          cachePolicy="memory-disk"
          placeholder={require('../../assets/placeholder/image-placeholder.png')}
          recyclingKey={image._id.toString()}
        />
      </View>
    </TouchableOpacity>
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