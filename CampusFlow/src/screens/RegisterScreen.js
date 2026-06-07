import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import { colors } from '../theme/colors';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { db } from '../config/firebase';
import { BouncyButton } from '../theme/UiAnimations';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all of the boxes.");
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Error", "The passwords are different.");
      return;
    }

    try {
      const usernameRef = doc(db, 'usernames', username.toLowerCase());
      const usernameDoc = await getDoc(usernameRef);

      if (usernameDoc.exists()) {
        Alert.alert("Error", "This username already exists.");
        return;
      }
//123456666666666
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(usernameRef, {
        uid: userCredential.user.uid,
        createdAt: new Date().toISOString()
      });

      await updateProfile(userCredential.user, {
        displayName: username
      });

      Alert.alert("Sucess", "Account created successfully!");
      navigation.goBack(); 
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert("Error", "This email is already being used.");
      } else {
      Alert.alert("Register Error:", error.message);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create an account</Text> 
        <Text style={styles.subtitle}>Register on CampusFlow to follow and update the state of study rooms.</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={colors.textLight}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="words"
        />

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
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={colors.textLight}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <BouncyButton style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </BouncyButton>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
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
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
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
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});