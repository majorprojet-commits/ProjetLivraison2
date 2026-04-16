import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform, Alert } from 'react-native';
import { Home, ShoppingBag, User, Settings, Package, Navigation, LucideIcon, Bell, List, ShoppingCart } from 'lucide-react-native';
import { io } from 'socket.io-client';

import ClientHome from './screens/ClientHome';
import SellerHome from './screens/SellerHome';
import DriverHome from './screens/DriverHome';
import RestaurantDetail from './screens/RestaurantDetail';
import ProfileScreen from './screens/ProfileScreen';
import CartScreen from './screens/CartScreen';
import OrdersScreen from './screens/OrdersScreen';
import { Seller } from './types';

type AppType = 'client' | 'seller' | 'driver' | 'profile';
type ClientView = 'home' | 'restaurant' | 'cart' | 'orders';

export default function MobileApp() {
  const [activeApp, setActiveApp] = useState<AppType>('client');
  const [clientView, setClientView] = useState<ClientView>('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Seller | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const socket = io({
      transports: ['polling', 'websocket'],
    });
    
    // Join relevant rooms
    socket.emit('join', 'drivers');
    socket.emit('join', 'seller_r1'); // Mock seller room
    socket.emit('join', 'admin');

    socket.on('newOrder', (order) => {
      setNotifications(prev => [{ id: Date.now(), message: `Nouvelle commande #${order.id.slice(-4).toUpperCase()}` }, ...prev]);
    });

    socket.on('orderAvailable', (order) => {
      setNotifications(prev => [{ id: Date.now(), message: `Nouvelle livraison disponible !` }, ...prev]);
    });

    socket.on('orderUpdated', (order) => {
      setNotifications(prev => [{ id: Date.now(), message: `Commande #${order.id.slice(-4).toUpperCase()} mise à jour: ${order.status}` }, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleAppChange = (app: AppType) => {
    console.log(`[MobileApp] Switching to: ${app}`);
    setActiveApp(app);
    if (app === 'client') setClientView('home');
    setSelectedRestaurant(null);
  };

  const addToCart = (item: any, choices?: Record<string, any>) => {
    const cartItem = {
      ...item,
      cartId: Math.random().toString(36).substr(2, 9),
      selectedChoices: choices || {},
      finalPrice: item.price + Object.values(choices || {}).reduce((sum, choice) => sum + (choice.priceExtra || 0), 0)
    };
    setCart([...cart, cartItem]);
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + item.finalPrice, 0);
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token'
        },
        body: JSON.stringify({
          sellerId: selectedRestaurant?._id || selectedRestaurant?.id || 'r1',
          items: cart,
          total: total,
          userId: 'dev-user'
        })
      });

      if (response.ok) {
        const order = await response.json();
        setCart([]);
        
        // Initialize PayUnit Payment
        try {
          console.log('[MobileApp] Initializing PayUnit payment for order:', order.id);
          const payRes = await fetch('/api/payments/payunit/initialize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer dev-token'
            },
            body: JSON.stringify({
              amount: total,
              currency: 'XAF',
              orderId: order.id,
              description: `Commande #${order.id.slice(-4).toUpperCase()} sur l'application`
            })
          });

          const payData = await payRes.json();

          if (payRes.ok) {
            console.log('[MobileApp] PayUnit init success:', payData);
            
            // Try to find the transaction URL in common response fields
            const transactionUrl = payData.transaction_url || 
                                 (payData.data && payData.data.transaction_url) || 
                                 payData.payment_url || 
                                 (payData.data && payData.data.payment_url);

            if (transactionUrl) {
              console.log('[MobileApp] Redirecting to:', transactionUrl);
              window.location.href = transactionUrl;
            } else {
              console.warn('[MobileApp] No transaction URL found in PayUnit response', payData);
              setClientView('orders');
            }
          } else {
            console.error('[MobileApp] PayUnit init failed:', payData);
            alert(`Erreur Paiement: ${payData.error || payData.message || 'Échec de l\'initialisation'}`);
            setClientView('orders');
          }
        } catch (payErr) {
          console.error('[MobileApp] PayUnit error:', payErr);
          setClientView('orders');
        }
      } else {
        alert('Erreur lors de la commande');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Erreur réseau');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (response.ok) {
        // Refresh orders will happen via polling or manual refresh in OrdersScreen
      }
    } catch (error) {
      console.error('Cancel order error:', error);
    }
  };

  const renderClientContent = () => {
    switch (clientView) {
      case 'restaurant':
        return selectedRestaurant ? (
          <RestaurantDetail 
            restaurant={selectedRestaurant} 
            onBack={() => setClientView('home')}
            cart={cart}
            onAddToCart={addToCart}
            onViewCart={() => setClientView('cart')}
          />
        ) : null;
      case 'cart':
        return (
          <CartScreen 
            cart={cart} 
            onUpdateQuantity={() => {}} 
            onRemove={removeFromCart} 
            onCheckout={handleCheckout}
            onBack={() => setClientView('restaurant')}
          />
        );
      case 'orders':
        return <OrdersScreen onCancelOrder={handleCancelOrder} />;
      default:
        return <ClientHome onPressRestaurant={(seller) => { setSelectedRestaurant(seller); setClientView('restaurant'); }} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: 0, opacity: 0 }}><Text>MobileApp Loaded</Text></View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Expo Mobile Preview</Text>
        {notifications.length > 0 && (
          <TouchableOpacity 
            style={styles.notifBadge}
            onPress={() => setNotifications([])}
          >
            <Bell size={16} color="#fff" />
            <View style={styles.notifCount}>
              <Text style={styles.notifCountText}>{notifications.length}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length > 0 && (
        <View style={styles.notifToast}>
          <Text style={styles.notifToastText}>{notifications[0].message}</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <View style={{ flex: 1 }}>
          {activeApp === 'client' && renderClientContent()}
          {activeApp === 'seller' && <SellerHome />}
          {activeApp === 'driver' && <DriverHome />}
          {activeApp === 'profile' && <ProfileScreen />}
        </View>
      </View>

      <View style={styles.tabBar}>
        {activeApp === 'client' ? (
          <>
            <TabItem active={clientView === 'home' || clientView === 'restaurant'} label="Accueil" icon={Home} onPress={() => setClientView('home')} />
            <TabItem active={clientView === 'orders'} label="Commandes" icon={List} onPress={() => setClientView('orders')} />
            <TabItem active={clientView === 'cart'} label="Panier" icon={ShoppingCart} onPress={() => setClientView('cart')} badge={cart.length} />
            <TabItem active={false} label="Rôles" icon={Settings} onPress={() => setActiveApp('seller')} />
          </>
        ) : (
          <>
            <TabItem active={activeApp === 'seller'} label="Vendeur" icon={Package} onPress={() => handleAppChange('seller')} />
            <TabItem active={activeApp === 'driver'} label="Livreur" icon={Navigation} onPress={() => handleAppChange('driver')} />
            <TabItem active={activeApp === 'profile'} label="Profil" icon={User} onPress={() => handleAppChange('profile')} />
            <TabItem active={false} label="Client" icon={ShoppingBag} onPress={() => handleAppChange('client')} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

interface TabItemProps {
  active: boolean;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  badge?: number;
}

function TabItem({ active, label, icon: Icon, onPress, badge }: TabItemProps) {
  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Icon size={20} color={active ? '#8b5cf6' : '#94a3b8'} />
        {badge !== undefined && badge > 0 && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, { color: active ? '#8b5cf6' : '#94a3b8' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  headerText: { fontWeight: '900', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 },
  notifBadge: { position: 'absolute', right: 16, backgroundColor: '#8b5cf6', padding: 8, borderRadius: 20 },
  notifCount: { position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWeight: 2, borderColor: '#fff' },
  notifCountText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  notifToast: { position: 'absolute', top: 80, left: 20, right: 20, backgroundColor: '#1e293b', padding: 16, borderRadius: 16, zIndex: 1000, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
  notifToastText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  content: { flex: 1 },
  screen: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 20 },
  scroll: { flex: 1 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '900', color: '#9333ea' },
  btn: { backgroundColor: '#9333ea', padding: 8, borderRadius: 8, marginTop: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingBottom: Platform.OS === 'ios' ? 20 : 10, paddingTop: 10 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconContainer: { position: 'relative', marginBottom: 4 },
  tabLabel: { fontSize: 10, fontWeight: '800' },
  tabBadge: { position: 'absolute', top: -6, right: -10, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderWeight: 2, borderColor: '#fff' },
  tabBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' }
});
