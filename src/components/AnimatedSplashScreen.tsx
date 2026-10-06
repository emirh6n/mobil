import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { theme } from '../theme/theme';

const { width, height } = Dimensions.get('window');

// 20x20 grid representing the letter 'T'
const LOGO_GRID = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const PARTICLE_SIZE = 6;
const SPACING = 2;
const GRID_ROWS = LOGO_GRID.length;
const GRID_COLS = LOGO_GRID[0].length;

const TOTAL_WIDTH = GRID_COLS * (PARTICLE_SIZE + SPACING) - SPACING;
const TOTAL_HEIGHT = GRID_ROWS * (PARTICLE_SIZE + SPACING) - SPACING;

const START_X = (width - TOTAL_WIDTH) / 2;
const START_Y = (height - TOTAL_HEIGHT) / 2;

type Particle = {
  id: string;
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  anim: Animated.Value;
  delayIn: number;
  delayOut: number;
};

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onAnimationComplete }) => {
  const particles = useRef<Particle[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p: Particle[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (LOGO_GRID[r][c] === 1) {
          // Calculate random start positions far outside the screen
          const inAngle = Math.random() * Math.PI * 2;
          const inDistance = Math.max(width, height) + Math.random() * 300 + 100;

          // Out positions
          const outAngle = Math.random() * Math.PI * 2;
          const outDistance = Math.max(width, height) + Math.random() * 400 + 200;

          p.push({
            id: `${r}-${c}`,
            targetX: START_X + c * (PARTICLE_SIZE + SPACING),
            targetY: START_Y + r * (PARTICLE_SIZE + SPACING),
            startX: width / 2 + Math.cos(inAngle) * inDistance,
            startY: height / 2 + Math.sin(inAngle) * inDistance,
            endX: width / 2 + Math.cos(outAngle) * outDistance,
            endY: height / 2 + Math.sin(outAngle) * outDistance,
            anim: new Animated.Value(0),
            delayIn: Math.random() * 800,
            delayOut: Math.random() * 600,
          });
        }
      }
    }
    particles.current = p;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    // 1. In Animation (particles flying in to form the logo)
    const inAnimations = particles.current.map((p) =>
      Animated.timing(p.anim, {
        toValue: 1,
        duration: 1000 + Math.random() * 400,
        delay: p.delayIn,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    // 2. Out Animation (particles flying out to random directions)
    const outAnimations = particles.current.map((p) =>
      Animated.timing(p.anim, {
        toValue: 2,
        duration: 800 + Math.random() * 300,
        delay: p.delayOut,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      })
    );

    Animated.sequence([
      Animated.parallel(inAnimations),
      Animated.delay(1800), // Hold logo for 1.8 seconds
      Animated.parallel(outAnimations),
    ]).start(() => {
      onAnimationComplete();
    });
  }, [ready, onAnimationComplete]);

  if (!ready) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      {particles.current.map((p) => {
        const translateX = p.anim.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [p.startX, p.targetX, p.endX],
        });
        
        const translateY = p.anim.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [p.startY, p.targetY, p.endY],
        });

        const rotate = p.anim.interpolate({
          inputRange: [0, 1, 2],
          outputRange: ['180deg', '0deg', '-180deg'],
        });

        const opacity = p.anim.interpolate({
          inputRange: [0, 0.2, 0.8, 1, 1.2, 1.8, 2],
          outputRange: [0, 1, 1, 1, 1, 1, 0],
        });

        const scale = p.anim.interpolate({
          inputRange: [0, 0.5, 1, 1.5, 2],
          outputRange: [0, 1.2, 1, 1.2, 0],
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { rotate },
                  { scale },
                ],
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: PARTICLE_SIZE,
    height: PARTICLE_SIZE,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});
