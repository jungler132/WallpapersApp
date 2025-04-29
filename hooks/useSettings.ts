import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export type Settings = {
  maxCacheSize: number; // in bytes
};

const DEFAULT_SETTINGS: Settings = {
  maxCacheSize: 500 * 1024 * 1024, // 500MB by default
};

const SETTINGS_KEY = '@app_settings';
const IMAGE_CACHE_DIR = `${FileSystem.cacheDirectory}image-cache/`;

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on initialization
  useEffect(() => {
    loadSettings();
    calculateCacheSize();
  }, []);

  // Load settings from AsyncStorage
  const loadSettings = async () => {
    try {
      console.log('Loading settings from AsyncStorage...');
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      console.log('Saved settings:', savedSettings);
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Parsed settings:', parsedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save settings
  const saveSettings = async (newSettings: Partial<Settings>) => {
    try {
      console.log('Saving new settings:', newSettings);
      const updatedSettings = { ...settings, ...newSettings };
      console.log('Updated settings:', updatedSettings);
      
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      
      // Check that settings are actually saved
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      console.log('Verified saved settings:', savedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Подсчет размера кеша
  const calculateCacheSize = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
      if (dirInfo.exists && 'size' in dirInfo) {
        setCacheSize(dirInfo.size || 0);
      }
    } catch (error) {
      console.error('Error calculating cache size:', error);
    }
  };

  // Очистка кеша
  const clearCache = async () => {
    try {
      await FileSystem.deleteAsync(IMAGE_CACHE_DIR, { idempotent: true });
      await FileSystem.makeDirectoryAsync(IMAGE_CACHE_DIR, { intermediates: true });
      setCacheSize(0);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  // Форматирование размера в читаемый вид
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return {
    settings,
    isLoading,
    cacheSize,
    formattedCacheSize: formatSize(cacheSize),
    updateSettings: saveSettings,
    clearCache,
    calculateCacheSize,
    reloadSettings: loadSettings
  };
}; 