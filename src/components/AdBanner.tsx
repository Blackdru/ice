import React, {useMemo, useState} from 'react';
import {View, StyleSheet, Text, useWindowDimensions, StyleProp, ViewStyle} from 'react-native';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {BANNER_AD_UNIT} from '../services/adService';
import {colors} from '../theme/colors';

interface AdBannerProps {
  style?: StyleProp<ViewStyle>;
}

export function AdBanner({style}: AdBannerProps) {
  const [adError, setAdError] = useState<string | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const {width: screenWidth} = useWindowDimensions();

  // Memoize banner size calculation to avoid recalculating on every render
  const bannerSize = useMemo(() => {
    if (screenWidth >= 728) {
      return BannerAdSize.LEADERBOARD; // 728x90
    } else if (screenWidth >= 468) {
      return BannerAdSize.FULL_BANNER; // 468x60
    }
    return BannerAdSize.BANNER; // 320x50
  }, [screenWidth]);

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={BANNER_AD_UNIT}
        size={bannerSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
          keywords: ['conversation', 'questions', 'social', 'icebreaker'],
        }}
        onAdLoaded={() => {
          if (__DEV__) {
            console.log('✅ Banner ad loaded successfully');
          }
          setAdLoaded(true);
          setAdError(null);
        }}
        onAdFailedToLoad={(error) => {
          if (__DEV__) {
            console.error('❌ Banner ad failed to load:', error);
          }
          setAdError(error.message);
        }}
        onAdOpened={() => {
          if (__DEV__) {
            console.log('Banner ad opened');
          }
        }}
        onAdClosed={() => {
          if (__DEV__) {
            console.log('Banner ad closed');
          }
        }}
      />
      {__DEV__ && adError && (
        <Text style={styles.errorText}>Ad Error: {adError}</Text>
      )}
      {__DEV__ && !adLoaded && !adError && (
        <Text style={styles.loadingText}>Loading ad...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    minHeight: 60,
  },
  errorText: {
    color: 'red',
    fontSize: 10,
    padding: 4,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 10,
    padding: 4,
  },
});
