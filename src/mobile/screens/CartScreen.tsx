'use client';

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react-native';

interface CartScreenProps {
  cart: any[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemove: (cartId: string) => void;
  onCheckout: () => void;
  onBack: () => void;
}

export default function CartScreen({ cart, onUpdateQuantity, onRemove, onCheckout, onBack }: CartScreenProps) {
  const total = cart.reduce((sum, item) => sum + (item.finalPrice * (item.quantity || 1)), 0);

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ShoppingCart size={64} color="#cbd5e1" />
        <Text style={styles.emptyText}>Votre panier est vide</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Retour au menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Panier</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.itemList}>
        {cart.map((item) => (
          <View key={item.cartId} style={styles.itemCard}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              {Object.values(item.selectedChoices || {}).map((choice: any) => (
                <Text key={choice.id} style={styles.itemChoice}>• {choice.name}</Text>
              ))}
              <Text style={styles.itemPrice}>{item.finalPrice.toFixed(2)}€</Text>
            </View>
            <View style={styles.quantityControls}>
              <View style={styles.qtyRow}>
                <TouchableOpacity onPress={() => onUpdateQuantity(item.cartId, -1)} style={styles.qtyBtn}>
                  <Minus size={14} color="#64748b" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity || 1}</Text>
                <TouchableOpacity onPress={() => onUpdateQuantity(item.cartId, 1)} style={styles.qtyBtn}>
                  <Plus size={14} color="#8b5cf6" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => onRemove(item.cartId)} style={styles.removeBtn}>
                <Trash2 size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total.toFixed(2)}€</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
          <Text style={styles.checkoutButtonText}>Commander ({total.toFixed(2)}€)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
  itemList: { flex: 1, padding: 16 },
  itemCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  itemImage: { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
  itemChoice: { fontSize: 10, color: '#64748b', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '900', color: '#8b5cf6', marginTop: 4 },
  quantityControls: { alignItems: 'flex-end', gap: 10 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 10, padding: 4, gap: 10 },
  qtyBtn: { width: 24, height: 24, backgroundColor: '#fff', borderRadius: 8, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  qtyText: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', minWidth: 16, textAlign: 'center' },
  removeBtn: { padding: 4 },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#64748b' },
  totalValue: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
  checkoutButton: { backgroundColor: '#8b5cf6', padding: 16, borderRadius: 16, alignItems: 'center' },
  checkoutButtonText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#64748b', marginTop: 20, marginBottom: 20 },
  backButton: { backgroundColor: '#8b5cf6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backButtonText: { color: '#fff', fontWeight: '800' }
});
