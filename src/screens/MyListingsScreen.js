import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ListingCard from '../components/ListingCard';

export default function MyListingsScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { fetchMyListings(); }, []));

  async function fetchMyListings() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setListings(data || []);
    setLoading(false);
  }

  async function toggleActive(listing) {
    await supabase.from('listings').update({ is_active: !listing.is_active }).eq('id', listing.id);
    fetchMyListings();
  }

  async function deleteListing(id) {
    Alert.alert('Delete Listing', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await supabase.from('listings').delete().eq('id', id);
          fetchMyListings();
        }
      }
    ]);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A1628', '#1E3A5F']} style={styles.header}>
        <Text style={styles.headerTitle}>📋 My Listings</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View>
              <ListingCard listing={item} onPress={() => navigation.navigate('ListingDetail', { listing: item })} />
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, item.is_active ? styles.deactivateBtn : styles.activateBtn]}
                  onPress={() => toggleActive(item)}>
                  <Text style={styles.actionText}>{item.is_active ? '⏸ Deactivate' : '▶️ Activate'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => deleteListing(item.id)}>
                  <Text style={styles.actionText}>🗑 Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No listings yet</Text>
              <Text style={styles.emptySubText}>Post your first listing!</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFD700' },
  logoutBtn: { backgroundColor: '#4A1020', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  logoutText: { color: '#FF6B6B', fontSize: 13 },
  actions: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: -4, marginBottom: 8 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  activateBtn: { backgroundColor: '#1A6B3C' },
  deactivateBtn: { backgroundColor: '#2E5A8F' },
  deleteBtn: { backgroundColor: '#4A1020' },
  actionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  emptySubText: { color: '#8BA7C7', fontSize: 14, marginTop: 8 },
});
