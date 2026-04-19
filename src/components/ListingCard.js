import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function ListingCard({ listing, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {listing.images?.[0] ? (
        <Image source={{ uri: listing.images[0] }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>🏠</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.area}>📍 {listing.area}</Text>
        <Text style={styles.price}>AED {listing.price}/month</Text>
        <View style={styles.tags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{listing.room_type}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{listing.gender_preference || 'Any'}</Text>
          </View>
          {listing.furnished && (
            <View style={[styles.tag, styles.furnishedTag]}>
              <Text style={styles.tagText}>Furnished</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  image: { width: '100%', height: 180 },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#2E5A8F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 48 },
  info: { padding: 12 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  area: { fontSize: 13, color: '#8BA7C7', marginBottom: 4 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#FFD700', marginBottom: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: '#2E5A8F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  furnishedTag: { backgroundColor: '#1A6B3C' },
  tagText: { color: '#FFFFFF', fontSize: 11 },
});
