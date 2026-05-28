import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection , onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

export default function FeedScreen() {
  const navigation = useNavigation();

  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const spotsRef = collection (db,'study_spots');

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

  // This helper function creates individual cards for each spot
  const renderSpotCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.spotName}>{item.name}</Text>
        <Text style={[styles.statusTag, { color: item.status === 'Open' ? '#10B981' : '#EF4444' }]}>
          {item.status}
        </Text>
      </View>
      
      <Text style={styles.spotZone}>{item.zone}</Text>
      
      {/* Row of quick indicators */}
      <View style={styles.statsRow}>
        <View style={styles.statBadge}>
          <Text style={styles.statLabel}>🔊 Noise:</Text>
          <Text style={styles.statValue}>{item.noise}</Text>
        </View>
        <View style={styles.statBadge}>
          <Text style={styles.statLabel}>👥 Crowdedness:</Text>
          <Text style={styles.statValue}>{item.crowd}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate('Review')}>
        <Text style={styles.viewButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style = {[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size = "large" color = {colors.primary} />
        <Text style= {{ marginTop: 10, color: colors.textLight }}>Connecting to the database...</Text>
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

const styles = StyleSheet.create({
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    color: colors.surface,
    fontWeight: '600',
    fontSize: 14,
  },
});