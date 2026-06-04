import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors } from '../theme/colors';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useIsFocused } from '@react-navigation/native';

export default function MapScreen({ navigation }) {
  const isFocused = useIsFocused();

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [spots, setSpots] = useState([]);
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
          {spots.map((spot) => (
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
                  lastUpdated: spot.lastUpdated
                });
              }}
            />
          ))}
        </MapView>
        ) : null
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