import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Text, ScrollView, Linking, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { ImageData } from '../../utils/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageView from 'react-native-image-viewing';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FavoriteButton from '../../components/FavoriteButton';
import { useImageLoader } from '../../hooks/useImageLoader';

const { width, height } = Dimensions.get('window');

export default function ImageDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const params = useLocalSearchParams<{
    id: string;
    file_url: string;
    cached_uri: string;
    file_size: string;
    tags: string;
    md5: string;
    width: string;
    height: string;
    source: string;
    author: string;
    has_children: string;
    _id: string;
  }>();
  const [imageKey, setImageKey] = useState(0);

  // Создаем объект с данными изображения
  const image: Partial<ImageData> = {
    _id: parseInt(params._id),
    file_url: params.file_url,
    file_size: parseInt(params.file_size),
    tags: JSON.parse(params.tags || '[]'),
    md5: params.md5,
    width: parseInt(params.width),
    height: parseInt(params.height),
    source: params.source,
    author: params.author,
    has_children: params.has_children === 'true'
  };

  // Добавляем протокол к URL изображения
  const imageUrl = image.file_url?.startsWith('http') 
    ? image.file_url 
    : `https://${image.file_url}`;

  const { isLoading: imageLoading, fullUri, reloadImage } = useImageLoader(imageUrl);

  useEffect(() => {
    checkFavoriteStatus();
  }, [image._id]);

  const checkFavoriteStatus = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      const favoritesArray = favorites ? JSON.parse(favorites) : [];
      setIsFavorite(favoritesArray.includes(image._id));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteToggle = async (newIsFavorite: boolean) => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      let favoritesArray = favorites ? JSON.parse(favorites) : [];
      
      if (newIsFavorite) {
        if (!favoritesArray.includes(image._id)) {
          favoritesArray.push(image._id);
        }
      } else {
        favoritesArray = favoritesArray.filter((id: number) => id !== image._id);
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
      setIsFavorite(newIsFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Запрашиваем разрешение на доступ к медиатеке
      if (!permissionResponse?.granted) {
        const newPermission = await requestPermission();
        if (!newPermission.granted) {
          throw new Error('Permission not granted');
        }
      }

      const documentDir = FileSystem.documentDirectory;
      if (!documentDir) {
        throw new Error('Document directory not available');
      }

      // Создаем имя файла с ID
      const fileName = `wp_${image._id}.jpg`;
      const fileUri = `${documentDir}${fileName}`;

      // Проверяем и создаем директорию, если она не существует
      const dirInfo = await FileSystem.getInfoAsync(documentDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(documentDir, { intermediates: true });
      }

      // Скачиваем изображение
      const downloadResult = await FileSystem.downloadAsync(
        imageUrl,
        fileUri
      );

      if (downloadResult.status !== 200) {
        throw new Error('Failed to download image');
      }

      // Сохраняем в галерею
      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);

      // Удаляем временный файл
      await FileSystem.deleteAsync(fileUri, { idempotent: true });

      // Показываем уведомление об успешном сохранении
      Toast.show({
        type: 'success',
        text1: 'Saved ❤️',
        position: 'bottom',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsLoading(true);
      
      // Создаем имя файла с ID
      const fileName = `wp_${image._id}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      // Убеждаемся, что используем правильный URL с http/https
      let sourceUri = imageUrl;
      if (params.cached_uri?.startsWith('file://')) {
        // Если у нас есть кешированный файл, копируем его
        await FileSystem.copyAsync({
          from: params.cached_uri,
          to: fileUri
        });
      } else if (fullUri?.startsWith('file://')) {
        // Если есть полный URI в кеше, копируем его
        await FileSystem.copyAsync({
          from: fullUri,
          to: fileUri
        });
      } else {
        // Иначе скачиваем с сервера
        const downloadResult = await FileSystem.downloadAsync(
          sourceUri,
          fileUri
        );

        if (downloadResult.status !== 200) {
          throw new Error('Failed to download image for sharing');
        }
      }

      // Делимся файлом
      await Sharing.shareAsync(fileUri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share Image'
      });

      // Очищаем временный файл
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (error) {
      console.error('Error sharing image:', error);
      Alert.alert('Error', 'Failed to share image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorPress = () => {
    if (image.source) {
      Linking.openURL(image.source);
    }
  };

  const handleSourcePress = () => {
    if (image.source) {
      Linking.openURL(image.source);
    }
  };

  const getDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.startsWith('www.') ? domain.substring(4) : domain;
    } catch {
      return url;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleFullScreenPress = () => {
    setIsImageViewVisible(true);
  };

  const handleRefresh = async () => {
    try {
      // Очищаем кеш для этого изображения
      if (fullUri) {
        await FileSystem.deleteAsync(fullUri, { idempotent: true });
      }
      if (params.cached_uri) {
        await FileSystem.deleteAsync(params.cached_uri, { idempotent: true });
      }
      
      // Обновляем ключ для принудительной перерисовки
      setImageKey(prev => prev + 1);
      
      // Перезагружаем изображение
      if (reloadImage) {
        await reloadImage();
      }

      Toast.show({
        type: 'success',
        text1: 'Refreshing image...',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error refreshing image:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to refresh image',
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { marginTop: insets.top }]}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.actions}>
          <FavoriteButton 
            imageId={image._id || 0}
            isFavorite={isFavorite}
            onToggle={handleFavoriteToggle}
          />
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleRefresh}
            disabled={isLoading}
          >
            <Ionicons name="refresh" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleSave}
            disabled={isLoading}
          >
            <Ionicons name="download" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleShare}
            disabled={isLoading}
          >
            <Ionicons name="share" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={handleFullScreenPress}
        >
          <Image
            source={{ uri: params.cached_uri || fullUri || params.file_url }}
            style={styles.image}
            contentFit="contain"
            transition={300}
            cachePolicy="memory-disk"
            placeholder={require('../../assets/placeholder/image-placeholder.png')}
            recyclingKey={`${image._id?.toString()}-${imageKey}`}
          />
          {imageLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#FF3366" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Size:</Text>
            <Text style={styles.detailValue}>{image.width}x{image.height}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>File Size:</Text>
            <Text style={styles.detailValue}>{formatFileSize(image.file_size || 0)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Author:</Text>
            <TouchableOpacity 
              style={styles.authorButton}
              onPress={handleAuthorPress}
            >
              <Text style={styles.authorText} numberOfLines={1}>{image.author}</Text>
              <Ionicons name="open-outline" size={16} color="#FF3366" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Source:</Text>
            <TouchableOpacity 
              style={styles.authorButton}
              onPress={handleSourcePress}
            >
              <Text style={styles.authorText} numberOfLines={1}>
                {image.source ? getDomainFromUrl(image.source) : ''}
              </Text>
              <Ionicons name="open-outline" size={16} color="#FF3366" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>MD5:</Text>
            <Text style={styles.detailValue}>{image.md5}</Text>
          </View>

          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>Tags:</Text>
            <View style={styles.tagsList}>
              {image.tags?.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <ImageView
        images={[{ uri: params.cached_uri || fullUri || params.file_url }]}
        imageIndex={0}
        visible={isImageViewVisible}
        onRequestClose={() => setIsImageViewVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  closeButton: {
    padding: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: height * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  details: {
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#888888',
    fontSize: 16,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  authorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginLeft: 16,
  },
  authorText: {
    color: '#FF3366',
    fontSize: 16,
    textAlign: 'right',
  },
  sourceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginLeft: 16,
  },
  sourceText: {
    color: '#FF3366',
    fontSize: 16,
    textAlign: 'right',
  },
  tagsContainer: {
    marginTop: 8,
  },
  tagsLabel: {
    color: '#888888',
    fontSize: 16,
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 