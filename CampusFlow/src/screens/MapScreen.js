// src/screens/MapScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors } from '../theme/colors';

// Coordenadas estáticas dos pontos de estudo (Focadas na zona da FERI Maribor)
const STUDY_SPOTS = [
  { id: '1', name: 'Biblioteca (Glavna Knjižnica)', lat: 46.5622, lng: 15.6380, description: 'Muito silenciosa. Ideal para focar.' },
  { id: '2', name: 'Café do Campus', lat: 46.5615, lng: 15.6392, description: 'Ruído moderado. Bom para brainstorming.' },
  { id: '3', name: 'Computer Lab (G-201)', lat: 46.5628, lng: 15.6375, description: 'Tomadas por todo o lado e PCs rápidos.' },
  { id: '4', name: 'Study Room 4', lat: 46.5630, lng: 15.6388, description: 'Sala privada. Reservável.' },
];

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getInitialLocation() {
      // 1. Pedir permissão para aceder ao GPS
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos do GPS para mostrar os spots perto de ti.');
        setLoading(false);
        return;
      }

      // 2. Ir buscar a localização atual do telemóvel
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      setLoading(false);
    }

    getInitialLocation();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>A carregar o mapa do Campus...</Text>
      </View>
    );
  }

  // Se não conseguir a localização, centra o mapa por defeito na FERI Maribor
  const defaultRegion = {
    latitude: location ? location.latitude : 46.5620,
    longitude: location ? location.longitude : 15.6385,
    latitudeDelta: 0.005, // Define o Zoom do mapa
    longitudeDelta: 0.005,
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={defaultRegion}
        showsUserLocation={true} // Mostra a bola azul do utilizador
        followsUserLocation={true}
      >
        {/* Desenhar os marcadores dos Spots de Estudo */}
        {STUDY_SPOTS.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.lat, longitude: spot.lng }}
            title={spot.name}
            description={spot.description}
            pinColor={colors.primary} // Usa o azul do vosso design token
          />
        ))}

        {/* Exemplo de Geofencing Visual: Raio de 50 metros à volta da Biblioteca */}
        {location && (
          <Circle
            center={{ latitude: 46.5622, longitude: 15.6380 }}
            radius={50} // 50 metros
            strokeColor="rgba(0, 85, 164, 0.5)"
            fillColor="rgba(0, 85, 164, 0.2)"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    color: colors.textLight,
    fontSize: 16,
  },
});