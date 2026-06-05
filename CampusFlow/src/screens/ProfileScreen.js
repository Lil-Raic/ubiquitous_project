import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { auth, db } from '../config/firebase';
import { deleteUser, signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ThemeMode } from '../theme/ThemeMode';
import { doc, deleteDoc } from 'firebase/firestore';

import { BouncyButton } from '../theme/UiAnimations';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// 1. Tell the OS how to handle notifications (Show alert and play sound)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ProfileScreen() {
  const user = auth.currentUser;
  const navigation = useNavigation();
  
  const { colors, isDarkMode } = useContext(ThemeMode);
  const styles = getStyles(colors, isDarkMode);

  // 2. Request Notification Permissions when screen loads
  useEffect(() => {
    async function requestPermissions() {
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.log('Permission for notifications was denied');
        }
      }
    }
    requestPermissions();
  }, []);

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

  // 3. The function that schedules the push notification
  const triggerNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🎓 FERI CampusFlow Alert!",
        body: "The G-201 Computer Lab just got quieter. Great time to study!",
        sound: true,
      },
      trigger: { seconds: 3 }, // Drops 3 seconds after clicking
    });
    Alert.alert("Alert Scheduled!", "Swipe up to go to your iPhone home screen RIGHT NOW to watch it drop down.");
  };

  return (
    // Replaced the strict View with a ScrollView and used contentContainerStyle
    <ScrollView 
      contentContainerStyle={styles.scrollContainer} 
      showsVerticalScrollIndicator={false}
    >
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
        
        <BouncyButton style={styles.notifyButton} onPress={triggerNotification}>
          <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          <Text style={styles.notifyText}>Test Library Alert</Text>
        </BouncyButton>
        
        <BouncyButton style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
          <Text style={styles.logoutText}>Log out</Text>
        </BouncyButton>

        <BouncyButton 
          style={[styles.logoutButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#EF4444', marginTop: 20 }]} 
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
          <Text style={[styles.logoutText, { color: '#EF4444' }]}>Delete Account</Text>
        </BouncyButton>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  // Switched to flexGrow so it expands dynamically when scrolling
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  notifyButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981', 
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, 
    width: '100%', 
  },
  notifyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444', 
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
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