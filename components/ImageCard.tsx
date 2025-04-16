import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ImageData } from '../utils/api';
import { useImageLoader } from '../hooks/useImageLoader';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface ImageCardProps {
  image: ImageData;
}

export default function ImageCard({ image }: ImageCardProps) {
  const router = useRouter();
  const { isLoading, thumbnailUri, fullUri, error } = useImageLoader(image.file_url);

  const handlePress = () => {
    router.push({
      pathname: '/image/[id]',
      params: { 
        id: image._id,
        file_url: fullUri || image.file_url,
        cached_uri: fullUri || '',
        tags: JSON.stringify(image.tags),
        _id: image._id.toString(),
        has_children: image.has_children.toString(),
        file_size: image.file_size.toString(),
        width: image.width.toString(),
        height: image.height.toString()
      }
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF3366" />
          </View>
        ) : (
          <Image
            source={{ uri: thumbnailUri || image.file_url }}
            style={styles.image}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
            placeholder={require('../../assets/placeholder/image-placeholder.png')}
            recyclingKey={image._id.toString()}
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 