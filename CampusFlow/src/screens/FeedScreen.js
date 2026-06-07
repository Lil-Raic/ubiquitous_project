import React, { useState, useEffect, useContext, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, Image, Animated } from 'react-native';
import * as Location from 'expo-location';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { ThemeMode } from '../theme/ThemeMode';
import { LiftButton, StaggeredCard } from '../theme/UiAnimations'; 

export default function FeedScreen() {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useContext(ThemeMode);
  const styles = getStyles(colors, isDarkMode);
  
  // State variables handling UI rendering, loading screens, and external data
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  
  // Animation hooks for the expanding and retracting weather recommendation banner
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;

  // Primary effect hook that requests GPS permissions, fetches API weather data, and syncs Firebase study spots
  useEffect(() => {
    const fetchDynamicWeather = async () => {
      try {
        let lat = 46.5592; 
        let lon = 15.6427;

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          lat = location.coords.latitude;
          lon = location.coords.longitude;
        }

        const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY; 
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        const data = await response.json();
        
        if (data.main) {
          const condition = data.weather[0].main;
          const isBad = ['Rain', 'Snow', 'Thunderstorm', 'Drizzle', 'Clouds'].includes(condition);

          setWeather({
            temp: Math.round(data.main.temp),
            condition: condition,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
            city: data.name,
            isBadWeather: isBad,
            message: isBad 
              ? `🌧️ Bad weather in ${data.name}. We recommend staying indoors today!` 
              : `☀️ Nice weather in ${data.name}! Great day for outdoor spots.`
          });

          Animated.parallel([
            Animated.timing(dropdownHeight, { toValue: 40, duration: 400, useNativeDriver: false }),
            Animated.timing(dropdownOpacity, { toValue: 1, duration: 400, useNativeDriver: false })
          ]).start();

          setTimeout(() => {
            Animated.parallel([
              Animated.timing(dropdownHeight, { toValue: 0, duration: 400, useNativeDriver: false }),
              Animated.timing(dropdownOpacity, { toValue: 0, duration: 400, useNativeDriver: false })
            ]).start();
          }, 5000);
        }
      } catch (error) {
        console.log("Could not fetch weather data:", error);
      }
    };

    fetchDynamicWeather();

    const spotsRef = collection(db, 'study_spots');

    const unsubscribe = onSnapshot(spotsRef, (snapshot) => {
      const spotsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSpots(spotsList);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    }
  }, []);

  // Helper function verifying if a study spot's data is older than 2 hours to reset stats to "Unknown"
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

  // Header component displaying live weather data and the animated dropdown notification
  const renderHeader = () => {
    if (!weather) return null;
    return (
      <View style={{ marginBottom: 16 }}>
        <View style={styles.weatherCard}>
          <View>
            <Text style={styles.weatherCity}>{weather.city} Area</Text>
            <Text style={styles.weatherDesc}>{weather.condition} • {weather.temp}°C</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginRight: 8 }}>{weather.isBadWeather ? '☁️' : '☀️'}</Text>
            <Image source={{ uri: weather.icon }} style={styles.weatherIcon} />
          </View>
        </View>

        <Animated.View style={[styles.weatherDropdown, { height: dropdownHeight, opacity: dropdownOpacity }]}>
          <Text style={styles.dropdownText}>{weather.message}</Text>
        </Animated.View>
      </View>
    );
  };

  // Renders the visual card for each individual study spot, including logic to visually highlight recommended locations based on weather
  const renderSpotCard = ({ item, index }) => {
    const stale = isDataStale(item.lastUpdated);

    const displayNoise = stale ? "Unknown" : (item.noise || "Unknown");
    const displayCrowd = stale ? "Unknown" : (item.crowd || "Unknown");
    const displayWifi = stale ? "Unknown" : (item.wifi || "Unknown");
    const displayOutlets = stale ? "Unknown" : (item.outlets || "Unknown");
    const displayLighting = stale ? "Unknown" : (item.lighting || "Unknown");

    const safeTimestamp = item.lastUpdated ? 
      (item.lastUpdated.toDate ? item.lastUpdated.toDate().toISOString() : item.lastUpdated) 
      : null;

    let isRecommended = false;
    if (weather) {
      if (weather.isBadWeather && item.indoors) isRecommended = true;
      if (!weather.isBadWeather && item.outdoors) isRecommended = true;
    }

    return (
      <StaggeredCard index={index}>
        <View style={[styles.card, isRecommended && { borderColor: colors.primary, borderWidth: 2 }]}>
          
          {isRecommended && (
            <View style={styles.recommendationBadge}>
              <Text style={styles.recommendationText}>
                {weather?.isBadWeather ? '☁️ Best for Ugly Days' : '☀️ Great for Sunny Days'}
              </Text>
            </View>
          )}

          <View style={styles.cardHeader}>
            <Text style={styles.spotName}>{item.name}</Text>
            <Text style={[styles.statusTag, { color: item.status === 'Open' ? '#10B981' : '#EF4444' }]}>
              {item.status || 'Open'}
            </Text>
          </View>
          
          <Text style={styles.spotZone}>{item.zone}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>🔊 Noise:</Text>
              <Text style={[styles.statValue, stale && { color: colors.textLight, fontStyle: 'italic' }]}>
                {displayNoise}
              </Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>👥 Crowdedness:</Text>
              <Text style={[styles.statValue, stale && { color: colors.textLight, fontStyle: 'italic' }]}>
                {displayCrowd}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}> 
            <LiftButton 
              style={[styles.actionButton, styles.viewOnlyButton]} 
              onPress={() => navigation.navigate('Review', {
                name: item.name, 
                latitude: item.latitude || 46.5592, 
                longitude: item.longitude || 15.6427, 
                lastUpdated: safeTimestamp, 
                noise: displayNoise, 
                crowd: displayCrowd,
                wifi: displayWifi,
                outlets: displayOutlets,
                lighting: displayLighting,
                mode: 'view'
              })}
            >
              <Text style={styles.viewOnlyText}>View Details</Text>
            </LiftButton>

            <LiftButton 
              style={[styles.actionButton, styles.updateButton]} 
              onPress={() => navigation.navigate('Review', {
                name: item.name, 
                latitude: item.latitude || 46.5592, 
                longitude: item.longitude || 15.6427, 
                lastUpdated: safeTimestamp, 
                noise: displayNoise, 
                crowd: displayCrowd,
                wifi: displayWifi,
                outlets: displayOutlets,
                lighting: displayLighting,
                mode: 'edit' 
              })}
            >
              <Text style={styles.updateText}>Update Stats</Text>
            </LiftButton>
          </View>
        </View>
      </StaggeredCard>
    );
  };

  // Main UI returns either a loading spinner or the FlatList containing the feed of study spots
  if (loading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.textLight }}>Connecting to the database...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={spots}
        renderItem={renderSpotCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
      />
    </View>
  );
}

