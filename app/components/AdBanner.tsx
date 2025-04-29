import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds, AdError } from 'react-native-google-mobile-ads';

// Явно указываем тестовые ID для каждой платформы
const TEST_IDS = {
  android: 'ca-app-pub-3940256099942544/6300978111',
  ios: 'ca-app-pub-3940256099942544/2934735716'
};

const PROD_IDS = {
  android: 'ca-app-pub-6203993897795010/723787892',
  ios: 'ca-app-pub-6203993897795010/723787892' // Замените на iOS ID когда будете публиковать в App Store
};

// Выбираем ID в зависимости от платформы и режима разработки
const adUnitId = __DEV__ 
  ? Platform.select({
      android: TEST_IDS.android,
      ios: TEST_IDS.ios,
      default: TestIds.BANNER
    })
  : Platform.select({
      android: PROD_IDS.android,
      ios: PROD_IDS.ios,
      default: ''
    });

export const AdBanner = () => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  console.log('[AdBanner] Initializing with:', {
    platform: Platform.OS,
    isDev: __DEV__,
    adUnitId,
    isUsingTestId: __DEV__ || adUnitId === TEST_IDS.android || adUnitId === TEST_IDS.ios
  });

  return (
    <View style={{ 
      height: isAdLoaded ? 'auto' : 0,
      alignItems: 'center',
      backgroundColor: '#000'
    }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('[AdBanner] Ad loaded successfully');
          setIsAdLoaded(true);
        }}
        onAdFailedToLoad={(error) => {
          console.error('[AdBanner] Ad failed to load:', {
            errorCode: error?.code,
            errorMessage: error?.message,
            error
          });
        }}
      />
    </View>
  );
}; 