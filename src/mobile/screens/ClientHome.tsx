import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { Search, MapPin, Star, Clock } from 'lucide-react-native';
import { Seller, Category } from '../types';

const CATEGORIES: Category[] = [
  { id: 1, name: 'Burgers', icon: '🍔' },
  { id: 2, name: 'Pizza', icon: '🍕' },
  { id: 3, name: 'Sushi', icon: '🍣' },
  { id: 4, name: 'Tacos', icon: '🌮' },
  { id: 5, name: 'Salades', icon: '🥗' },
];

const SELLERS: Seller[] = [
  { id: 'r1', name: 'Burger & Co', rating: 4.8, time: '20-30 min', fee: '2.99€', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
  { id: 'r2', name: 'Sushi Master', rating: 4.9, time: '35-45 min', fee: 'Gratuit', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80' },
  { id: 'r3', name: 'Pizza Napoli', rating: 4.6, time: '25-40 min', fee: '1.49€', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80' },
];

export default function ClientHome({ onPressRestaurant }: { onPressRestaurant: (seller: Seller) => void }) {
  return (
    <View style={styles.container}>
      {/* Location Header */}
      <View style={styles.header}>
        <MapPin size={16} color="#8b5cf6" />
        <Text style={styles.locationText}>Paris, France</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#94a3b8" />
        <TextInput 
          placeholder="Restaurants, plats ou courses" 
          style={styles.searchInput}
          placeholderTextColor="#94a3b8"
        />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>À la une</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Voir tout</Text></TouchableOpacity>
        </View>

        {SELLERS.map(seller => (
          <TouchableOpacity 
            key={seller.id} 
            style={styles.sellerCard}
            onPress={() => onPressRestaurant(seller)}
          >
            <Image source={{ uri: seller.image }} style={styles.sellerImage} />
            <View style={styles.sellerInfo}>
              <View style={styles.sellerRow}>
                <Text style={styles.sellerName}>{seller.name}</Text>
                <View style={styles.ratingBox}>
                  <Star size={12} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.ratingText}>{seller.rating}</Text>
                </View>
              </View>
              <View style={styles.sellerMeta}>
                <Clock size={12} color="#94a3b8" />
                <Text style={styles.metaText}>{seller.time} • {seller.fee}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  locationText: { fontWeight: 'bold', fontSize: 14 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', padding: 12, borderRadius: 16, gap: 10, marginBottom: 20 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500' },
  categoriesScroll: { marginBottom: 24 },
  categoryCard: { alignItems: 'center', marginRight: 20 },
  categoryIcon: { fontSize: 32, marginBottom: 4 },
  categoryName: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '900' },
  seeAll: { color: '#8b5cf6', fontWeight: 'bold', fontSize: 12 },
  sellerCard: { marginBottom: 20, borderRadius: 20, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  sellerImage: { width: '100%', height: 160 },
  sellerInfo: { padding: 12 },
  sellerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sellerName: { fontSize: 16, fontWeight: '900' },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#92400e' },
  sellerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#94a3b8', fontWeight: '500' }
});
