import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
// import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width - 32; // Такая же ширина как у фото
const ITEM_HEIGHT = ITEM_WIDTH * 1.4; // Такая же высота как у фото

// Маленький баннер для нижней навигации
export const SmallAdBanner = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <View style={[styles.smallBannerContainer, !isLoaded && styles.hidden]}>
      {/* <BannerAd
        unitId={TestIds.BANNER}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('[SmallAdBanner] Ad loaded successfully');
          setIsLoaded(true);
        }}
        onAdFailedToLoad={(error) => {
          console.error('[SmallAdBanner] Ad failed to load:', error);
        }}
      /> */}
    </View>
  );
};

// Большой баннер для ленты
export const FeedAdBanner = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <View style={[styles.feedBannerContainer, !isLoaded && styles.hidden]}>
      {/* <BannerAd
        unitId={TestIds.BANNER}
        size={BannerAdSize.MEDIUM_RECTANGLE}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('[FeedAdBanner] Ad loaded successfully');
          setIsLoaded(true);
        }}
        onAdFailedToLoad={(error) => {
          console.error('[FeedAdBanner] Ad failed to load:', error);
        }}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  smallBannerContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  feedBannerContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    opacity: 0,
  }
});