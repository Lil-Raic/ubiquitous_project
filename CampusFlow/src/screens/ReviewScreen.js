import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import * as Location from 'expo-location';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { colors } from '../theme/colors';
import { ThemeMode } from '../theme/ThemeMode';

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

const draftMemory = {};

export default function ReviewScreen({ route, navigation }) {

  const { colors, isDarkMode } = useContext(ThemeMode);
    const styles = getStyles(colors, isDarkMode);

  const targetName = route?.params?.name;
  const targetLat = route?.params?.latitude;
  const targetLon = route?.params?.longitude;
  const lastUpdated = route?.params?.lastUpdated;
  const MAX_DISTANCE_METERS = 50;

  const [locationValid, setLocationValid] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStale, setIsStale] = useState(false);
  
  // Tracks which section is currently open
  const [activeSection, setActiveSection] = useState(null);

  // States start completely empty so we know EXACTLY what the user changed
  const [noise, setNoise] = useState(null);
  const [crowd, setCrowd] = useState(null);
  const [wifi, setWifi] = useState(null);
  const [outlets, setOutlets] = useState(null);
  const [lighting, setLighting] = useState(null);

  useEffect(() => {
    if (targetName) {
      setNoise(draftMemory[targetName]?.noise || null);
      setCrowd(draftMemory[targetName]?.crowd || null);
      setWifi(draftMemory[targetName]?.wifi || null);
      setOutlets(draftMemory[targetName]?.outlets || null);
      setLighting(draftMemory[targetName]?.lighting || null);
      setActiveSection(null);
    }
  }, [targetName]);

  useEffect(() => {
    verifyLocation();
    checkIfDataIsStale();
  }, [targetName, lastUpdated]);

  const checkIfDataIsStale = () => {
    if (lastUpdated) {
      let updateTime;

      if (lastUpdated.toDate) {
        updateTime = lastUpdated.toDate();
      } else if (lastUpdated.seconds) {
        updateTime = new Date(lastUpdated.seconds * 1000);
      } else {
        updateTime = new Date(lastUpdated);
      }
      const hoursDifference = Math.abs(new Date() - updateTime) / 36e5;
      if (hoursDifference >= 2) {
        setIsStale(true);  

        setNoise(null);
        setCrowd(null);
        setWifi(null);
        setOutlets(null);
        setLighting(null);
        setActiveSection(null);
      } else {
        setIsStale(false);
      }
    } else {
      setIsStale(true); 
    }
  }

  const verifyLocation = async () => {
    setCheckingLocation(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need your location to verify you are on campus.');
      setCheckingLocation(false);
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const distance = getDistance(location.coords.latitude, location.coords.longitude, targetLat, targetLon);

    // Using true for testing bypass
    if (distance <= MAX_DISTANCE_METERS) {
      setLocationValid(true);
    } else {
      setLocationValid(false);
    }
    setCheckingLocation(false);
  };

  const saveToMemroy = (key,value, stateSetter) => {
    stateSetter(value);

    if (!draftMemory[targetName]) {
      draftMemory[targetName] = {}
    }

    draftMemory[targetName][key] = value;
  };

  const handleSubmit = async () => {
    // Prevent submitting empty data
    if (!noise && !crowd && !wifi && !outlets && !lighting) {
      Alert.alert("Nothing to update", "Please update at least one condition before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const spotsRef = collection(db, 'study_spots');
      const q = query(spotsRef, where("name", "==", targetName));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Error", "Location not found in database.");
        setIsSubmitting(false);
        return;
      }

      const locationDoc = querySnapshot.docs[0];
      const locationRef = doc(db, 'study_spots', locationDoc.id);

      const payload = { lastUpdated: serverTimestamp() };
      if (noise) payload.noise = noise;
      if (crowd) payload.crowd = crowd;
      if (wifi) payload.wifi = wifi;
      if (outlets) payload.outlets = outlets;
      if (lighting) payload.lighting = lighting;

      await updateDoc(locationRef, payload);

      delete draftMemory[targetName];
      setNoise(null); setCrowd(null); setWifi(null); setOutlets(null); setLighting(null);
      setActiveSection(null);

      Alert.alert("Success!", "Your live update has been posted to the feed.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Could not submit review.");
      console.error(error);
    }
    setIsSubmitting(false);
  };

  const renderAccordion = (key, label, currentValue, setValue, options, paramValue) => {
    const isActive = activeSection === key;
    

    const displayValue = currentValue ? currentValue : (isStale ? "Unknown" : (paramValue || "Unknown"));

    return (
      <View style={styles.section}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.sectionLabel}>{label}</Text>
            <Text style={[styles.currentValueText, displayValue === 'Unknown' && { color: colors.textLight, fontStyle: 'italic' }]}>
              {displayValue}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.updateButtonSmall}
            onPress={() => setActiveSection(isActive ? null : key)}
          >
            <Text style={styles.updateButtonSmallText}>{isActive ? 'Cancel' : 'Update'}</Text>
          </TouchableOpacity>
        </View>

        {isActive && (
          <View style={styles.optionsRow}>
            {options.map((opt) => {
              const isSelected = currentValue === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                  onPress={() => {
                    setValue(opt);
                    setActiveSection(null); 
                  }}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  if (!targetName || !targetLat || !targetLon) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Location Missing</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <Text style={styles.errorText}>You must be within 50 meters of {targetName}.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={verifyLocation}>
          <Text style={styles.retryButtonText}>Check Location Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>{targetName}</Text>
      
      {(noise || crowd || wifi || outlets || lighting) ? (
        <Text style={[styles.subtitle, { color: colors.primary, fontWeight: 'bold' }]}>
          Drafting live update...
        </Text>
      ) : isStale ? (
        <Text style={[styles.subtitle, { color: '#D97706', fontWeight: 'bold' }]}>
          Current data is unknown. Be the first to update!
        </Text>
      ) : (
        <Text style={styles.subtitle}>Help your fellow students by sharing real-time conditions.</Text>
      )}

      {/* Passing the key, label, state, setter, options array, and the old route parameter */}
      {renderAccordion('noise', '🔊 Noise Level', noise, setNoise, ['Quiet', 'Moderate', 'Loud'], route?.params?.noise)}
      {renderAccordion('crowd', '👥 Crowdedness', crowd, setCrowd, ['Empty', 'Medium', 'Full'], route?.params?.crowd)}
      {renderAccordion('wifi', '📶 WiFi Quality', wifi, setWifi, ['Poor', 'Good', 'Excellent'], route?.params?.wifi)}
      {renderAccordion('outlets', '🔌 Power Outlets', outlets, setOutlets, ['None', 'Few', 'Available'], route?.params?.outlets)}
      {renderAccordion('lighting', '💡 Lighting Conditions', lighting, setLighting, ['Dim', 'Normal', 'Bright'], route?.params?.lighting)}

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.surface} />
        ) : (
          <Text style={styles.submitButtonText}>Submit Live Update</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { padding: 20, paddingBottom: 150 }, // Massive cushion here fixes the tab bar cut-off!
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textLight, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  section: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  
  // Accordion Specific Styles
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  currentValueText: { fontSize: 15, color: colors.primary, marginTop: 4, fontWeight: '500' },
  updateButtonSmall: { backgroundColor: colors.background, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  updateButtonSmallText: { color: colors.primary, fontWeight: 'bold', fontSize: 13 },
  
  optionsRow: { flexDirection: 'row', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  optionButton: { flex: 1, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  optionButtonSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { fontSize: 14, fontWeight: '500', color: colors.textLight },
  optionTextSelected: { color: colors.surface, fontWeight: 'bold' },
  
  submitButton: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  submitButtonText: { color: colors.surface, fontSize: 16, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, color: colors.textLight },
  errorIcon: { fontSize: 50, marginBottom: 10 },
  errorTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
  errorText: { fontSize: 16, color: colors.textLight, textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: colors.primary, padding: 12, borderRadius: 8 },
  retryButtonText: { color: 'white', fontWeight: 'bold' },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: isDarkMode ? colors.text : colors.primary, 
    marginBottom: 6, 
    textAlign: 'center' 
  },
});