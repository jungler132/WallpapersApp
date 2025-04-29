import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Platform, LogBox, NativeModules } from 'react-native';

// Определяем типы для ErrorUtils
declare global {
  interface Global {
    ErrorUtils: {
      getGlobalHandler: () => (error: Error, isFatal: boolean) => void;
      setGlobalHandler: (callback: (error: Error, isFatal: boolean) => void) => void;
    }
  }
}

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
      try {
        console.log('[App] Starting initialization...');
        
        // Запрашиваем разрешение на отслеживание только на iOS
        if (Platform.OS === 'ios') {
          const { status } = await requestTrackingPermissionsAsync();
          console.log('[App] iOS tracking permission status:', status);
        }

        // Инициализация Google Mobile Ads SDK
        console.log('[App] Initializing AdMob...');
        const adapterStatuses = await mobileAds().initialize();
        
        type AdapterStatus = {
          state: number;
          description: string;
        };
        
        const initStatus = Object.keys(adapterStatuses).reduce<Record<string, AdapterStatus>>((prev, adapterClass) => {
          return {
            ...prev,
            [adapterClass]: {
              state: adapterStatuses[adapterClass].state,
              description: adapterStatuses[adapterClass].description
            }
          };
        }, {});
        
        console.log('[App] AdMob initialization complete:', initStatus);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('[App] Critical error during initialization:', {
            error: error.message,
            stack: error.stack,
            platform: Platform.OS
          });
        } else {
          console.error('[App] Unknown error during initialization:', error);
        }
      }
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
