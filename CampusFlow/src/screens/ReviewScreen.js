import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity,  ActivityIndicator, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { colors } from '../theme/colors';

const Library_LAT = 46.5592;
const Library_LON = 15.6427;
const MAX_DISTANCE_METERS = 50;

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

export default function ReviewScreen() {

  const [locationValid, setLocationValid] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States to keep track of the selected options for each metric
  const [noise, setNoise] = useState('Moderate');
  const [crowd, setCrowd] = useState('Medium');
  const [wifi, setWifi] = useState('Good');
  const [outlets, setOutlets] = useState('Available');
  const [lighting, setLighting] = useState('Bright');

  useEffect(() => {
    verifyLocation();
  }, []);

  const verifyLocation = async () => {
    setCheckingLocation(true);
    
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need your location to verify you are on campus.');
      setCheckingLocation(false);
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const userLat = location.coords.latitude;
    const userLon = location.coords.longitude;

    const distance = getDistance(userLat, userLon, Library_LAT, Library_LON);

    if (distance <= MAX_DISTANCE_METERS) {
      setLocationValid(true);
    } else {
      setLocationValid(false);
    }
    setCheckingLocation(false);
  };

  const handleSubmit = async () => {

    console.log("SUBMITED");
    setIsSubmitting(true);
    try {
      // Find the document in the database
      const spotsRef = collection(db, 'study_spots');
      const q = query(spotsRef, where("name", "==", "University of Maribor Library"));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Error", "Library not found in database.");
        setIsSubmitting(false);
        return;
      }

      // Grab the specific ID and push ALL your new metrics
      const libraryDoc = querySnapshot.docs[0];
      const libraryRef = doc(db, 'study_spots', libraryDoc.id);

      await updateDoc(libraryRef, {
        noise: noise,
        crowd: crowd,
        wifi: wifi,
        outlets: outlets,
        lighting: lighting
      });

      Alert.alert("Success!", "Your live update has been posted to the feed.");
    } catch (error) {
      Alert.alert("Error", "Could not submit review.");
      console.error(error);
    }
    setIsSubmitting(false);
  };

  // Helper component to render option buttons row
  const renderOptionRow = (label, currentValue, setValue, options) => (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.optionsRow}>
        {options.map((opt) => {
          const isSelected = currentValue === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
              onPress={() => setValue(opt)}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  if (checkingLocation) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Verifying your campus location...</Text>
      </View>
    );
  }

  if (!locationValid) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorIcon}>🚫</Text>
        <Text style={styles.errorTitle}>Too Far Away</Text>
        <Text style={styles.errorText}>
          You must be within 50 meters of the Library to submit a live update.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={verifyLocation}>
          <Text style={styles.retryButtonText}>Check Location Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Update Study Spot Status</Text>
      <Text style={styles.subtitle}>Help your fellow students by sharing real-time conditions at your current location.</Text>

      {renderOptionRow('🔊 Noise Level', noise, setNoise, ['Quiet', 'Moderate', 'Loud'])}
      {renderOptionRow('👥 Crowdedness', crowd, setCrowd, ['Empty', 'Medium', 'Full'])}
      {renderOptionRow('📶 WiFi Quality', wifi, setWifi, ['Poor', 'Good', 'Excellent'])}
      {renderOptionRow('🔌 Power Outlets', outlets, setOutlets, ['None', 'Few', 'Available'])}
      {renderOptionRow('💡 Lighting Conditions', lighting, setLighting, ['Dim', 'Normal', 'Bright'])}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Live Update</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  },
  optionTextSelected: {
    color: colors.surface,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },

  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  errorIcon: { fontSize: 50, marginBottom: 10 },
  errorTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
  errorText: { fontSize: 16, color: colors.textLight, textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: colors.primary, padding: 12, borderRadius: 8 },
  retryButtonText: { color: 'white', fontWeight: 'bold' },

  contentContainer: { 
    padding: 20,
    paddingBottom: 100 // <-- This pushes the submit button up above the tab bar!
  },
});

