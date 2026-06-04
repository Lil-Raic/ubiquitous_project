import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { ThemeMode } from '../theme/ThemeMode';

export default function FeedScreen() {
  const navigation = useNavigation();
  
  const { colors, isDarkMode } = useContext(ThemeMode);
  const styles = getStyles(colors, isDarkMode);
  
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
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

  const renderSpotCard = ({ item }) => {
    const stale = isDataStale(item.lastUpdated);

    const displayNoise = stale ? "Unknown" : (item.noise || "Unknown");
    const displayCrowd = stale ? "Unknown" : (item.crowd || "Unknown");
    const displayWifi = stale ? "Unknown" : (item.wifi || "Unknown");
    const displayOutlets = stale ? "Unknown" : (item.outlets || "Unknown");
    const displayLighting = stale ? "Unknown" : (item.lighting || "Unknown");

    const safeTimestamp = item.lastUpdated ? 
      (item.lastUpdated.toDate ? item.lastUpdated.toDate().toISOString() : item.lastUpdated) 
      : null;

    return (
      <View style={styles.card}>
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

        <TouchableOpacity 
          style={styles.viewButton} 
          onPress={() => navigation.navigate('Review', {
            name: item.name, 
            latitude: item.latitude || 46.5592, 
            longitude: item.longitude || 15.6427, 
            lastUpdated: safeTimestamp, 
            noise: displayNoise, 
            crowd: displayCrowd,
            wifi: displayWifi,
            outlets: displayOutlets,
            lighting: displayLighting
          })}
        >
          <Text style={styles.viewButtonText}>View/Update Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
      />
    </View>
  );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 16,
  },
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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  spotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusTag: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  spotZone: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
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
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  viewButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#FFFFFF', 
    fontWeight: '600',
    fontSize: 14,
  },
});