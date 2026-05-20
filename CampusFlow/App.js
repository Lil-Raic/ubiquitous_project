import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, SafeAreaView } from 'react-native';
import { signUpUser } from './src/backend/authService';

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = function() {
    signUpUser(email,password,name);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput 
        style={styles.input} 
        placeholder="Enter Test Name" 
        value={name}
        onChangeText={setName}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Enter Test Email" 
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Enter Test Password" 
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="TEST THE DATABASE" onPress={handleSignUp} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }
});