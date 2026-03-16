import {
  InterstitialAd,
  RewardedAd,
  BannerAdSize,
  TestIds,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import {Platform} from 'react-native';

// Production Ad Unit IDs
const PRODUCTION_APP_ID = 'ca-app-pub-3990640624622013~6072697403';
const PRODUCTION_INTERSTITIAL = 'ca-app-pub-3990640624622013/1669218856';
const PRODUCTION_BANNER = 'ca-app-pub-3990640624622013/8729451224';

// Use test IDs in development, production IDs in release
const __DEV__ = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

const INTERSTITIAL_AD_UNIT = __DEV__ ? TestIds.INTERSTITIAL : PRODUCTION_INTERSTITIAL;
const REWARDED_AD_UNIT = __DEV__ ? TestIds.REWARDED : TestIds.REWARDED; // Add production rewarded ID when available
export const BANNER_AD_UNIT = __DEV__ ? TestIds.BANNER : PRODUCTION_BANNER;
export const BANNER_SIZE = BannerAdSize.ANCHORED_ADAPTIVE_BANNER;

const SWIPE_THRESHOLD = 8;

let swipeCount = 0;
let interstitial: InterstitialAd | null = null;
let rewarded: RewardedAd | null = null;
let interstitialLoaded = false;
let rewardedLoaded = false;

export function initializeAds() {
  loadInterstitial();
  loadRewarded();
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

function loadRewarded() {
  rewarded = RewardedAd.createForAdRequest(REWARDED_AD_UNIT);

  rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
    rewardedLoaded = true;
  });

  rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
    // reward handled by caller
  });

  rewarded.addAdEventListener(AdEventType.CLOSED, () => {
    rewardedLoaded = false;
    loadRewarded();
  });

  rewarded.addAdEventListener(AdEventType.ERROR, () => {
    rewardedLoaded = false;
    setTimeout(loadRewarded, 30000);
  });

  rewarded.load();
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

export function showRewarded(onReward: () => void): boolean {
  if (rewardedLoaded && rewarded) {
    const unsubscribe = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        onReward();
        unsubscribe();
      },
    );
    rewarded.show();
    return true;
  }
  return false;
}

export function getSwipeCount(): number {
  return swipeCount;
}
