import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import {colors, gradientMain, gradientWarm} from '../theme/colors';
import Clipboard from '@react-native-clipboard/clipboard';
import LinearGradient from 'react-native-linear-gradient';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {typography} from '../theme/typography';
import {Question} from '../data/questions';
import {ShareableCard} from './ShareableCard';

// Top-level import with safe fallback for haptic feedback
let HapticFeedback: {trigger: (type: string, options?: object) => void} | null = null;
try {
  HapticFeedback = require('react-native-haptic-feedback').default;
} catch {
  // haptic feedback not available on this platform
}

interface QuestionCardProps {
  question: Question;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  currentIndex: number;
  totalCount: number;
}

export const QuestionCard = React.memo(function QuestionCard({
  question,
  isFavorite,
  onToggleFavorite,
  onSwipeLeft,
  onSwipeRight,
  currentIndex,
  totalCount,
}: QuestionCardProps) {
  const [showFollowUp, setShowFollowUp] = useState(false);
  const {width: screenWidth} = useWindowDimensions();
  const swipeThreshold = screenWidth * 0.25;

  const translateX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shareableCardRef = useRef<ViewShot>(null);

  const triggerHaptic = useCallback(() => {
    HapticFeedback?.trigger('impactLight', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
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

  // Keep references to handlers updated for PanResponder to prevent stale closures
  const callbacksRef = useRef({handleSwipeLeft, handleSwipeRight, screenWidth, swipeThreshold});
  useEffect(() => {
    callbacksRef.current = {handleSwipeLeft, handleSwipeRight, screenWidth, swipeThreshold};
  }, [handleSwipeLeft, handleSwipeRight, screenWidth, swipeThreshold]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 15;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const {
          handleSwipeLeft: swipeLeft,
          handleSwipeRight: swipeRight,
          screenWidth: width,
          swipeThreshold: threshold,
        } = callbacksRef.current;

        if (gestureState.dx < -threshold) {
          Animated.timing(translateX, {
            toValue: -width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            swipeLeft();
            translateX.setValue(0);
          });
        } else if (gestureState.dx > threshold) {
          Animated.timing(translateX, {
            toValue: width,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            swipeRight();
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
    inputRange: [-screenWidth, 0, screenWidth],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  const opacity = translateX.interpolate({
    inputRange: [-screenWidth * 0.8, 0, screenWidth * 0.8],
    outputRange: [0.5, 1, 0.5],
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleCopyQuestion = async () => {
    try {
      triggerHaptic();
      Clipboard.setString(question.question);
      Alert.alert('Copied!', 'Question copied to clipboard');
    } catch {
      Alert.alert('Error', 'Failed to copy question');
    }
  };

  const handleShare = async () => {
    try {
      triggerHaptic();
      if (shareableCardRef.current && shareableCardRef.current.capture) {
        const uri = await shareableCardRef.current.capture();
        await Share.open({
          url: Platform.OS === 'ios' ? uri : `file://${uri}`,
          message: 'Check out this conversation starter from IceB!',
        });
      }
    } catch (error: unknown) {
      const shareError = error as {message?: string};
      if (shareError?.message !== 'User did not share') {
        console.error('Share error:', error);
      }
    }
  };

  return (
    <>
      {/* Hidden shareable card for screenshots - only question and watermark */}
      <View style={styles.hiddenCard}>
        <ShareableCard ref={shareableCardRef} questionText={question.question} />
      </View>

      {/* Visible interactive card */}
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
              colors={[colors.gradientYellow, colors.gradientOrange]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={[styles.stackCard, styles.stackCard3]}
            />
            <LinearGradient
              colors={[colors.gradientOrange, colors.gradientPink]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={[styles.stackCard, styles.stackCard2]}
            />
          </View>

          {/* Main card with gradient border */}
          <LinearGradient
            colors={gradientMain}
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
                <View style={styles.topBarRight}>
                  <View style={styles.counterBadge}>
                    <Text style={styles.counterText}>
                      {currentIndex + 1}/{totalCount}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Copy button below counter */}
              <View style={styles.copyButtonContainer}>
                <TouchableOpacity
                  onPress={handleCopyQuestion}
                  style={styles.copyButton}
                  activeOpacity={0.7}>
                  <Icon name="content-copy" size={16} color={colors.accent} />
                </TouchableOpacity>
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

              {/* Watermark */}
              <View style={styles.watermark}>
                <Text style={styles.watermarkText}>IceB</Text>
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
                      colors={[colors.gradientCyan, colors.gradientPurple]}
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
                      colors={isFavorite ? gradientWarm : [colors.border, colors.primaryLight]}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={styles.actionButton}>
                      <Icon 
                        name={isFavorite ? 'favorite' : 'favorite-border'} 
                        size={18} 
                        color={isFavorite ? colors.white : colors.textSecondary} 
                      />
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
                      colors={[colors.border, colors.primaryLight]}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={styles.actionButton}>
                      <Icon name="share" size={18} color={colors.textSecondary} />
                      <Text style={styles.actionText}>Share</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </>
  );
});

const styles = StyleSheet.create({
  hiddenCard: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    width: 380,
    height: 520,
  },
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
    shadowColor: colors.gradientCyan,
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
    marginBottom: 8,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  copyButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  copyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
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
    ...typography.question,
    color: colors.white,
    textAlign: 'center',
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
    ...typography.followUp,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  watermark: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    opacity: 0.3,
  },
  watermarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 1,
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
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  actionTextActive: {
    color: colors.white,
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
