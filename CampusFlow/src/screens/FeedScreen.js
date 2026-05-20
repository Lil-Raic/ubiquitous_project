// src/screens/FeedScreen.js
import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

// Sample data representing the FERI study spaces
const STUDY_SPOTS_DATA = [
  { id: '1', name: 'FERI Library', zone: 'A-Building, 1st Floor', noise: 'Quiet', crowd: '45% Full', status: 'Open' },
  { id: '2', name: 'Campus Cafe', zone: 'G-Building, Ground Floor', noise: 'Loud / Social', crowd: '90% Full', status: 'Open' },
  { id: '3', name: 'G-201 Computer Lab', zone: 'G-Building, 2nd Floor', noise: 'Moderate', crowd: '20% Full', status: 'Open' },
  { id: '4', name: 'Main Hallway Lounge', zone: 'A-Building, Entrance', noise: 'Loud', crowd: '75% Full', status: 'Open' },
];

export default function FeedScreen() {
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

      <TouchableOpacity style={styles.viewButton}>
        <Text style={styles.viewButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={STUDY_SPOTS_DATA}
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