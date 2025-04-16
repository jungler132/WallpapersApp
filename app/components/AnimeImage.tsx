import React from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { ImageData } from '../utils/api';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width - 32; // Отступы по 16 с каждой стороны

interface AnimeImageProps {
  image: ImageData;
}

export const AnimeImage: React.FC<AnimeImageProps> = ({ image }) => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Добавляем протокол к URL
  const imageUrl = image.file_url.startsWith('http') 
    ? image.file_url 
    : `https://${image.file_url}`;

  const handlePress = () => {
    router.push({
      pathname: `/image/${image._id}` as any,
      params: {
        ...image,
        tags: JSON.stringify(image.tags),
        _id: image._id.toString(),
        has_children: image.has_children.toString(),
        file_size: image.file_size.toString(),
        width: image.width.toString(),
        height: image.height.toString()
      } as any
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.container}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          onLoadStart={() => {
            console.log('Image load started');
            setLoading(true);
            setError(null);
          }}
          onLoadEnd={() => {
            console.log('Image load ended');
            setLoading(false);
          }}
          onError={(e) => {
            console.error('Image load error:', e.nativeEvent.error);
            setError('Failed to load image');
            setLoading(false);
          }}
          resizeMode="cover"
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF3366" />
          </View>
        )}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  errorText: {
    color: '#FF3366',
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
  },
}); 