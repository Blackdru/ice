
/* eslint-env jest */

jest.mock('react-native-google-mobile-ads', () => {
  const mockAd = {
    addAdEventListener: jest.fn(),
    load: jest.fn(),
    show: jest.fn(),
  };
  return {
    __esModule: true,
    default: () => ({
      initialize: jest.fn().mockResolvedValue({}),
    }),
    BannerAd: 'BannerAd',
    BannerAdSize: {
      BANNER: 'BANNER',
      FULL_BANNER: 'FULL_BANNER',
      LEADERBOARD: 'LEADERBOARD',
      ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
    },
    InterstitialAd: {
      createForAdRequest: jest.fn(() => mockAd),
    },
    TestIds: {
      BANNER: 'test-banner-id',
      INTERSTITIAL: 'test-interstitial-id',
    },
    AdEventType: {
      LOADED: 'loaded',
      CLOSED: 'closed',
      ERROR: 'error',
    },
  };
});

jest.mock('react-native-share', () => ({
  default: {
    open: jest.fn().mockResolvedValue({}),
  },
  open: jest.fn().mockResolvedValue({}),
}));

jest.mock('react-native-view-shot', () => {
  const React = require('react');
  class MockViewShot extends React.Component {
    capture = jest.fn().mockResolvedValue('mock-uri');
    render() {
      return this.props.children;
    }
  }
  return {
    __esModule: true,
    default: MockViewShot,
  };
});

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn().mockResolvedValue(''),
}));

