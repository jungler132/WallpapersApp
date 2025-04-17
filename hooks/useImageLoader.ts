import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';

type ImageState = {
  isLoading: boolean;
  thumbnailUri: string | null;
  fullUri: string | null;
  error: string | null;
};

const IMAGE_CACHE_DIR = `${FileSystem.cacheDirectory}image-cache/`;

// Функция для форматирования URL
const formatImageUrl = (url: string): string => {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
};

export const useImageLoader = (originalUrl: string) => {
  const [state, setState] = useState<ImageState>({
    isLoading: true,
    thumbnailUri: null,
    fullUri: null,
    error: null
  });

  // Форматируем URL при инициализации
  const formattedUrl = formatImageUrl(originalUrl);

  const getCachedImage = async () => {
    if (!formattedUrl) return null;

    const filename = formattedUrl.split('/').pop();
    if (!filename) return null;

    const cachedPath = `${IMAGE_CACHE_DIR}${filename}`;
    const fileInfo = await FileSystem.getInfoAsync(cachedPath);

    if (fileInfo.exists) {
      return cachedPath;
    }

    return null;
  };

  const loadAndCacheImage = async () => {
    if (!formattedUrl) {
      setState(prev => ({ ...prev, isLoading: false, error: 'No URL provided' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Проверяем кеш
      const cachedUri = await getCachedImage();
      if (cachedUri) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          fullUri: cachedUri,
          thumbnailUri: cachedUri
        }));
        return;
      }

      // Если нет в кеше, загружаем
      const filename = formattedUrl.split('/').pop();
      if (!filename) throw new Error('Invalid URL');

      const downloadPath = `${IMAGE_CACHE_DIR}${filename}`;
      
      console.log('Downloading image from:', formattedUrl);
      console.log('Saving to:', downloadPath);

      // Загружаем изображение
      const { uri } = await FileSystem.downloadAsync(
        formattedUrl,
        downloadPath
      );

      setState(prev => ({
        ...prev,
        isLoading: false,
        fullUri: uri,
        thumbnailUri: uri
      }));
    } catch (error) {
      console.error('Error loading image:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load image',
        fullUri: formattedUrl,
        thumbnailUri: formattedUrl
      }));
    }
  };

  // Функция для принудительной перезагрузки изображения
  const reloadImage = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Очищаем кеш для этого URL
      const filename = formattedUrl.split('/').pop();
      if (filename) {
        const cachedPath = `${IMAGE_CACHE_DIR}${filename}`;
        await FileSystem.deleteAsync(cachedPath, { idempotent: true });
      }
      // Загружаем заново
      await loadAndCacheImage();
    } catch (error) {
      console.error('Error reloading image:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to reload image'
      }));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const setupCache = async () => {
      try {
        const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(IMAGE_CACHE_DIR, { intermediates: true });
        }
      } catch (error) {
        console.error('Failed to setup cache directory:', error);
      }
    };

    setupCache().then(() => loadAndCacheImage());

    return () => {
      isMounted = false;
    };
  }, [formattedUrl]);

  return {
    ...state,
    reloadImage
  };
}; 