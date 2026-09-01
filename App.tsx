import React, {useState, useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import mobileAds from 'react-native-google-mobile-ads';
import {AppNavigator} from './src/navigation/AppNavigator';
import {SplashScreen} from './src/screens/SplashScreen';
import {initializeAds} from './src/services/adService';
import {FavoritesProvider} from './src/context/FavoritesContext';
import {ErrorBoundary} from './src/components/ErrorBoundary';
import {colors} from './src/theme/colors';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [adsInitialized, setAdsInitialized] = useState(false);

  useEffect(() => {
    // Initialize Google Mobile Ads
    mobileAds()
      .initialize()
      .then(() => {
        if (__DEV__) {
          console.log('AdMob initialized');
        }
        setAdsInitialized(true);
        initializeAds();
      })
      .catch(error => {
        console.error('AdMob initialization error:', error);
        setAdsInitialized(true); // Continue even if ads fail
      });
  }, []);

  if (showSplash || !adsInitialized) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <ErrorBoundary>
      <FavoritesProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" backgroundColor={colors.background} />
          <AppNavigator />
        </SafeAreaProvider>
      </FavoritesProvider>
    </ErrorBoundary>
  );
}

export default App;
