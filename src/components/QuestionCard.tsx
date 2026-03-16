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
      <Animated.View style={[styles.card, {opacity: fadeAnim}]}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentIndex + 1} / {totalCount}
            </Text>
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.question}</Text>
          </View>

          {showFollowUp ? (
            <View style={styles.followUpContainer}>
              <View style={styles.followUpDivider} />
              <Text style={styles.followUpLabel}>Follow-up</Text>
              <Text style={styles.followUpText}>{question.followup}</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                triggerHaptic();
                setShowFollowUp(true);
              }}
              style={styles.revealButton}
              activeOpacity={0.7}>
              <Text style={styles.revealButtonText}>Reveal Follow-up</Text>
            </TouchableOpacity>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic();
                onToggleFavorite();
              }}
              style={[
                styles.actionButton,
                isFavorite && styles.actionButtonFavorite,
              ]}
              activeOpacity={0.7}>
              <Text style={styles.actionIcon}>
                {isFavorite ? '\u2665' : '\u2661'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              style={styles.actionButton}
              activeOpacity={0.7}>
              <Text style={styles.actionIcon}>
                {Platform.OS === 'ios' ? '\u{1F4E4}' : '\u{1F517}'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.swipeHint}>
            <Text style={styles.swipeHintText}>
              {'\u2190'} Swipe to navigate {'\u2192'}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 28,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    justifyContent: 'center',
  },
  progressContainer: {
    position: 'absolute',
    top: 20,
    right: 24,
  },
  progressText: {
    ...typography.small,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  questionText: {
    ...typography.question,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  followUpContainer: {
    paddingBottom: 16,
  },
  followUpDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  followUpLabel: {
    ...typography.captionMedium,
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  followUpText: {
    ...typography.followUp,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  revealButton: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  revealButtonText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 8,
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonFavorite: {
    backgroundColor: colors.favoriteLight,
  },
  actionIcon: {
    fontSize: 22,
  },
  swipeHint: {
    alignItems: 'center',
    paddingTop: 16,
  },
  swipeHintText: {
    ...typography.small,
    color: colors.textTertiary,
  },
});
