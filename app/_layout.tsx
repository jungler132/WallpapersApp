import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Platform, LogBox, NativeModules } from 'react-native';

// Определяем типы для ErrorUtils
declare const global: {
  ErrorUtils: {
    getGlobalHandler: () => (error: Error, isFatal: boolean) => void;
    setGlobalHandler: (callback: (error: Error, isFatal: boolean) => void) => void;
  }
} & typeof globalThis;

// Глобальный обработчик ошибок
if (!__DEV__) {
  const originalHandler = global.ErrorUtils.getGlobalHandler();
  
  global.ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean) => {
    console.error('[CRITICAL ERROR]', {
      error: error.message,
      stack: error.stack,
      isFatal,
      platform: Platform.OS,
      version: Platform.Version,
      deviceInfo: {
        brand: Platform.OS === 'android' ? NativeModules.PlatformConstants?.Brand || 'unknown' : 'Apple',
        model: Platform.OS === 'android' 
          ? NativeModules.PlatformConstants?.Model || 'unknown'
          : NativeModules.PlatformConstants?.systemName || 'unknown'
      }
    });
    
    originalHandler(error, isFatal);
  });

  // Отключаем желтые предупреждения в релизе
  LogBox.ignoreAllLogs();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Данные считаются свежими 5 минут
      gcTime: 1000 * 60 * 30, // Кеш хранится 30 минут (заменил cacheTime на gcTime)
      retry: 2, // Повторять неудачные запросы 2 раза
      retryDelay: 3000, // Задержка между повторами 3 секунды
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    const initializeAdMob = async () => {
      await mobileAds().initialize();
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: true,
        tagForUnderAgeOfConsent: true,
      });
      console.log('[App] AdMob initialized successfully');
    };

    initializeAdMob();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="image/[id]" options={{ headerShown: false }} />
        <Stack.Screen 
          name="privacy-policy" 
          options={{ 
            headerShown: false,
            presentation: 'modal'
          }} 
        />
      </Stack>
      <StatusBar style="light" />
      <Toast />
    </QueryClientProvider>
  );
}
