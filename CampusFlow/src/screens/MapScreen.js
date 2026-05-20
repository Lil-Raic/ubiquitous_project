// src/screens/MapScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors } from '../theme/colors';

// Hardcoded study spots around the FERI Maribor campus
const STUDY_SPOTS = [
  { id: '1', title: 'FERI Library', description: 'Quiet study zone', latitude: 46.5622, longitude: 15.6380 },
  { id: '2', title: 'Campus Cafe', description: 'Good for group work', latitude: 46.5615, longitude: 15.6392 },
  { id: '3', title: 'G-201 Computer Lab', description: 'High-performance PCs', latitude: 46.5628, longitude: 15.6375 },
];

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      // 1. Request GPS permissions from the user
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // 2. Get the user's current location
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();
  }, []);

  // Show a loading spinner while waiting for the GPS
  if (!location && !errorMsg) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.textLight }}>Finding your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <MapView
          style={styles.map}
          showsUserLocation={true} // Displays the blue dot for the user
          initialRegion={{
            latitude: location ? location.latitude : 46.5622,
            longitude: location ? location.longitude : 15.6380,
            latitudeDelta: 0.005, // Controls the zoom level
            longitudeDelta: 0.005,
          }}
        >
          {/* Loop through our study spots and place pins on the map */}
          {STUDY_SPOTS.map((spot) => (
            <Marker
              key={spot.id}
              coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
              title={spot.title}
              description={spot.description}
              pinColor={colors.primary}
            />
          ))}
        </MapView>
      )}
    </View>
  );
}

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