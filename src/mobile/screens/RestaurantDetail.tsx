'use client';

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLeft, Star, Plus, ShoppingCart, XCircle, Info, Clock, Check } from 'lucide-react-native';
import { Seller } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface RestaurantDetailProps {
  restaurant: Seller;
  onBack: () => void;
  cart: any[];
  onAddToCart: (item: any, choices?: Record<string, any>) => void;
  onViewCart: () => void;
}

export default function RestaurantDetail({ restaurant, onBack, cart, onAddToCart, onViewCart }: RestaurantDetailProps) {
  const [customizingItem, setCustomizingItem] = useState<any>(null);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, any>>({});

  const handleItemPress = (item: any) => {
    if (item.available === false) return;
    if (item.options && item.options.length > 0) {
      setCustomizingItem(item);
      const initialChoices: Record<string, any> = {};
      item.options.forEach((opt: any) => {
        if (opt.required && opt.choices.length > 0) {
          initialChoices[opt.id] = opt.choices[0];
        }
      });
      setSelectedChoices(initialChoices);
    } else {
      onAddToCart(item);
    }
  };

  const toggleChoice = (option: any, choice: any) => {
    if (option.required) {
      setSelectedChoices({ ...selectedChoices, [option.id]: choice });
    } else {
      const current = selectedChoices[option.id];
      if (current?.id === choice.id) {
        const newChoices = { ...selectedChoices };
        delete newChoices[option.id];
        setSelectedChoices(newChoices);
      } else {
        setSelectedChoices({ ...selectedChoices, [option.id]: choice });
      }
    }
  };

  const total = cart.reduce((sum, item) => sum + item.finalPrice, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Image source={{ uri: restaurant.image }} style={styles.heroImage} />
      </View>

      <ScrollView style={styles.content}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.infoSection}
        >
          <View style={styles.nameRow}>
            <Text style={styles.name}>{restaurant.name}</Text>
            <TouchableOpacity style={styles.infoBtn}>
              <Info size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.ratingBox}>
              <Star size={14} color="#fbbf24" fill="#fbbf24" />
              <Text style={styles.ratingText}>{restaurant.rating}</Text>
            </View>
            <View style={styles.timeBadge}>
              <Clock size={14} color="#8b5cf6" />
              <Text style={styles.timeBadgeText}>
                {restaurant.deliveryTime || restaurant.time}
              </Text>
            </View>
            <Text style={styles.metaText}>{restaurant.deliveryFee !== undefined ? `${restaurant.deliveryFee} FCFA` : restaurant.fee}</Text>
          </View>
        </motion.div>

        <View style={styles.menuSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Menu</Text>
            <View style={styles.sectionLine} />
          </View>
          
          {(!restaurant.menu || restaurant.menu.length === 0) ? (
            <View style={styles.emptyMenu}>
              <ShoppingCart size={48} color="#94a3b8" />
              <Text style={styles.emptyMenuText}>Aucun plat disponible pour le moment.</Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {restaurant.menu.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TouchableOpacity 
                    style={[styles.menuItem, item.available === false && { opacity: 0.5 }]}
                    onPress={() => handleItemPress(item)}
                    disabled={item.available === false}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                      <Text style={styles.itemPrice}>{item.price.toLocaleString()} FCFA</Text>
                      {item.available === false && (
                        <View style={styles.soldOutBadge}>
                          <Text style={styles.soldOutText}>ÉPUISÉ</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.itemRight}>
                      <Image source={{ uri: item.image }} style={styles.itemImage} />
                      <AnimatePresence>
                        <motion.div 
                          whileTap={{ scale: 0.9 }}
                          style={{
                            ...styles.addBtn,
                            ...(item.available === false ? { backgroundColor: '#94a3b8' } : {})
                          }}
                        >
                          <Plus size={20} color="#fff" />
                        </motion.div>
                      </AnimatePresence>
                    </View>
                  </TouchableOpacity>
                </motion.div>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Customization Modal */}
      {customizingItem && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{customizingItem.name}</Text>
              <TouchableOpacity onPress={() => setCustomizingItem(null)}>
                <XCircle size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.optionsList}>
              {customizingItem.options.map((opt: any) => (
                <View key={opt.id} style={styles.optionSection}>
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionName}>{opt.name}</Text>
                    {opt.required && <Text style={styles.requiredBadge}>Obligatoire</Text>}
                  </View>
                  <View style={styles.choicesGrid}>
                    {opt.choices.map((choice: any) => (
                      <TouchableOpacity 
                        key={choice.id} 
                        style={[
                          styles.choiceItem,
                          selectedChoices[opt.id]?.id === choice.id && styles.choiceSelected
                        ]}
                        onPress={() => toggleChoice(opt, choice)}
                      >
                        <Text style={[
                          styles.choiceName,
                          selectedChoices[opt.id]?.id === choice.id && styles.choiceTextSelected
                        ]}>{choice.name}</Text>
                        {choice.priceExtra > 0 && (
                          <Text style={styles.choicePrice}>+{choice.priceExtra.toLocaleString()} FCFA</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.confirmBtn}
              onPress={() => {
                onAddToCart(customizingItem, selectedChoices);
                setCustomizingItem(null);
                setSelectedChoices({});
              }}
            >
              <Text style={styles.confirmBtnText}>Ajouter au panier</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {cart.length > 0 && (
        <TouchableOpacity 
          style={styles.cartBar} 
          onPress={onViewCart}
        >
          <View style={styles.cartInfo}>
            <ShoppingCart size={20} color="#fff" />
            <Text style={styles.cartText}>Voir le panier ({cart.length})</Text>
          </View>
          <Text style={styles.cartTotal}>{total.toLocaleString()} FCFA</Text>
        </TouchableOpacity>
      )}
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
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  name: { fontSize: 28, fontWeight: '900', color: '#1e293b' },
  infoBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  ratingText: { fontSize: 14, fontWeight: 'bold', color: '#92400e' },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f5f3ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  timeBadgeText: { color: '#8b5cf6', fontSize: 13, fontWeight: '700' },
  metaText: { fontSize: 14, color: '#64748b', fontWeight: '700' },
  menuSection: { marginBottom: 120 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#1e293b' },
  sectionLine: { flex: 1, height: 2, backgroundColor: '#f1f5f9', borderRadius: 1 },
  emptyMenu: { py: 80, alignItems: 'center', opacity: 0.4 },
  emptyMenuText: { marginTop: 16, fontWeight: '500', fontStyle: 'italic', color: '#64748b' },
  menuItem: { flexDirection: 'row', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  itemInfo: { flex: 1, paddingRight: 16 },
  itemName: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  itemDesc: { fontSize: 13, color: '#64748b', lineHeight: 18, marginBottom: 10 },
  itemPrice: { fontSize: 16, fontWeight: '900', color: '#000' },
  soldOutBadge: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#fef2f2', px: 8, py: 2, borderRadius: 4 },
  soldOutText: { color: '#ef4444', fontSize: 10, fontWeight: '800' },
  itemRight: { position: 'relative' },
  itemImage: { width: 90, height: 90, borderRadius: 20 },
  addBtn: { position: 'absolute', bottom: -8, right: -8, backgroundColor: '#000', padding: 8, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 5 },
  cartBar: { position: 'absolute', bottom: 30, left: 16, right: 16, backgroundColor: '#8b5cf6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderRadius: 24, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 },
  cartInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cartText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  cartTotal: { color: '#fff', fontWeight: '900', fontSize: 16 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 100 },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  optionsList: { marginBottom: 24 },
  optionSection: { marginBottom: 24 },
  optionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  optionName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  requiredBadge: { backgroundColor: '#fef3c7', color: '#92400e', fontSize: 10, fontWeight: 'black', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, textTransform: 'uppercase' },
  choicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choiceItem: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc', alignItems: 'center' },
  choiceSelected: { borderColor: '#8b5cf6', backgroundColor: '#f5f3ff' },
  choiceName: { fontSize: 14, fontWeight: 'bold', color: '#64748b' },
  choiceTextSelected: { color: '#8b5cf6' },
  choicePrice: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  confirmBtn: { backgroundColor: '#8b5cf6', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
