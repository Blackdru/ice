import React, {forwardRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ViewShot from 'react-native-view-shot';
import {colors, gradientMain} from '../theme/colors';
import {typography} from '../theme/typography';

interface ShareableCardProps {
  questionText: string;
}

export const ShareableCard = forwardRef<ViewShot, ShareableCardProps>(
  ({questionText}, ref) => {
    return (
      <ViewShot ref={ref} options={{format: 'png', quality: 0.9}}>
        <View style={styles.shareableCardContainer}>
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
            <View style={styles.shareableCard}>
              {/* Diagonal Watermark */}
              <View style={styles.diagonalWatermarkContainer}>
                <Text style={styles.diagonalWatermarkText}>IceB</Text>
              </View>

              {/* Question content */}
              <View style={styles.shareableContentArea}>
                <View style={styles.questionHeader}>
                  <View style={styles.quoteIcon}>
                    <Text style={styles.quoteText}>"</Text>
                  </View>
                </View>

                <Text style={styles.questionText}>{questionText}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ViewShot>
    );
  },
);

const styles = StyleSheet.create({
  shareableCardContainer: {
    width: 380,
    height: 520,
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
  },
  shareableCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 26,
    padding: 20,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  diagonalWatermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{rotate: '-45deg'}],
  },
  diagonalWatermarkText: {
    fontSize: 80,
    fontWeight: '900',
    color: colors.accent,
    opacity: 0.08,
    letterSpacing: 10,
  },
  shareableContentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
  },
});
