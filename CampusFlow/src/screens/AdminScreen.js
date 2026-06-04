import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  FlatList, Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ThemeMode } from '../theme/ThemeMode';

export default function AdminScreen() {
  const { colors, isDarkMode } = useContext(ThemeMode);
  const styles = getStyles(colors, isDarkMode);

  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newName, setNewName] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLon, setNewLon] = useState('');

  useEffect(() => {
    const spotsRef = collection(db, 'study_spots');
    const unsubscribe = onSnapshot(spotsRef, (snapshot) => {
      const spotsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSpots(spotsList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddSpot = async () => {
    if (!newName || !newLat || !newLon) {
      Alert.alert("Missing Info", "Please fill out all fields to add a building.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'study_spots'), {
        name: newName,
        latitude: parseFloat(newLat),
        longitude: parseFloat(newLon),
        status: 'Open',
        noise: 'Unknown',
        crowd: 'Unknown',
        wifi: 'Unknown',
        outlets: 'Unknown',
        lighting: 'Unknown',
        lastUpdated: null 
      });

      Alert.alert("Success", `${newName} has been added to the database!`);
      setNewName(''); setNewLat(''); setNewLon('');
    } catch (error) {
      Alert.alert("Error", "Could not add building.");
      console.error(error);
    }
    setIsSubmitting(false);
  };

  const handleDeleteSpot = (id, name) => {
    Alert.alert(
      "Delete Building?",
      `Are you sure you want to permanently delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'study_spots', id));
            } catch (error) {
              Alert.alert("Error", "Could not delete building.");
            }
          }
        }
      ]
    );
  };

  const renderAddForm = () => (
    <View>
      <Text style={styles.mainTitle}>Developer Dashboard</Text>
      <Text style={styles.subtitle}>Manage campus locations and database entries.</Text>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>📍 Add New Location</Text>
        
        <Text style={styles.inputLabel}>Building Name</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Engineering Faculty" 
          placeholderTextColor={colors.textLight}
          value={newName} 
          onChangeText={setNewName} 
        />
        
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.inputLabel}>Latitude</Text>
            <TextInput 
              style={styles.input} 
              placeholder="46.5592" 
              placeholderTextColor={colors.textLight}
              keyboardType="numeric" 
              value={newLat} 
              onChangeText={(text) => setNewLat(text.replace(/[^0-9.-]/g, ''))}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.inputLabel}>Longitude</Text>  
            <TextInput 
              style={styles.input} 
              placeholder="15.6427" 
              placeholderTextColor={colors.textLight}
              keyboardType="numeric" 
              value={newLon} 
              onChangeText={(text) => setNewLon(text.replace(/[^0-9.-]/g, ''))}
            />
          </View>
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={handleAddSpot} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.addButtonText}>+ Add to Database</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAdminCard = ({ item }) => (
    <View style={styles.dbCard}>
      <View style={styles.dbCardInfo}>
        <Text style={styles.spotName}>{item.name}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSpot(item.id, item.name)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1, backgroundColor: colors.background }} size="large" color={colors.primary} />;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <FlatList
        data={spots}
        renderItem={renderAdminCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderAddForm()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No locations in database.</Text>}
      />
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContainer: { padding: 16, paddingBottom: 40 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 6, textAlign: 'center', marginTop: 10 },
  subtitle: { fontSize: 14, color: colors.textLight, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  formCard: { 
    backgroundColor: colors.surface, 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 24, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: isDarkMode ? 0.3 : 0.05, 
    shadowRadius: 6, 
    elevation: 3,
    borderWidth: isDarkMode ? 1 : 0,
    borderColor: colors.border
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.textLight, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, padding: 14, borderRadius: 10, fontSize: 15, color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  addButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  addButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  dbCard: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  dbCardInfo: { flex: 1, paddingRight: 10 },
  spotName: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  deleteButton: { backgroundColor: '#FEE2E2', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#FCA5A5' },
  deleteButtonText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },
  emptyText: { textAlign: 'center', color: colors.textLight, marginTop: 20, fontStyle: 'italic' },
  mainTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: isDarkMode ? colors.text : colors.primary,
    marginBottom: 6, 
    textAlign: 'center', 
    marginTop: 10 
  },
});