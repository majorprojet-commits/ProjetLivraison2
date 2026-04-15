import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLeft, Star, Clock, Plus, ShoppingCart, CheckCircle2 } from 'lucide-react-native';
import { Seller } from '../types';

interface RestaurantDetailProps {
  restaurant: Seller;
  onBack: () => void;
}

export default function RestaurantDetail({ restaurant, onBack }: RestaurantDetailProps) {
  const [cart, setCart] = useState<any[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<any>(null);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, any>>({});

  const addToCart = (item: any, choices?: Record<string, any>) => {
    const cartItem = {
      ...item,
      cartId: Math.random().toString(36).substr(2, 9),
      selectedChoices: choices || {},
      finalPrice: item.price + Object.values(choices || {}).reduce((sum, choice) => sum + (choice.priceExtra || 0), 0)
    };
    setCart([...cart, cartItem]);
    setCustomizingItem(null);
    setSelectedChoices({});
  };

  const handleItemPress = (item: any) => {
    if (item.available === false) return;
    if (item.options && item.options.length > 0) {
      setCustomizingItem(item);
      // Initialize required options
      const initialChoices: Record<string, any> = {};
      item.options.forEach((opt: any) => {
        if (opt.required && opt.choices.length > 0) {
          initialChoices[opt.id] = opt.choices[0];
        }
      });
      setSelectedChoices(initialChoices);
    } else {
      addToCart(item);
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

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    
    setIsOrdering(true);
    try {
      // Mocking a real API call to /api/orders
      // In a real app, we would use fetch() with a token
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token' // Using dev token for MVP
        },
        body: JSON.stringify({
          sellerId: restaurant._id || restaurant.id, // Use _id if available, fallback to id
          items: cart,
          total: total
        })
      });

      if (response.ok) {
        setOrderSuccess(true);
        setCart([]);
        setTimeout(() => {
          setOrderSuccess(false);
          onBack();
        }, 3000);
      } else {
        const errData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Erreur lors de la commande: ${errData.details || errData.error}`);
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Erreur réseau.');
    } finally {
      setIsOrdering(false);
    }
  };

  if (orderSuccess) {
    return (
      <View style={styles.successContainer}>
        <CheckCircle2 size={80} color="#22c55e" />
        <Text style={styles.successTitle}>Commande validée !</Text>
        <Text style={styles.successSub}>Votre repas est en cours de préparation.</Text>
      </View>
    );
  }

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
            <Text style={styles.metaText}>{restaurant.deliveryTime || restaurant.time} • {restaurant.deliveryFee !== undefined ? `${restaurant.deliveryFee}€` : restaurant.fee}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          {(!restaurant.menu || restaurant.menu.length === 0) ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#94a3b8', fontStyle: 'italic' }}>Aucun plat disponible pour le moment.</Text>
            </View>
          ) : restaurant.menu.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, item.available === false && { opacity: 0.5 }]}
              onPress={() => handleItemPress(item)}
              disabled={item.available === false}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.itemPrice}>{item.price.toFixed(2)} €</Text>
                {item.available === false && (
                  <Text style={{ color: '#ef4444', fontSize: 10, fontWeight: 'bold', marginTop: 4 }}>ÉPUISÉ</Text>
                )}
              </View>
              <View style={styles.itemRight}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={[styles.addBtn, item.available === false && { backgroundColor: '#94a3b8' }]}>
                  <Plus size={20} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Customization Modal */}
      {customizingItem && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{customizingItem.name}</Text>
              <TouchableOpacity onPress={() => setCustomizingItem(null)}>
                <Text style={styles.closeText}>Annuler</Text>
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
                          <Text style={styles.choicePrice}>+{choice.priceExtra.toFixed(2)}€</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.confirmBtn}
              onPress={() => addToCart(customizingItem, selectedChoices)}
            >
              <Text style={styles.confirmBtnText}>Ajouter au panier</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {cart.length > 0 && (
        <TouchableOpacity 
          style={styles.cartBar} 
          onPress={handlePlaceOrder}
          disabled={isOrdering}
        >
          <View style={styles.cartInfo}>
            {isOrdering ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ShoppingCart size={20} color="#fff" />
            )}
            <Text style={styles.cartText}>
              {isOrdering ? 'Traitement...' : `Commander (${cart.length})`}
            </Text>
          </View>
          <Text style={styles.cartTotal}>{total.toFixed(2)} €</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 40 },
  successTitle: { fontSize: 28, fontWeight: '900', marginTop: 24, textAlign: 'center' },
  successSub: { fontSize: 16, color: '#64748b', textAlign: 'center', marginTop: 8 },
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
  cartTotal: { color: '#fff', fontWeight: '900', fontSize: 16 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  closeText: { color: '#ef4444', fontWeight: 'bold' },
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
