import {
  InterstitialAd,
  RewardedAd,
  BannerAdSize,
  TestIds,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

const INTERSTITIAL_AD_UNIT = TestIds.INTERSTITIAL;
const REWARDED_AD_UNIT = TestIds.REWARDED;
export const BANNER_AD_UNIT = TestIds.BANNER;
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
