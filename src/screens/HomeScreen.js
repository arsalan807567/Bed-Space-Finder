import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import ListingCard from '../components/ListingCard';

const AREAS = ['All', 'Deira', 'Bur Dubai', 'Al Barsha', 'JVC', 'Dubai Marina', 'Sharjah', 'Ajman'];
const BUDGETS = ['All', 'Under 1000', '1000-2000', '2000-3500', '3500+'];

export default function HomeScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('All');

  useEffect(() => { fetchListings(); }, [selectedArea, selectedBudget]);

  async function fetchListings() {
    setLoading(true);
    let query = supabase.from('listings').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (selectedArea !== 'All') query = query.eq('area', selectedArea);
    if (selectedBudget === 'Under 1000') query = query.lt('price', 1000);
    else if (selectedBudget === '1000-2000') query = query.gte('price', 1000).lte('price', 2000);
    else if (selectedBudget === '2000-3500') query = query.gte('price', 2000).lte('price', 3500);
    else if (selectedBudget === '3500+') query = query.gt('price', 3500);
    const { data } = await query;
    setListings(data || []);
    setLoading(false);
  }

  const filtered = listings.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A1628', '#1E3A5F']} style={styles.header}>
        <Text style={styles.headerTitle}>🏠 Bed Space Finder</Text>
        <Text style={styles.headerSub}>Dubai & UAE</Text>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search area or title..."
            placeholderTextColor="#8BA7C7"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {AREAS.map(area => (
          <TouchableOpacity
            key={area}
            style={[styles.filterChip, selectedArea === area && styles.filterChipActive]}
            onPress={() => setSelectedArea(area)}>
            <Text style={[styles.filterChipText, selectedArea === area && styles.filterChipTextActive]}>
              {area}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {BUDGETS.map(budget => (
          <TouchableOpacity
            key={budget}
            style={[styles.filterChip, selectedBudget === budget && styles.filterChipActive]}
            onPress={() => setSelectedBudget(budget)}>
            <Text style={[styles.filterChipText, selectedBudget === budget && styles.filterChipTextActive]}>
              💰 {budget}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ListingCard listing={item} onPress={() => navigation.navigate('ListingDetail', { listing: item })} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No listings found</Text>
              <Text style={styles.emptySubText}>Be the first to post in this area!</Text>
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
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFD700' },
  headerSub: { fontSize: 14, color: '#8BA7C7', marginBottom: 12 },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#0A1628',
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, height: 44, color: '#FFFFFF', fontSize: 15 },
  filterRow: { paddingHorizontal: 12, paddingVertical: 8, maxHeight: 52 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1E3A5F',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2E5A8F',
  },
  filterChipActive: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  filterChipText: { color: '#8BA7C7', fontSize: 13 },
  filterChipTextActive: { color: '#0A1628', fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  emptySubText: { color: '#8BA7C7', fontSize: 14, marginTop: 8 },
});
