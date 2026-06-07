import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, useWindowDimensions, ScrollView } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { colors } from '../theme/colors';
import { BouncyButton } from '../theme/UiAnimations';

export default function LoginScreen({ navigation }) {
  // Local state for user inputs and screen dimensions to adapt the layout for landscape or tablet viewing
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Validates credentials and processes the Firebase login request before routing to the main feed
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Alert", "Fill both the email and password boxes.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert("Login error", "Wrong credentials.");
    }
  };

  // UI layout utilizing a ScrollView to protect inputs from the keyboard and a fluid container for responsiveness
  return (
    <ScrollView 
      contentContainerStyle={[styles.scrollContainer, { minHeight: height }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        
        <View style={[styles.card, { width: isLandscape ? '60%' : '90%', maxWidth: 450 }]}>
          <Text style={styles.title}>CampusFlow</Text>
          <Text style={styles.subtitle}>Find your perfect study space</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textLight}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textLight}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />

          <BouncyButton style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </BouncyButton>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <BouncyButton 
            style={styles.registerButtonOutline} 
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonTextOutline}>Create an Account</Text>
          </BouncyButton>
        </View>
      </View>
    </ScrollView>
  );
}

// Visual styling rules defining spacing, typography, and card geometry
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB', 
  },
  dividerText: {
    marginHorizontal: 10,
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '500',
  },
  registerButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonTextOutline: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});