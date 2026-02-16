import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLORS = ['#E86B50', '#F2B95E', '#6BAF7A', '#5FA6A6', '#FFD166', '#FF6B6B'];

export function ConfettiBurst({ visible }: { visible: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        x: new Animated.Value(SCREEN_WIDTH / 2),
        y: new Animated.Value(220),
        rotate: new Animated.Value(0),
        opacity: new Animated.Value(0),
        scale: new Animated.Value(0.7),
        color: COLORS[i % COLORS.length],
        size: 6 + (i % 5),
        targetX: (Math.random() - 0.5) * (SCREEN_WIDTH * 0.9),
        targetY: 220 + 180 + Math.random() * 280,
        spin: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360),
      })),
    []
  );

  const didRun = useRef(false);

  useEffect(() => {
    if (!visible || didRun.current) return;
    didRun.current = true;

    const animations = pieces.map((p, idx) =>
      Animated.sequence([
        Animated.delay(idx * 10),
        Animated.parallel([
          Animated.timing(p.opacity, { toValue: 1, duration: 80, useNativeDriver: true }),
          Animated.timing(p.scale, { toValue: 1, duration: 120, useNativeDriver: true }),
          Animated.timing(p.x, { toValue: SCREEN_WIDTH / 2 + p.targetX, duration: 900, useNativeDriver: true }),
          Animated.timing(p.y, { toValue: p.targetY, duration: 900, useNativeDriver: true }),
          Animated.timing(p.rotate, { toValue: p.spin, duration: 900, useNativeDriver: true }),
        ]),
        Animated.timing(p.opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ])
    );

    Animated.parallel(animations).start();
  }, [visible, pieces]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {pieces.map((p) => (
        <Animated.View
          key={p.id}
          style={[
            styles.piece,
            {
              width: p.size,
              height: p.size * 1.6,
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                {
                  rotate: p.rotate.interpolate({
                    inputRange: [-720, 720],
                    outputRange: ['-720deg', '720deg'],
                  }),
                },
                { scale: p.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    borderRadius: 2,
  },
});
