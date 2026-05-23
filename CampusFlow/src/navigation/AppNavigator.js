// src/navigation/AppNavigator.js
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Ícones nativos do Expo
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';


// Import all screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import MapScreen from '../screens/MapScreen';
import FeedScreen from '../screens/FeedScreen';
import ReviewScreen from '../screens/ReviewScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen'; // Novo
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function ProfileButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      // Navega diretamente para a página ao clicar!
      onPress={() => navigation.navigate('Profile')} 
      style={{ marginRight: 15 }}
    >
      <Ionicons name="person-circle-outline" size={32} color={colors.surface} />
    </TouchableOpacity>
  );
  }



function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.surface,
        headerRight: () => <ProfileButton />
      }}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'Study Hub' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Study Spots Map' }} />
      {/* 2. ADD THE REVIEW SCREEN TAB */}
      <Tab.Screen name="Review" component={ReviewScreen} options={{ title: 'Update Spot' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ headerShown: true, title: 'Criar Conta', headerStyle: { backgroundColor: colors.primary }, headerTintColor: colors.surface }} 
        />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Meu Perfil', headerStyle: { backgroundColor: colors.primary }, headerTintColor: colors.surface }} />
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}