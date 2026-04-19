import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Switch, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

const AREAS = ['Deira', 'Bur Dubai', 'Al Barsha', 'JVC', 'Dubai Marina', 'Al Nahda', 'Discovery Gardens', 'International City', 'Sharjah', 'Ajman'];
const ROOM_TYPES = ['Bed Space', 'Private Room', 'Studio', 'Partition Room'];
const GENDERS = ['Any', 'Male Only', 'Female Only', 'Family Only'];

export default function PostListingScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('');
  const [price, setPrice] = useState('');
  const [roomType, setRoomType] = useState('');
  const [gender, setGender] = useState('Any');
  const [furnished, setFurnished] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImages(result.assets.map(a => a.uri));
    }
  }

  async function uploadImages(userId) {
    const urls = [];
    for (const uri of images) {
      const fileName = `${userId}/${Date.now()}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const { data, error } = await supabase.storage
        .from('room-images')
        .upload(fileName, blob, { contentType: 'image/jpeg' });
      if (!error) {
        const { data: urlData } = supabase.storage.from('room-images').getPublicUrl(fileName);
        urls.push(urlData.publicUrl);
      }
    }
    return urls;
  }

  async function handleSubmit() {
    if (!title || !area || !price || !roomType || !whatsapp) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    const imageUrls = images.length > 0 ? await uploadImages(user.id) : [];
    const { error } = await supabase.from('listings').insert({
      user_id: user.id,
      title,
      description,
      area,
      price: parseInt(price),
      room_type: roomType,
      gender_preference: gender,
      furnished,
      whatsapp,
      images: imageUrls,
      is_active: true,
    });
    if (error) { setError(error.message); }
    else {
      setSuccess(true);
      setTitle(''); setDescription(''); setArea('');
      setPrice(''); setRoomType(''); setWhatsapp(''); setImages([]);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A1628', '#1E3A5F']} style={styles.header}>
        <Text style={styles.headerTitle}>➕ Post a Listing</Text>
      </LinearGradient>

      <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 40 }}>
        {success && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✅ Listing posted successfully!</Text>
          </View>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Title *</Text>
        <TextInput style={styles.input} placeholder="e.g. Clean bed space in Deira" placeholderTextColor="#8BA7C7" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Describe the room, facilities, rules..." placeholderTextColor="#8BA7C7" value={description} onChangeText={setDescription} multiline numberOfLines={4} />

        <Text style={styles.label}>Area *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {AREAS.map(a => (
            <TouchableOpacity key={a} style={[styles.chip, area === a && styles.chipActive]} onPress={() => setArea(a)}>
              <Text style={[styles.chipText, area === a && styles.chipTextActive]}>{a}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Room Type *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {ROOM_TYPES.map(r => (
            <TouchableOpacity key={r} style={[styles.chip, roomType === r && styles.chipActive]} onPress={() => setRoomType(r)}>
              <Text style={[styles.chipText, roomType === r && styles.chipTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Gender Preference</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {GENDERS.map(g => (
            <TouchableOpacity key={g} style={[styles.chip, gender === g && styles.chipActive]} onPress={() => setGender(g)}>
              <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Monthly Price (AED) *</Text>
        <TextInput style={styles.input} placeholder="e.g. 1200" placeholderTextColor="#8BA7C7" value={price} onChangeText={setPrice} keyboardType="numeric" />

        <Text style={styles.label}>WhatsApp Number *</Text>
        <TextInput style={styles.input} placeholder="e.g. 971501234567" placeholderTextColor="#8BA7C7" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" />

        <View style={styles.switchRow}>
          <Text style={styles.label}>Furnished</Text>
          <Switch value={furnished} onValueChange={setFurnished} trackColor={{ true: '#FFD700' }} thumbColor="#FFFFFF" />
        </View>

        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>📷 Add Photos ({images.length} selected)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#0A1628" /> : <Text style={styles.submitText}>Post Listing</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFD700' },
  form: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  label: { color: '#8BA7C7', fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2E5A8F',
  },
  textArea: { height: 100, paddingTop: 12, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', marginBottom: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#1E3A5F',
    marginRight: 8, borderWidth: 1, borderColor: '#2E5A8F',
  },
  chipActive: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  chipText: { color: '#8BA7C7', fontSize: 13 },
  chipTextActive: { color: '#0A1628', fontWeight: 'bold' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  imageButton: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2E5A8F',
    borderStyle: 'dashed',
  },
  imageButtonText: { color: '#8BA7C7', fontSize: 15 },
  submitButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: { color: '#0A1628', fontSize: 16, fontWeight: 'bold' },
  successBox: { backgroundColor: '#1A6B3C', borderRadius: 12, padding: 16, marginBottom: 16 },
  successText: { color: '#FFFFFF', textAlign: 'center', fontSize: 15 },
  error: { backgroundColor: '#4A1020', color: '#FF6B6B', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
});
