import React, { useRef, useEffect } from 'react';
import { StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');
const backgroundImage = require('@/assets/galaxy-bg.png');

const InfiniteScrollBackground = () => {
  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: 1,
        duration: 30000, // Duração da animação (mais longo = mais lento)
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [scrollAnim]);

  const translateY1 = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height],
  });

  const translateY2 = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-height, 0],
  });

  return (
    <>
      <Animated.Image
        source={backgroundImage}
        style={[
          styles.background,
          {
            transform: [{ translateY: translateY1 }],
          },
        ]}
        resizeMode="cover"
      />
      <Animated.Image
        source={backgroundImage}
        style={[
          styles.background,
          {
            transform: [{ translateY: translateY2 }],
          },
        ]}
        resizeMode="cover"
      />
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    width: '100%',
    height: height,
    top: 0,
    left: 0,
  },
});

export default InfiniteScrollBackground;