import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

// Types for different image sizes
export type ImageSizes = {
  thumbnail: string;  // For feed
  full: string;      // Original for detailed view
};

// Cache for storing processed images
const imageCache: { [key: string]: ImageSizes } = {};

export const processAndCacheImage = async (originalUrl: string): Promise<ImageSizes> => {
  // Check cache
  if (imageCache[originalUrl]) {
    return imageCache[originalUrl];
  }

  try {
    // Create a reduced version for preview
    const thumbnailResult = await ImageManipulator.manipulateAsync(
      originalUrl,
      [{ resize: { width: 300 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Save in cache
    imageCache[originalUrl] = {
      thumbnail: thumbnailResult.uri,
      full: originalUrl
    };

    return imageCache[originalUrl];
  } catch (error) {
    console.error('Error processing image:', error);
    // In case of error, return original URLs
    return {
      thumbnail: originalUrl,
      full: originalUrl
    };
  }
};

// Function for preloading the original image
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

// Clear cache
export const clearImageCache = () => {
  Object.keys(imageCache).forEach(key => {
    delete imageCache[key];
  });
}; 