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

      try {
        // Проверяем кеш
        const cachedUri = await getCachedImage();
        if (cachedUri) {
          if (isMounted) {
            setState(prev => ({
              ...prev,
              isLoading: false,
              fullUri: cachedUri,
              thumbnailUri: cachedUri
            }));
          }
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

        if (isMounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            fullUri: uri,
            thumbnailUri: uri
          }));
        }
      } catch (error) {
        console.error('Error loading image:', error);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Failed to load image',
            fullUri: formattedUrl, // Используем оригинальный URL как запасной вариант
            thumbnailUri: formattedUrl
          }));
        }
      }
    };

    setupCache().then(() => loadAndCacheImage());

    return () => {
      isMounted = false;
    };
  }, [formattedUrl]);

  return {
    ...state,
    preloadImage: async () => {
      if (!formattedUrl) return;
      
      try {
        const cachedUri = await getCachedImage();
        if (!cachedUri) {
          setState(prev => ({ ...prev, isLoading: true }));
          const { uri } = await FileSystem.downloadAsync(
            formattedUrl,
            `${IMAGE_CACHE_DIR}${formattedUrl.split('/').pop()}`
          );
          setState(prev => ({
            ...prev,
            isLoading: false,
            fullUri: uri,
            thumbnailUri: uri
          }));
        }
      } catch (error) {
        console.error('Error preloading image:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to preload image'
        }));
      }
    }
  };
}; 