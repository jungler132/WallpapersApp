import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

export const SearchAdBanner = () => {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId="ca-app-pub-3940256099942544/6300978111"
        size={BannerAdSize.BANNER}
        onAdLoaded={() => console.log('Search ad loaded')}
        onAdFailedToLoad={(error) => console.error('Search ad failed to load:', error)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },
}); 