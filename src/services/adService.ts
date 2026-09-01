import {
  InterstitialAd,
  BannerAdSize,
  TestIds,
  AdEventType,
} from 'react-native-google-mobile-ads';

// Production Ad Unit IDs
const PRODUCTION_INTERSTITIAL = 'ca-app-pub-3990640624622013/1669218856';
const PRODUCTION_BANNER = 'ca-app-pub-3990640624622013/8729451224';

// Use test IDs in development, production IDs in release
const isDev = __DEV__;

const INTERSTITIAL_AD_UNIT = isDev ? TestIds.INTERSTITIAL : PRODUCTION_INTERSTITIAL;
export const BANNER_AD_UNIT = isDev ? TestIds.BANNER : PRODUCTION_BANNER;
export const BANNER_SIZE = BannerAdSize.ANCHORED_ADAPTIVE_BANNER;

if (__DEV__) {
  console.log('Ad Configuration:', {
    isDev,
    interstitial: INTERSTITIAL_AD_UNIT,
    banner: BANNER_AD_UNIT,
  });
}

const SWIPE_THRESHOLD = 8;

let swipeCount = 0;
let interstitial: ReturnType<typeof InterstitialAd.createForAdRequest> | null = null;
let interstitialLoaded = false;

export function initializeAds() {
  loadInterstitial();
}

function loadInterstitial() {
  interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT);

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    interstitialLoaded = true;
  });

  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    interstitialLoaded = false;
    loadInterstitial();
  });

  interstitial.addAdEventListener(AdEventType.ERROR, () => {
    interstitialLoaded = false;
    setTimeout(loadInterstitial, 30000);
  });

  interstitial.load();
}

export function trackSwipe(): boolean {
  swipeCount++;
  if (swipeCount % SWIPE_THRESHOLD === 0) {
    return showInterstitial();
  }
  return false;
}

export function showInterstitial(): boolean {
  if (interstitialLoaded && interstitial) {
    interstitial.show();
    return true;
  }
  return false;
}

export function getSwipeCount(): number {
  return swipeCount;
}
