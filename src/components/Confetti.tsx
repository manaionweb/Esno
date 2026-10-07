import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withDelay, 
  withSequence, 
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const NUM_PARTICLES = 30;
const COLORS = ['#FFD700', '#FF69B4', '#00CED1', '#32CD32', '#6A5ACD', '#FF4500'];

const Particle = ({ delay }: { delay: number }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  const color = useMemo(() => COLORS[Math.floor(Math.random() * COLORS.length)], []);
  const size = useMemo(() => Math.random() * 8 + 6, []);
  
  // Random dispersion values
  const targetX = useMemo(() => (Math.random() - 0.5) * width * 1.2, []);
  const targetY = useMemo(() => -Math.random() * height * 0.8, []);
  const finalY = useMemo(() => height * 0.2, []); // Fall down

  useEffect(() => {
    // 1. Initial Burst
    scale.value = withDelay(delay, withSpring(1));
    translateX.value = withDelay(delay, withSpring(targetX, { damping: 15, stiffness: 60 }));
    translateY.value = withDelay(delay, withSpring(targetY, { damping: 15, stiffness: 60 }));
    rotate.value = withDelay(delay, withTiming(Math.random() * 720, { duration: 2000 }));

    // 2. Fall and Fade
    translateY.value = withDelay(delay + 800, withTiming(finalY, { duration: 1500 }));
    opacity.value = withDelay(delay + 1800, withTiming(0, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.particle, 
        { backgroundColor: color, width: size, height: size }, 
        animatedStyle 
      ]} 
    />
  );
};

export const Confetti = () => {
  return (
    <View pointerEvents="none" style={styles.container}>
      {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
        <Particle key={i} delay={Math.random() * 500} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  particle: {
    position: 'absolute',
    borderRadius: 2,
  },
});
