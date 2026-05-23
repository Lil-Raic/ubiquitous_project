// src/screens/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  
  const user = auth.currentUser;
  const navigation = useNavigation();

 const handleLogout = async () => {
    try {
      await signOut(auth); 
      
      // 3. O RESET limpa o histórico de navegação de todas as abas e força a app a ir para o Login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível terminar sessão.");
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        {/* Ícone de Perfil */}
        <Ionicons name="person-circle" size={100} color={colors.primary} />
        
        {/* Campo do Nome */}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Nome de Utilizador:</Text>
          <Text style={styles.value}>{user?.displayName || "Estudante FERI"}</Text>
        </View>

        {/* Campo do E-mail */}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>E-mail:</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.surface} />
          <Text style={styles.logoutText}>Terminar Sessão</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: colors.surface,
    width: '100%',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginTop: 20,
  },
  infoContainer: {
    width: '100%',
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
  },
  label: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    color: colors.text,
    marginTop: 5,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444', // Vermelho para destacar a ação de saída
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // Espaço entre o ícone e o texto
    width: '100%', // Faz o botão ocupar a largura do cartão
  },
  logoutText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  }
});