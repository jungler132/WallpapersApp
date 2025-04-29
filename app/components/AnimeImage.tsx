import React from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ImageData } from '../utils/api';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface AnimeImageProps {
  image: ImageData;
}

export const AnimeImage: React.FC<AnimeImageProps> = ({ image }) => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Вычисляем размер изображения для одного столбца
  const gap = 16; // Отступ между изображениями
  const padding = 16; // Отступ по краям экрана
  const totalPadding = padding * 2; // Общая ширина отступов по краям
  const imageWidth = width - totalPadding; // Ширина изображения на весь экран минус отступы
  const imageHeight = imageWidth * 1.5; // Высота в 1.5 раза больше ширины

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
      <View style={[styles.container, { width: imageWidth }]}>
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { width: imageWidth, height: imageHeight }]}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
          recyclingKey={image._id.toString()}
          onLoadStart={() => {
            setLoading(true);
            setError(null);
          }}
          onLoad={() => {
            setLoading(false);
          }}
          onError={(error) => {
            console.error('[AnimeImage] Error loading image:', error);
            setError('Failed to load image');
            setLoading(false);
          }}
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
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  image: {
    flex: 1,
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