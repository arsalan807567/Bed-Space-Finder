import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import ListingCard from '../components/ListingCard';

export default function AdminScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  useFocusEffect(useCallback(() => { fetchAllListings(); }, []));

  async function fetchAllListings() {
    setLoading(true);
    const { data } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    const all = data || [];
    setListings(all);
    setStats({
      total: all.length,
      active: all.filter(l => l.is_active).length,
      inactive: all.filter(l => !l.is_active).length,
    });
    setLoading(false);
  }

  async function toggleActive(listing) {
    await supabase.from('listings').update({ is_active: !listing.is_active }).eq('id', listing.id);
    fetchAllListings();
  }

  async function deleteListing(id) {
    Alert.alert('Delete Listing', 'Permanently delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await supabase.from('listings').delete().eq('id', id);
          fetchAllListings();
        }
      }
    ]);
  }

  async function deleteAllInactive() {
    Alert.alert('Delete All Inactive', 'Delete all inactive listings?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All', style: 'destructive', onPress: async () => {
          await supabase.from('listings').delete().eq('is_active', false);
          fetchAllListings();
        }
      }
    ]);
  }

  const filtered = listings.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A1628', '#1E3A5F']} style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Admin Panel</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#4CAF50' }]}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#FF6B6B' }]}>{stats.inactive}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
        </View>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search listings..."
            placeholderTextColor="#8BA7C7"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </LinearGradient>

      <TouchableOpacity style={styles.dangerBtn} onPress={deleteAllInactive}>
        <Text style={styles.dangerText}>🗑 Delete All Inactive Listings</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View>
              <View style={[styles.statusBadge, item.is_active ? styles.activeBadge : styles.inactiveBadge]}>
                <Text style={styles.statusText}>{item.is_active ? '🟢 Active' : '🔴 Inactive'}</Text>
              </View>
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
              <Text style={styles.emptyText}>No listings found</Text>
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
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFD700', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: 'bold', color: '#FFD700' },
  statLabel: { fontSize: 12, color: '#8BA7C7', marginTop: 2 },
  searchBox: { backgroundColor: '#0A1628', borderRadius: 12, paddingHorizontal: 12 },
  searchInput: { height: 44, color: '#FFFFFF', fontSize: 15 },
  dangerBtn: { backgroundColor: '#4A1020', marginHorizontal: 16, marginVertical: 8, padding: 12, borderRadius: 10, alignItems: 'center' },
  dangerText: { color: '#FF6B6B', fontWeight: '600' },
  statusBadge: { marginHorizontal: 16, marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  activeBadge: { backgroundColor: '#1A6B3C' },
  inactiveBadge: { backgroundColor: '#4A1020' },
  statusText: { color: '#FFFFFF', fontSize: 12 },
  actions: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: -4, marginBottom: 8 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  activateBtn: { backgroundColor: '#1A6B3C' },
  deactivateBtn: { backgroundColor: '#2E5A8F' },
  deleteBtn: { backgroundColor: '#4A1020' },
  actionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#FFFFFF', fontSize: 18 },
});
