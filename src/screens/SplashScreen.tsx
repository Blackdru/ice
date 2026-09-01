import React, {useEffect, useRef} from 'react';
import {StyleSheet, Image, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors, gradientMain} from '../theme/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({onFinish}: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <LinearGradient
      colors={[colors.background, colors.backgroundLight]}
      style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <LinearGradient
          colors={gradientMain}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.logoGradient}>
          <Image
            source={require('../../android/assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </LinearGradient>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGradient: {
    width: 140,
    height: 140,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 120,
    height: 120,
  },
});
