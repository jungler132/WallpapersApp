import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

// Типы для разных размеров изображений
export type ImageSizes = {
  thumbnail: string;  // Для фида
  full: string;      // Оригинал для детального просмотра
};

// Кеш для хранения обработанных изображений
const imageCache: { [key: string]: ImageSizes } = {};

export const processAndCacheImage = async (originalUrl: string): Promise<ImageSizes> => {
  // Проверяем кеш
  if (imageCache[originalUrl]) {
    return imageCache[originalUrl];
  }

  try {
    // Создаем уменьшенную версию для превью
    const thumbnailResult = await ImageManipulator.manipulateAsync(
      originalUrl,
      [{ resize: { width: 300 } }],
      { compress: 0.7, format: 'jpeg' }
    );

    // Сохраняем в кеше
    imageCache[originalUrl] = {
      thumbnail: thumbnailResult.uri,
      full: originalUrl
    };

    return imageCache[originalUrl];
  } catch (error) {
    console.error('Error processing image:', error);
    // В случае ошибки возвращаем оригинальные URL
    return {
      thumbnail: originalUrl,
      full: originalUrl
    };
  }
};

// Функция для предварительной загрузки оригинального изображения
export const prefetchFullImage = async (url: string): Promise<void> => {
  try {
    await FileSystem.downloadAsync(
      url,
      `${FileSystem.cacheDirectory}${url.split('/').pop()}`
    );
  } catch (error) {
    console.error('Error prefetching image:', error);
  }
};

// Очистка кеша
export const clearImageCache = () => {
  Object.keys(imageCache).forEach(key => {
    delete imageCache[key];
  });
}; 