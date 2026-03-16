import React, {useEffect} from 'react';
import {View, StyleSheet, Image, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../theme/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({onFinish}: SplashScreenProps) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

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
  }, []);

  return (
    <LinearGradient
      colors={['#0F0F23', '#1A1D3A']}
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
          colors={['#FF6B9D', '#C471ED', '#00E5FF']}
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
