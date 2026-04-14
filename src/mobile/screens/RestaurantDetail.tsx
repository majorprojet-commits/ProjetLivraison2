import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { ArrowLeft, Star, Clock, Plus, ShoppingCart } from 'lucide-react-native';
import { Seller } from '../types';

interface RestaurantDetailProps {
  restaurant: Seller;
  onBack: () => void;
  onAddToCart: (item: any) => void;
}

const MENU_ITEMS = [
  { id: 'm1', name: 'Classic Cheeseburger', price: 8.99, description: 'Bœuf, cheddar, salade, tomate, sauce maison', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80' },
  { id: 'm2', name: 'Double Bacon Burger', price: 11.99, description: 'Double bœuf, double bacon, cheddar', image: 'https://images.unsplash.com/photo-1594212202875-86ac4ce40b6b?auto=format&fit=crop&w=200&q=80' },
  { id: 'm3', name: 'Frites Maison', price: 3.50, description: 'Portion généreuse de frites croustillantes', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=200&q=80' },
];

export default function RestaurantDetail({ restaurant, onBack, onAddToCart }: RestaurantDetailProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Image source={{ uri: restaurant.image }} style={styles.heroImage} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.ratingBox}>
              <Star size={14} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.ratingText}>{restaurant.rating}</Text>
            </View>
            <Text style={styles.metaText}>{restaurant.time} • {restaurant.fee}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          {MENU_ITEMS.map(item => (
            <View key={item.id} style={styles.menuItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.itemPrice}>{item.price.toFixed(2)} €</Text>
              </View>
              <View style={styles.itemRight}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <TouchableOpacity 
                  style={styles.addBtn}
                  onPress={() => onAddToCart(item)}
                >
                  <Plus size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.cartBar}>
        <View style={styles.cartInfo}>
          <ShoppingCart size={20} color="#fff" />
          <Text style={styles.cartText}>Voir le panier</Text>
        </View>
        <Text style={styles.cartTotal}>0.00 €</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { height: 200, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  backBtn: { position: 'absolute', top: 40, left: 20, zIndex: 10, backgroundColor: '#fff', padding: 8, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  content: { flex: 1, marginTop: -20, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  infoSection: { marginBottom: 24 },
  name: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 14, fontWeight: 'bold', color: '#92400e' },
  metaText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  menuSection: { marginBottom: 100 },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 16 },
  menuItem: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  itemInfo: { flex: 1, paddingRight: 12 },
  itemName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  itemDesc: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  itemPrice: { fontSize: 15, fontWeight: '900', color: '#8b5cf6' },
  itemRight: { position: 'relative' },
  itemImage: { width: 80, height: 80, borderRadius: 12 },
  addBtn: { position: 'absolute', bottom: -8, right: -8, backgroundColor: '#8b5cf6', padding: 6, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  cartBar: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#8b5cf6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 20, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
  cartInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  cartTotal: { color: '#fff', fontWeight: '900', fontSize: 16 }
});
