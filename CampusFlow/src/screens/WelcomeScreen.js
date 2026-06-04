import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>CampusFlow</Text>
        <Text style={styles.subtitle}>Your ultimate study companion at FERI.</Text>
        <Text style={styles.description}>
          Find quiet study spots, check live availability, and book rooms directly from your phone.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.replace('Login')} 
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary, 
    justifyContent: 'space-between',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.surface, 
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#E0E7FF', 
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: colors.surface,
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: colors.surface, 
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});