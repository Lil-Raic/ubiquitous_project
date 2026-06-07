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

// Configures the default behavior for push notifications, telling the device OS to display banners and play sounds even if the app is actively open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ProfileScreen() {
  // Initializes navigation, grabs the current Firebase user profile, and applies the global theme settings
  const user = auth.currentUser;
  const navigation = useNavigation();
  const { colors, isDarkMode } = useContext(ThemeMode);
  const styles = getStyles(colors, isDarkMode);

  // Automatically prompts the user for OS-level permission to send push notifications when this screen loads
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

  // Safely severs the Firebase authentication session and forces the user back to the primary login screen
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

  // Triggers a confirmation dialog before permanently purging the user's account and associated database records from Firebase
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

  // Executes a local push notification instantly by bypassing interval rules, serving as a hardware test for the Expo notifications library
  const triggerNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎓 CampusFlow Alert!",
          body: "Notifications are working! This is a test alert to confirm you will receive important updates about your study spaces.",
          sound: true,
        },
        trigger: null, 
      });
    } catch (error) {
      Alert.alert("Notification Error", error.message);
      console.log("Notification Error:", error);
    }
  };

  // Renders the user interface wrapped in a flexible scroll container to prevent clipping on smaller devices
  return (
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
          <Text style={styles.notifyText}>Enable Notification</Text>
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

// Maps styling attributes and structural geometry dynamically based on the active color scheme
const getStyles = (colors, isDarkMode) => StyleSheet.create({
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