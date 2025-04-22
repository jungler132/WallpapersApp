import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ImageData } from '../utils/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface AnimeImageProps {
  image: ImageData;
}

export default function AnimeImage({ image }: AnimeImageProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/image/[id]',
      params: {
        id: image._id.toString(),
        ...image,
        tags: JSON.stringify(image.tags),
        _id: image._id.toString(),
        has_children: image.has_children.toString(),
        width: image.width.toString(),
        height: image.height.toString()
      }
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.container}>
        <Image
          source={{ uri: image.file_url }}
          style={styles.image}
          contentFit="cover"
          transition={1000}
          cachePolicy="memory-disk"
          placeholder={require('../assets/placeholder/image-placeholder.png')}
          recyclingKey={image._id.toString()}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  image: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
}); 