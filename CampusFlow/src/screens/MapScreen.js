import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors } from '../theme/colors';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useIsFocused } from '@react-navigation/native';

export default function MapScreen({ navigation }) {
  // Manages screen visibility status to prevent background memory leaks, alongside local state for GPS and database items
  const isFocused = useIsFocused();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [spots, setSpots] = useState([]);

  // Requests device location permissions on load and establishes a real-time listener to fetch all study spots from Firebase
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();

    const spotsRef = collection(db, 'study_spots');
    const unsubscribe = onSnapshot(spotsRef, (snapshot) => {
      const spotsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSpots(spotsList);
    });

    return () => unsubscribe();
  }, []);

  // Evaluates database timestamps to determine if a location's crowd/noise data is older than 2 hours
  const isDataStale = (lastUpdated) => {
    if (!lastUpdated) return true;
    let updateTime;
    
    if (lastUpdated.toDate) {
      updateTime = lastUpdated.toDate();
    } else if (lastUpdated.seconds) {
      updateTime = new Date(lastUpdated.seconds * 1000);
    } else {
      updateTime = new Date(lastUpdated);
    } 
    const hoursDifference = Math.abs(new Date() - updateTime) / 36e5;

    return hoursDifference >= 2; 
  };

  // Displays a loading indicator while waiting for the device's GPS hardware to return coordinates
  if (!location && !errorMsg) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.textLight }}>Finding your location...</Text>
      </View>
    );
  }

  // Renders the interactive map natively, plotting database markers and formatting their payloads before navigating to the Review screen
  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        isFocused ? (
        <MapView
          style={styles.map}
          showsUserLocation={true} 
          zoomControlEnabled={true}
          initialRegion={{
            latitude: location ? location.latitude : 46.5622,
            longitude: location ? location.longitude : 15.6380,
            latitudeDelta: 0.005, 
            longitudeDelta: 0.005,
          }}
        >
          {spots.map((spot) => {
            const stale = isDataStale(spot.lastUpdated);

            const displayNoise = stale ? "Unknown" : (spot.noise || "Unknown");
            const displayCrowd = stale ? "Unknown" : (spot.crowd || "Unknown");
            const displayWifi = stale ? "Unknown" : (spot.wifi || "Unknown");
            const displayOutlets = stale ? "Unknown" : (spot.outlets || "Unknown");
            const displayLighting = stale ? "Unknown" : (spot.lighting || "Unknown");

            const safeTimestamp = spot.lastUpdated ? 
              (spot.lastUpdated.toDate ? spot.lastUpdated.toDate().toISOString() : spot.lastUpdated) 
              : null;

            return (
              <Marker
                key={spot.id}
                coordinate={{ 
                  latitude: parseFloat(spot.latitude), 
                  longitude: parseFloat(spot.longitude)
                }}
                title={spot.name}
                description="Tap here to view reviews"
                pinColor={colors.primary}
                onCalloutPress={() => {
                  navigation.navigate('Review', {
                    name: spot.name,
                    latitude: parseFloat(spot.latitude),
                    longitude: parseFloat(spot.longitude),
                    lastUpdated: safeTimestamp,
                    noise: displayNoise,
                    crowd: displayCrowd,
                    wifi: displayWifi,
                    outlets: displayOutlets,
                    lighting: displayLighting,
                    mode: 'view'
                  });
                }}
              />
            );
          })}
        </MapView>
        ) : null
      )}
    </View>
  );
}

// Basic structural styling ensuring the map takes up the full screen height and width
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    color: 'red',
    fontSize: 16,
  },
});