// Styling definitions linking UI elements to the central light/dark theme tokens
const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 16,
  },
  weatherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2, 
  },
  weatherCity: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  weatherDesc: { fontSize: 15, color: '#E0F2FE', fontWeight: '500' },
  weatherIcon: { width: 50, height: 50 },
  weatherDropdown: {
    backgroundColor: isDarkMode ? '#333333' : '#F1F5F9',
    marginHorizontal: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  dropdownText: { fontSize: 12, color: colors.textLight, fontStyle: 'italic', fontWeight: '600' },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.3 : 0.05, 
    shadowRadius: 4,
    elevation: 2,
    borderWidth: isDarkMode ? 1 : 0, 
    borderColor: colors.border,
    overflow: 'hidden',
  },
  recommendationBadge: {
    backgroundColor: colors.background,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recommendationText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  spotName: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  statusTag: { fontWeight: 'bold', fontSize: 14 },
  spotZone: { fontSize: 14, color: colors.textLight, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBadge: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
  },
  statLabel: { fontSize: 12, color: colors.textLight },
  statValue: { fontSize: 12, fontWeight: '600', color: colors.text },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 }, 
  actionButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' }, 
  viewOnlyButton: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary }, 
  viewOnlyText: { color: colors.primary, fontWeight: '700', fontSize: 14 }, 
  updateButton: { backgroundColor: colors.primary, borderWidth: 1.5, borderColor: colors.primary }, 
  updateText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 }, 
});