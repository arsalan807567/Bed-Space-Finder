import React from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Linking, Share, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen({ route, navigation }) {
  const { listing } = route.params;

  function openWhatsApp() {
    const message = `Hi! I saw your listing "${listing.title}" on Bed Space Finder. Is it still available?`;
    Linking.openURL(`https://wa.me/${listing.whatsapp}?text=${encodeURIComponent(message)}`);
  }

  async function shareListing() {
    await Share.share({
      message: `Check out this listing on Bed Space Finder!\n\n${listing.title}\n📍 ${listing.area}\n💰 AED ${listing.price}/month\n\nContact: https://wa.me/${listing.whatsapp}`,
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {listing.images?.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {listing.images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.image} />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🏠</Text>
          </View>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{listing.title}</Text>
            <TouchableOpacity onPress={shareListing}>
              <Text style={styles.shareBtn}>↗️ Share</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.price}>AED {listing.price}<Text style={styles.perMonth}>/month</Text></Text>
          <Text style={styles.area}>📍 {listing.area}</Text>

          <View style={styles.tagsRow}>
            <View style={styles.tag}><Text style={styles.tagText}>🛏 {listing.room_type}</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>👤 {listing.gender_preference || 'Any'}</Text></View>
            <View style={[styles.tag, listing.furnished ? styles.tagGreen : styles.tagRed]}>
              <Text style={styles.tagText}>{listing.furnished ? '✅ Furnished' : '❌ Unfurnished'}</Text>
            </View>
          </View>

          {listing.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About This Space</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Area</Text>
              <Text style={styles.detailValue}>{listing.area}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{listing.room_type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Preferred For</Text>
              <Text style={styles.detailValue}>{listing.gender_preference || 'Anyone'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Furnished</Text>
              <Text style={styles.detailValue}>{listing.furnished ? 'Yes' : 'No'}</Text>
            </View>
            {listing.available_from && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Available From</Text>
                <Text style={styles.detailValue}>{listing.available_from}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <LinearGradient colors={['transparent', '#0A1628']} style={styles.bottomGradient}>
        <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <Text style={styles.whatsappText}>💬 Contact on WhatsApp</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1628' },
  image: { width, height: 280, resizeMode: 'cover' },
  imagePlaceholder: { height: 280, backgroundColor: '#1E3A5F', justifyContent: 'center', alignItems: 'center' },
  placeholderEmoji: { fontSize: 80 },
  backButton: { position: 'absolute', top: 50, left: 16, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  backText: { color: '#FFFFFF', fontSize: 14 },
  content: { padding: 20, paddingBottom: 100 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', flex: 1, marginRight: 8 },
  shareBtn: { color: '#FFD700', fontSize: 14 },
  price: { fontSize: 28, fontWeight: 'bold', color: '#FFD700', marginBottom: 4 },
  perMonth: { fontSize: 16, color: '#8BA7C7' },
  area: { fontSize: 15, color: '#8BA7C7', marginBottom: 16 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag: { backgroundColor: '#1E3A5F', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagGreen: { backgroundColor: '#1A6B3C' },
  tagRed: { backgroundColor: '#4A1020' },
  tagText: { color: '#FFFFFF', fontSize: 13 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFD700', marginBottom: 10 },
  description: { color: '#C0D5E8', fontSize: 14, lineHeight: 22 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E3A5F' },
  detailLabel: { color: '#8BA7C7', fontSize: 14 },
  detailValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  bottomGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 20, paddingBottom: 30, paddingHorizontal: 20 },
  whatsappButton: { backgroundColor: '#25D366', borderRadius: 14, height: 54, justifyContent: 'center', alignItems: 'center' },
  whatsappText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
