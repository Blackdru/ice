import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Share,
  Platform,
  Animated,
  PanResponder,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../theme/colors';
import {typography} from '../theme/typography';
import {Question} from '../data/questions';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface QuestionCardProps {
  question: Question;
  categoryId: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  currentIndex: number;
  totalCount: number;
}

export function QuestionCard({
  question,
  isFavorite,
  onToggleFavorite,
  onSwipeLeft,
  onSwipeRight,
  currentIndex,
  totalCount,
}: QuestionCardProps) {
  const [showFollowUp, setShowFollowUp] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const triggerHaptic = useCallback(() => {
    try {
      const ReactNativeHapticFeedback = require('react-native-haptic-feedback').default;
      ReactNativeHapticFeedback.trigger('impactLight', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    } catch {
      // haptic not available
    }
  }, []);

  const handleSwipeLeft = useCallback(() => {
    triggerHaptic();
    setShowFollowUp(false);
    onSwipeLeft();
  }, [onSwipeLeft, triggerHaptic]);

  const handleSwipeRight = useCallback(() => {
    triggerHaptic();
    setShowFollowUp(false);
    onSwipeRight();
  }, [onSwipeRight, triggerHaptic]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 15;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            handleSwipeLeft();
            translateX.setValue(0);
          });
        } else if (gestureState.dx > SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            handleSwipeRight();
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const rotate = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  const opacity = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH * 0.8, 0, SCREEN_WIDTH * 0.8],
    outputRange: [0.5, 1, 0.5],
  });

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Conversation Starter:\n\n"${question.question}"\n\nShared from IceB`,
      });
    } catch {
      // share cancelled
    }
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.cardWrapper,
        {
          transform: [{translateX}, {rotate}],
          opacity,
        },
      ]}>
      <Animated.View style={[styles.cardContainer, {opacity: fadeAnim}]}>
        {/* Background gradient cards stack effect */}
        <View style={styles.cardStack}>
          <LinearGradient
            colors={['#FFD93D', '#FF8C42']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[styles.stackCard, styles.stackCard3]}
          />
          <LinearGradient
            colors={['#FF8C42', '#FF6B9D']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={[styles.stackCard, styles.stackCard2]}
          />
        </View>

        {/* Main card with gradient border */}
        <LinearGradient
          colors={['#FF6B9D', '#C471ED', '#00E5FF']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradientBorder}>
          <View style={styles.card}>
            {/* Top bar with progress */}
            <View style={styles.topBar}>
              <View style={styles.progressDots}>
                {Array.from({length: Math.min(totalCount, 5)}).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === currentIndex % 5 && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
              <View style={styles.counterBadge}>
                <Text style={styles.counterText}>
                  {currentIndex + 1}/{totalCount}
                </Text>
              </View>
            </View>

            {/* Question content */}
            <View style={styles.contentArea}>
              <View style={styles.questionHeader}>
                <View style={styles.quoteIcon}>
                  <Text style={styles.quoteText}>"</Text>
                </View>
              </View>

              <Text style={styles.questionText}>{question.question}</Text>

              {showFollowUp && (
                <View style={styles.followUpSection}>
                  <LinearGradient
                    colors={['rgba(0, 229, 255, 0.15)', 'rgba(196, 113, 237, 0.15)']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.followUpGradient}>
                    <View style={styles.followUpContent}>
                      <Text style={styles.followUpLabel}>💭 Follow-up</Text>
                      <Text style={styles.followUpText}>{question.followup}</Text>
                    </View>
                  </LinearGradient>
                </View>
              )}
            </View>

            {/* Bottom actions */}
            <View style={styles.bottomSection}>
              {!showFollowUp && (
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic();
                    setShowFollowUp(true);
                  }}
                  activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#00E5FF', '#C471ED']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.revealButton}>
                    <Text style={styles.revealButtonText}>Show Follow-up Question</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <View style={styles.actionBar}>
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic();
                    onToggleFavorite();
                  }}
                  style={styles.actionButtonWrapper}
                  activeOpacity={0.7}>
                  <LinearGradient
                    colors={isFavorite ? ['#FF6B9D', '#FF8C42'] : ['#2D3748', '#1E2A4A']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.actionButton}>
                    <Text style={[styles.actionIcon, isFavorite && styles.actionIconActive]}>
                      {isFavorite ? '\u2665' : '\u2661'}
                    </Text>
                    <Text style={[styles.actionText, isFavorite && styles.actionTextActive]}>
                      {isFavorite ? 'Saved' : 'Save'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

               
                  <View style={styles.swipeRow}>
                    <Text style={styles.swipeArrow}>←</Text>
                    <Text style={styles.swipeText}>Swipe</Text>
                    <Text style={styles.swipeArrow}>→</Text>
                  </View>
                

                <TouchableOpacity
                  onPress={handleShare}
                  style={styles.actionButtonWrapper}
                  activeOpacity={0.7}>
                  <LinearGradient
                    colors={['#2D3748', '#1E2A4A']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.actionButton}>
                    <Text style={styles.actionIcon}>
                      {Platform.OS === 'ios' ? '\u{1F4E4}' : '\u{1F517}'}
                    </Text>
                    <Text style={styles.actionText}>Share</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 380,
    height: '85%',
    maxHeight: 520,
    position: 'relative',
  },
  cardStack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stackCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '98%',
    borderRadius: 28,
    opacity: 0.3,
  },
  stackCard2: {
    transform: [{translateY: -8}, {scale: 0.96}],
  },
  stackCard3: {
    transform: [{translateY: -16}, {scale: 0.92}],
  },
  gradientBorder: {
    flex: 1,
    borderRadius: 28,
    padding: 2,
    shadowColor: '#00E5FF',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 26,
    padding: 20,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 24,
  },
  counterBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  counterText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
  },
  questionHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  quoteIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  quoteText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
    marginTop: -6,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  followUpSection: {
    marginTop: 16,
  },
  followUpGradient: {
    borderRadius: 18,
    padding: 2,
  },
  followUpContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
  },
  followUpLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  followUpText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  bottomSection: {
    gap: 12,
  },
  revealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 8,
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  revealIcon: {
    fontSize: 16,
  },
  revealButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.3,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButtonWrapper: {
    flex: 1.2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 6,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  actionIconActive: {
    color: colors.white,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  actionTextActive: {
    color: colors.white,
  },
  swipeIndicator: {
    flex: 0.6,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  swipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  swipeArrow: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  swipeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
});
