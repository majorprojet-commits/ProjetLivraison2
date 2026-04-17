'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { Search, MapPin, Star, Clock, Filter, SlidersHorizontal } from 'lucide-react-native';
import { Seller, Category } from '../types';
import { RestaurantSkeleton } from '../../components/ui/Skeleton';
import { motion } from 'motion/react';

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
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState('Localisation...');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await fetch('/api/sellers', {
          headers: { 'Authorization': 'Bearer dev-token' }
        });
        if (response.ok) {
          const data = await response.json();
          setSellers(data);
          setFilteredSellers(data);
        }
      } catch (error) {
        console.error('Fetch sellers error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSellers();

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, we'd use reverse geocoding here
          // For now, let's just show the coordinates or a mock city based on coords
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          
          // Try to get a more friendly name if possible (mocking reverse geocoding)
          try {
            console.log(`[Geo] Attempting reverse geocoding for ${latitude}, ${longitude}`);
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
              headers: { 'User-Agent': 'AI-Studio-App/1.0.0' }
            });
            if (res.ok) {
              const data = await res.json();
              if (data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.suburb;
                const road = data.address.road;
                setLocation(road ? `${road}, ${city || ''}` : city || 'Ma position');
              }
            } else {
              console.warn('[Geo] Reverse geocoding failed with status:', res.status);
            }
          } catch (e) {
            console.warn('[Geo] Reverse geocoding fetch error:', e);
          }
        },
        (error) => {
          console.error('Location error:', error);
          setLocation('Paris, France'); // Fallback
        }
      );
    }
  }, []);

  useEffect(() => {
    let filtered = [...sellers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(query) || 
        (s.type && s.type.toLowerCase().includes(query)) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(query)))
      );
    }

    if (selectedCategory) {
      const category = CATEGORIES.find(c => c.id === selectedCategory);
      if (category) {
        filtered = filtered.filter(s => 
          s.type?.toLowerCase().includes(category.name.toLowerCase()) ||
          s.tags?.some(t => t.toLowerCase().includes(category.name.toLowerCase()))
        );
      }
    }

    setFilteredSellers(filtered);
  }, [searchQuery, selectedCategory, sellers]);

  return (
    <View style={styles.container}>
      {/* Location Header */}
      <View style={styles.header}>
        <MapPin size={16} color="#8b5cf6" />
        <Text style={styles.locationText}>{location}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#94a3b8" />
        <TextInput 
          placeholder="Restaurants, plats ou cuisines" 
          style={styles.searchInput}
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Effacer</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[
                styles.categoryCard,
                selectedCategory === cat.id && styles.categoryCardSelected
              ]}
              onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            >
              <View style={[
                styles.categoryIconBg,
                selectedCategory === cat.id && styles.categoryIconBgSelected
              ]}>
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
              </View>
              <Text style={[
                styles.categoryName,
                selectedCategory === cat.id && styles.categoryNameSelected
              ]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Populaires</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularScroll}>
          {sellers.slice(0, 4).map((seller) => (
            <TouchableOpacity 
              key={`pop-${seller.id}`} 
              style={styles.popularCard}
              onPress={() => onPressRestaurant(seller)}
            >
              <Image source={{ uri: seller.image }} style={styles.popularImage} />
              <View style={styles.popularInfo}>
                <Text style={styles.popularName} numberOfLines={1}>{seller.name}</Text>
                <View style={styles.popularMeta}>
                  <Star size={12} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.popularRating}>{seller.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>À la une</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Voir tout</Text></TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={{ gap: 16 }}>
            {[1, 2, 3].map(i => (
              <RestaurantSkeleton key={i} />
            ))}
          </View>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredSellers.length === 0 ? (
              <View style={styles.emptyResults}>
                <Search size={48} color="#e2e8f0" />
                <Text style={styles.emptyResultsText}>Aucun restaurant trouvé</Text>
              </View>
            ) : (
              filteredSellers.map((seller, index) => (
                <motion.div
                  key={seller.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TouchableOpacity 
                    style={styles.sellerCard}
                    onPress={() => onPressRestaurant(seller)}
                  >
                    <Image source={{ uri: seller.image }} style={styles.sellerImage} />
                    <View style={styles.ratingBadge}>
                      <Star size={14} color="#fbbf24" fill="#fbbf24" />
                      <Text style={styles.ratingBadgeText}>{seller.rating}</Text>
                    </View>
                    <View style={styles.sellerInfo}>
                      <View style={styles.sellerRow}>
                        <Text style={styles.sellerName}>{seller.name}</Text>
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{seller.type || 'Restaurant'}</Text>
                        </View>
                      </View>
                      <View style={styles.sellerMeta}>
                        <Clock size={14} color="#94a3b8" />
                        <Text style={styles.metaText}>
                          {seller.deliveryTime || '20-30'} min • {seller.deliveryFee && parseFloat(seller.deliveryFee) > 0 ? `${seller.deliveryFee} €` : 'Livraison gratuite'}
                        </Text>
                      </View>
                      {seller.tags && seller.tags.length > 0 && (
                        <View style={styles.tagsRow}>
                          {seller.tags.slice(0, 3).map((tag, i) => (
                            <View key={i} style={styles.miniTag}>
                              <Text style={styles.miniTagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
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
  categoryCardSelected: { },
  categoryIconBg: { width: 60, height: 60, backgroundColor: '#f8fafc', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  categoryIconBgSelected: { backgroundColor: '#f5f3ff', borderColor: '#8b5cf6' },
  categoryIcon: { fontSize: 28 },
  categoryName: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  categoryNameSelected: { color: '#8b5cf6' },
  popularScroll: { marginBottom: 32, paddingLeft: 4 },
  popularCard: { width: 160, marginRight: 16, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9' },
  popularImage: { width: '100%', height: 100 },
  popularInfo: { padding: 12 },
  popularName: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  popularMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  popularRating: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
  seeAll: { color: '#8b5cf6', fontWeight: 'bold', fontSize: 13 },
  emptyResults: { padding: 40, alignItems: 'center' },
  emptyResultsText: { marginTop: 16, fontSize: 16, color: '#94a3b8', fontWeight: 'bold' },
  sellerCard: { 
    marginBottom: 20, 
    borderRadius: 24, 
    overflow: 'hidden', 
    backgroundColor: '#fff', 
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 3,
    position: 'relative'
  },
  sellerImage: { width: '100%', height: 180 },
  sellerInfo: { padding: 16 },
  sellerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sellerName: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  tag: { backgroundColor: '#f5f3ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { color: '#7c3aed', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  sellerMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  metaText: { fontSize: 13, color: '#64748b', fontVariant: ['tabular-nums'] },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  miniTag: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  miniTagText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  ratingBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#1e293b' }
});
