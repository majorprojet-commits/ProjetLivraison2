import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Home, ShoppingBag, User, Settings, Package, Navigation, LucideIcon } from 'lucide-react-native';

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
      </View>
      
      <View style={styles.content}>
        {activeApp === 'client' && renderClientContent()}
        {activeApp === 'seller' && <SellerHome />}
        {activeApp === 'driver' && <DriverHome />}
        {activeApp === 'profile' && <ProfileScreen />}
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
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', alignItems: 'center' },
  headerText: { fontWeight: '900', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 },
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
