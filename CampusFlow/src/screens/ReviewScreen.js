// src/screens/ReviewScreen.js
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../theme/colors';

export default function ReviewScreen() {
  // States to keep track of the selected options for each metric
  const [noise, setNoise] = useState('Moderate');
  const [crowd, setCrowd] = useState('Medium');
  const [wifi, setWifi] = useState('Good');
  const [outlets, setOutlets] = useState('Available');
  const [lighting, setLighting] = useState('Bright');

  const handleSubmit = () => {
    Alert.alert(
      "Review Submitted!",
      `Thank you for keeping FERI updated!\n\nNoise: ${noise}\nCrowd: ${crowd}\nWiFi: ${wifi}\nOutlets: ${outlets}\nLighting: ${lighting}`
    );
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
});