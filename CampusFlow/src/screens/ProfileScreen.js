import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { auth, db } from '../config/firebase';
import { deleteUser, signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ThemeMode } from '../theme/ThemeMode';
import { doc, deleteDoc } from 'firebase/firestore';


export default function ProfileScreen() {
  const user = auth.currentUser;
  const navigation = useNavigation();
  
  const { colors, isDarkMode } = useContext(ThemeMode);
  const styles = getStyles(colors, isDarkMode);

  const handleLogout = async () => {
    try {
      await signOut(auth); 
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert("Error", "Unable log out.");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? You won't be able to get it back.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            const user = auth.currentUser;
            if (!user) return;

            try {
              if (user.displayName) {
                const cleanUsername = user.displayName.trim().toLowerCase();
                const usernameRef = doc(db, 'usernames', cleanUsername);
                await deleteDoc(usernameRef);
              }

              await deleteUser(user);
              
              await signOut(auth);

              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });

            } catch (error) {
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  "Security", 
                  "For safety reasons, log out and log in again please to be able to proceed."
                );
              } else {
                Alert.alert("Error", "It was not possible to delete this account: " + error.message);
              }
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Ionicons name="person-circle-outline" size={100} color={isDarkMode ? '#FFFFFF' : colors.primary} />
        
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{user?.displayName || "Student"}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#EF4444', marginTop: 40 }]} 
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
          <Text style={[styles.logoutText, { color: '#EF4444' }]}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
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
    shadowOpacity: isDarkMode ? 0.3 : 0.1, 
    shadowRadius: 8,
    marginTop: 20,
    borderWidth: isDarkMode ? 1 : 0, 
    borderColor: colors.border,
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
    backgroundColor: '#EF4444', 
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, 
    width: '100%', 
  },
  logoutText: {
    color: '#FFFFFF', 
    fontSize: 16,
    fontWeight: 'bold',
  }
});