import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Данные считаются свежими 5 минут
      cacheTime: 1000 * 60 * 30, // Кеш хранится 30 минут
      retry: 2, // Повторять неудачные запросы 2 раза
      retryDelay: 3000, // Задержка между повторами 3 секунды
    },
  },
});

export default function RootLayout() {
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
