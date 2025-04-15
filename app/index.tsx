import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';

const Logo = () => (
  <Svg width="200" height="200" viewBox="0 0 200 200">
    <Circle cx="100" cy="100" r="90" fill="#FF3366"/>
    <Path d="M70 150 L100 50 L130 150" stroke="white" strokeWidth="12" strokeLinecap="round"/>
    <Path d="M85 120 L115 120" stroke="white" strokeWidth="12" strokeLinecap="round"/>
    <Circle cx="100" cy="100" r="30" stroke="white" strokeWidth="4" fill="none"/>
    <Circle cx="100" cy="100" r="15" fill="white"/>
  </Svg>
);

export default function SplashScreen() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Анимация появления
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Переход на следующий экран через 3 секунды
    const timer = setTimeout(() => {
      router.replace('/(tabs)/feed');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <Logo />
        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
          Anime Wallpapers
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
}); 