import React, { useState, useEffect, useContext } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeMode } from '../theme/ThemeMode';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import MapScreen from '../screens/MapScreen';
import FeedScreen from '../screens/FeedScreen';
import ReviewScreen from '../screens/ReviewScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen'; 
import AdminScreen from '../screens/AdminScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function HeaderRightActions() {
  const navigation = useNavigation();
  const { isDarkMode, toggleTheme } = useContext(ThemeMode); 

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
      <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 20 }}>
        <Ionicons name={isDarkMode ? "moon" : "sunny"} size={26} color="#FFFFFF" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Ionicons name="person-circle-outline" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

function TabNavigator() {
  const [isAdmin, setIsAdmin] = useState(false);
  const { colors, isDarkMode } = useContext(ThemeMode);

  const insets = useSafeAreaInsets();
  const UNIVERSAL_HEADER_HEIGHT = insets.top + 55;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'fabio@admin.si') {
        setIsAdmin(true); 
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
   <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: isDarkMode ? '#FFFFFF' : colors.primary, 
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.primary, height: UNIVERSAL_HEADER_HEIGHT },
        headerTintColor: '#FFFFFF', 
        headerRight: () => <HeaderRightActions /> 
      }}
    >
     <Tab.Screen 
        name="Feed" 
        component={FeedScreen} 
        options={{ title: 'Study Hub', tabBarIcon: ({ color, size }) => (<Ionicons name="home-outline" size={size} color={color} />) }} 
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ title: 'Map', tabBarIcon: ({ color, size }) => (<Ionicons name="map-outline" size={size} color={color} />) }} 
      />
      {isAdmin && (
        <Tab.Screen 
          name="Admin Dashboard" 
          component={AdminScreen} 
          options={{ title: 'Admin', tabBarIcon: ({ color, size }) => (<MaterialCommunityIcons name="incognito" size={size} color={color} />) }} 
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors } = useContext(ThemeMode);
  const insets = useSafeAreaInsets();
  const UNIVERSAL_HEADER_HEIGHT = insets.top + 55;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerBackButtonDisplayMode: 'minimal', animation: 'none' }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: true,headerTintColor: '#FFFFFF', headerStyle: { backgroundColor : colors.primary} }}/>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ title: 'Profile',
            headerTintColor: '#FFFFFF',
            headerStyle: { backgroundColor: colors.primary, height: UNIVERSAL_HEADER_HEIGHT }
           }} 
        />
        <Stack.Screen name="MainTabs" options= {{headerShown:false}} component={TabNavigator} />
        <Stack.Screen name="AdminScreen" component={AdminScreen} options={{ title: 'Developer Dashboard' , headerShown: false}} />
        <Stack.Screen 
          name="Review" 
          component={ReviewScreen} 
          options={{ title: 'Update Location',
            headerTintColor: '#FFFFFF',
            headerStyle: { backgroundColor: colors.primary, height: UNIVERSAL_HEADER_HEIGHT }
           }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}