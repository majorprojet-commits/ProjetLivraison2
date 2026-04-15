import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { Home, ShoppingBag, User, Settings, Package, Navigation, LucideIcon, Bell } from 'lucide-react-native';
import { io } from 'socket.io-client';

import ClientHome from './screens/ClientHome';
import SellerHome from './screens/SellerHome';
import DriverHome from './screens/DriverHome';
import RestaurantDetail from './screens/RestaurantDetail';
import ProfileScreen from './screens/ProfileScreen';
import { Seller } from './types';

type AppType = 'client' | 'seller' | 'driver' | 'profile';

export default function MobileApp() {
  const [activeApp, setActiveApp] = useState<AppType>('client');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Seller | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const socket = io();
    
    // Join relevant rooms
    socket.emit('join', 'drivers');
    socket.emit('join', 'seller_r1'); // Mock seller room

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
    setSelectedRestaurant(null); // Reset navigation when switching apps
  };

  const renderClientContent = () => {
    if (selectedRestaurant) {
      return (
        <RestaurantDetail 
          restaurant={selectedRestaurant} 
          onBack={() => setSelectedRestaurant(null)}
          onAddToCart={(item) => console.log('Added to cart:', item)}
        />
      );
    }
    return <ClientHome onPressRestaurant={(seller) => setSelectedRestaurant(seller)} />;
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
        <TabItem active={activeApp === 'client'} label="Client" icon={ShoppingBag} onPress={() => handleAppChange('client')} />
        <TabItem active={activeApp === 'seller'} label="Vendeur" icon={Package} onPress={() => handleAppChange('seller')} />
        <TabItem active={activeApp === 'driver'} label="Livreur" icon={Navigation} onPress={() => handleAppChange('driver')} />
        <TabItem active={activeApp === 'profile'} label="Profil" icon={User} onPress={() => handleAppChange('profile')} />
      </View>
    </SafeAreaView>
  );
}

interface TabItemProps {
  active: boolean;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
}

function TabItem({ active, label, icon: Icon, onPress }: TabItemProps) {
  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
      <Icon size={24} color={active ? '#8b5cf6' : '#94a3b8'} />
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
  tabBar: { flexDirection: 'row', height: 60, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabLabel: { fontSize: 10, fontWeight: 'bold', marginTop: 4 }
});
