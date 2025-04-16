import React from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { ImageData } from '../utils/api';
import { useRouter } from 'expo-router';
import { useSettings } from '../../hooks/useSettings';

const { width } = Dimensions.get('window');

interface AnimeImageProps {
  image: ImageData;
}

export const AnimeImage: React.FC<AnimeImageProps> = ({ image }) => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { settings } = useSettings();

  // Вычисляем размер изображения на основе количества колонок
  const gap = 8; // Отступ между изображениями
  const padding = 8; // Отступ по краям экрана
  const totalGapsWidth = (settings.gridColumns - 1) * gap; // Общая ширина отступов между колонками
  const totalPadding = padding * 2; // Общая ширина отступов по краям
  const availableWidth = width - totalPadding - totalGapsWidth; // Доступная ширина для изображений
  const imageSize = Math.floor(availableWidth / settings.gridColumns); // Размер одного изображения

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
      <View style={[styles.container, { width: imageSize, height: imageSize }]}>
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { width: imageSize, height: imageSize }]}
          onLoadStart={() => {
            setLoading(true);
            setError(null);
          }}
          onLoadEnd={() => {
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
    margin: 4,
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