import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Gyroscope } from 'expo-sensors';

const { width, height } = Dimensions.get('window');
const BALL_SIZE = 40;

export default function App() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [position, setPosition] = useState({ 
    x: width / 2 - BALL_SIZE / 2, 
    y: height / 2 - BALL_SIZE / 2 
  });

  useEffect(() => {
    Gyroscope.setUpdateInterval(16);

    const subscription = Gyroscope.addListener(gyroscopeData => {
      setData(gyroscopeData);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      setPosition(prevPosition => {
        // Ajustar a sensibilidade conforme necessário
        const sensitivity = 15;
        let newX = prevPosition.x - data.y * sensitivity;
        let newY = prevPosition.y + data.x * sensitivity; // Note o sinal +

        // Limites da tela
        newX = Math.max(0, Math.min(width - BALL_SIZE, newX));
        newY = Math.max(0, Math.min(height - BALL_SIZE, newY));

        return { x: newX, y: newY };
      });
    };

    const animationFrame = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrame);
  }, [data]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mova o celular!</Text>
      <View style={[styles.ball, { left: position.x, top: position.y }]} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    position: 'absolute',
    top: 50,
    fontSize: 18,
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    backgroundColor: 'coral',
  },
});