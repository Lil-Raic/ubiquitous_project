import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Text } from 'react-native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// BOUNCY BUTTON 

export const BouncyButton = ({ onPress, style, children, disabled }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateIn = () => Animated.timing(scaleAnim, { toValue: 0.92, duration: 100, useNativeDriver: true }).start();
  const animateOut = () => Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }).start();

  return (
    <AnimatedTouchable 
      activeOpacity={0.9} 
      onPressIn={animateIn} 
      onPressOut={animateOut} 
      onPress={onPress} 
      disabled={disabled}
      style={[style, { transform: [{ scale: scaleAnim }] }]}
    >
      {children}
    </AnimatedTouchable>
  );
};

// LIFT BUTTON 

export const LiftButton = ({ onPress, style, children, disabled }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateIn = () => Animated.timing(scaleAnim, { toValue: 1.08, duration: 150, useNativeDriver: true }).start();
  const animateOut = () => Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();

  return (
    <AnimatedTouchable 
      activeOpacity={0.8} 
      onPressIn={animateIn} 
      onPressOut={animateOut} 
      onPress={onPress} 
      disabled={disabled}
      style={[style, { transform: [{ scale: scaleAnim }] }]}
    >
      {children}
    </AnimatedTouchable>
  );
};

// TOAST 

export const CustomToast = ({ visible, message }) => {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(translateY, { toValue: 60, duration: 400, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true })
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toastContainer, { transform: [{ translateY }] }]}>
      <Text style={styles.toastText}>✅ {message}</Text>
    </Animated.View>
  );
};

// STAGGERED
export const StaggeredCard = ({ children, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current; // Starts 50px pushed down

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 100, useNativeDriver: true })
    ]).start();
  }, [index]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute', top: 0, left: 20, right: 20, zIndex: 999,
    backgroundColor: '#10B981', padding: 16, borderRadius: 12, 
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 
  },
  toastText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});

