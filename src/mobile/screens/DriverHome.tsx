'use client';

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Navigation, MapPin, DollarSign, Clock, CheckCircle, RefreshCw } from 'lucide-react-native';
import { io, Socket } from 'socket.io-client';

export default function DriverHome() {
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [activeTab, setActiveTab] = useState<'offers' | 'active' | 'history'>('offers');

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': 'Bearer dev-token' };
      const [availRes, myRes] = await Promise.all([
        fetch('/api/orders/available', { headers }),
        fetch('/api/orders/driver', { headers })
      ]);

      if (availRes.ok) {
        const availData = await availRes.json();
        setAvailableOrders(availData);
      }
      if (myRes.ok) {
        const myData = await myRes.json();
        setMyOrders(myData);
      }
    } catch (error) {
      console.error('Fetch driver data error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);

    // Initialize socket
    socketRef.current = io({
      transports: ['polling', 'websocket'],
    });

    socketRef.current.on('orderAvailable', (order) => {
      console.log('[DriverHome] Socket: Nouvelle commande disponible');
      setAvailableOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
    });

    socketRef.current.on('orderUpdated', (order) => {
      console.log('[DriverHome] Socket: Commande mise à jour', order.id, order.status);
      setMyOrders(prev => prev.map(o => o.id === order.id ? order : o));
      // Also update available if it was there and is no longer 'ready'
      if (order.status !== 'ready') {
        setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
      }
    });

    return () => {
      clearInterval(interval);
      if (socketRef.current) socketRef.current.disconnect();
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const simulationStepRef = useRef(0);

  // Track location if there's an active order
  useEffect(() => {
    const activeOrder = myOrders.find(o => o.status === 'picked_up');
    let simulationInterval: any = null;
    
    if (activeOrder && !watchIdRef.current) {
      console.log('[DriverHome] Starting location tracking for order:', activeOrder.id);
      
      // Real Geolocation
      try {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            if (socketRef.current) {
              socketRef.current.emit('updateLocation', {
                orderId: activeOrder.id,
                lat: latitude,
                lng: longitude,
                driverId: 'dev-driver'
              });
            }
          },
          (error) => console.warn('[DriverHome] Geolocation real-time error:', error),
          { enableHighAccuracy: true, distanceFilter: 10 }
        );
      } catch (e) {
        console.warn('[DriverHome] Geolocation not supported or failed');
      }

      // Simulation for Preview (ALWAYS start this in dev mode to ensure it works)
      const startLat = 4.0511;
      const startLng = 9.7679;
      simulationInterval = setInterval(() => {
        simulationStepRef.current += 0.0005;
        if (socketRef.current) {
          socketRef.current.emit('updateLocation', {
            orderId: activeOrder.id,
            lat: startLat + simulationStepRef.current,
            lng: startLng + (simulationStepRef.current * 0.8),
            driverId: 'dev-driver-sim'
          });
        }
      }, 2000);

    } else if (!activeOrder) {
      if (watchIdRef.current !== null) {
        console.log('[DriverHome] Stopping location tracking');
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (simulationInterval) clearInterval(simulationInterval);
      simulationStepRef.current = 0;
    }

    return () => {
      if (simulationInterval) clearInterval(simulationInterval);
    };
  }, [myOrders]);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      console.log('[DriverHome] Accepting order:', orderId);
      const response = await fetch(`/api/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token'
        }
      });
      if (response.ok) {
        console.log('[DriverHome] Order accepted successfully');
        setActiveTab('active');
        fetchData();
      } else {
        console.error('[DriverHome] Accept order failed:', response.status);
        const err = await response.json();
        console.error('[DriverHome] Accept error details:', err);
      }
    } catch (error) {
      console.error('Accept order error:', error);
    }
  };

  const handlePickUpOrder = async (orderId: string) => {
    try {
      console.log('[DriverHome] Picking up order:', orderId);
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token'
        },
        body: JSON.stringify({ status: 'picked_up' })
      });
      if (response.ok) {
        console.log('[DriverHome] Order picked up successfully');
        fetchData();
      } else {
        console.error('[DriverHome] Pick up failed:', response.status);
      }
    } catch (error) {
      console.error('Pick up order error:', error);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      console.log('[DriverHome] Completing order:', orderId);
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token'
        },
        body: JSON.stringify({ status: 'delivered' })
      });
      if (response.ok) {
        console.log('[DriverHome] Order completed successfully');
        setActiveTab('history');
        fetchData();
      } else {
        console.error('[DriverHome] Complete failed:', response.status);
      }
    } catch (error) {
      console.error('Complete order error:', error);
    }
  };

  const dailyEarnings = myOrders
    .filter(o => o.status === 'delivered' && o.date && new Date(o.date).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + 5.00, 0); // Flat 5€ per delivery for MVP

  const activeDeliveries = myOrders.filter(o => ['assigned', 'picked_up', 'delivering'].includes(o.status));
  const pastDeliveries = myOrders.filter(o => o.status === 'delivered');

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'offers': return availableOrders;
      case 'active': return activeDeliveries;
      case 'history': return pastDeliveries;
      default: return [];
    }
  };

  const displayOrders = getFilteredOrders();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Livreur</Text>
        <TouchableOpacity onPress={() => { setIsLoading(true); fetchData(); }}>
          <RefreshCw size={20} color="#8b5cf6" />
        </TouchableOpacity>
      </View>

      {/* Earnings Card */}
      <View style={styles.earningsCard}>
        <View>
          <Text style={styles.earningsLabel}>Gains du jour</Text>
          <Text style={styles.earningsVal}>{dailyEarnings.toFixed(2)} €</Text>
        </View>
        <View style={styles.earningsStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValSmall}>{pastDeliveries.length}</Text>
            <Text style={styles.statLabelSmall}>Courses</Text>
          </View>
        </View>
      </View>

      {/* Driver Tabs */}
      <View style={styles.tabContainer}>
        <TabButton active={activeTab === 'offers'} count={availableOrders.length} label="Offres" onPress={() => setActiveTab('offers')} />
        <TabButton active={activeTab === 'active'} count={activeDeliveries.length} label="En cours" onPress={() => setActiveTab('active')} />
        <TabButton active={activeTab === 'history'} count={0} label="Historique" onPress={() => setActiveTab('history')} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchData(); }} />
        }
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#8b5cf6" style={{ marginTop: 40 }} />
        ) : displayOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Navigation size={48} color="#e2e8f0" />
            <Text style={styles.emptyText}>Aucune course ici</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {displayOrders.map(order => (
              activeTab === 'offers' ? (
                <OfferCard key={order.id} order={order} onAccept={() => handleAcceptOrder(order.id)} />
              ) : activeTab === 'active' ? (
                <ActiveOrderCard 
                  key={order.id} 
                  order={order} 
                  onPickUp={() => handlePickUpOrder(order.id)}
                  onComplete={() => handleCompleteOrder(order.id)} 
                />
              ) : (
                <HistoryItem key={order.id} order={order} />
              )
            ))}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function TabButton({ active, label, count, onPress }: { active: boolean, label: string, count: number, onPress: () => void }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
      {count > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function OfferCard({ order, onAccept }: { order: any, onAccept: () => void }) {
  return (
    <View style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>Course #{order.id.slice(-4).toUpperCase()}</Text>
          <Text style={styles.distanceText}>Prêt pour ramassage</Text>
        </View>
        <Text style={styles.payoutText}>5.00 €</Text>
      </View>
      <View style={styles.addressRow}>
        <MapPin size={14} color="#94a3b8" />
        <Text style={styles.addressText} numberOfLines={1}>Restaurant ID: {order.sellerId}</Text>
      </View>
      <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
        <Text style={styles.acceptBtnText}>Accepter la course</Text>
      </TouchableOpacity>
    </View>
  );
}

function ActiveOrderCard({ order, onPickUp, onComplete }: { order: any, onPickUp: () => void, onComplete: () => void }) {
  const isPickedUp = order.status === 'picked_up';
  
  return (
    <View style={[styles.offerCard, { borderColor: '#8b5cf6', borderWidth: 2 }]}>
      <Text style={styles.restaurantName}>
        {isPickedUp ? 'Livraison en cours' : 'Récupération au restaurant'} #{order.id.slice(-4).toUpperCase()}
      </Text>
      <Text style={styles.addressText}>
        {isPickedUp ? `Destination: Client ID ${order.userId}` : `Vendeur ID: ${order.sellerId}`}
      </Text>
      
      {!isPickedUp ? (
        <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: '#8b5cf6', marginTop: 12 }]} onPress={onPickUp}>
          <Text style={styles.acceptBtnText}>J'ai récupéré la commande</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: '#22c55e', marginTop: 12 }]} onPress={onComplete}>
          <Text style={styles.acceptBtnText}>Marquer comme livré</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function HistoryItem({ order }: { order: any }) {
  return (
    <View style={styles.historyItem}>
      <View style={styles.historyIcon}><CheckCircle size={20} color="#22c55e" /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.historyName}>Course #{order.id.slice(-4).toUpperCase()}</Text>
        <Text style={styles.historyTime}>{order.date ? new Date(order.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</Text>
      </View>
      <Text style={styles.historyAmount}>5.00 €</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '900' },
  earningsCard: { backgroundColor: '#1e293b', padding: 24, borderRadius: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  earningsLabel: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  earningsVal: { color: '#fff', fontSize: 28, fontWeight: '900' },
  earningsStats: { flexDirection: 'row', gap: 16 },
  statItem: { alignItems: 'center' },
  statValSmall: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  statLabelSmall: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 16 },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#f8fafc', 
    padding: 4, 
    borderRadius: 14, 
    marginBottom: 20 
  },
  tabButton: { 
    flex: 1, 
    paddingVertical: 10, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6
  },
  tabButtonActive: { 
    backgroundColor: '#fff', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  },
  tabButtonText: { fontSize: 11, fontWeight: 'bold', color: '#64748b' },
  tabButtonTextActive: { color: '#8b5cf6' },
  tabBadge: {
    backgroundColor: '#ef4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  offerCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  offerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  restaurantInfo: { flex: 1 },
  restaurantName: { fontSize: 16, fontWeight: '900' },
  distanceText: { fontSize: 12, color: '#94a3b8', fontWeight: 'bold' },
  payoutText: { fontSize: 18, fontWeight: '900', color: '#8b5cf6' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  addressText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  acceptBtn: { backgroundColor: '#8b5cf6', padding: 14, borderRadius: 16, alignItems: 'center' },
  acceptBtnText: { color: '#fff', fontWeight: '900', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  historyIcon: { marginRight: 12 },
  historyName: { fontWeight: 'bold', fontSize: 14 },
  historyTime: { fontSize: 12, color: '#94a3b8' },
  historyAmount: { fontWeight: '900', fontSize: 14, color: '#334155' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#f8fafc', borderRadius: 24 },
  emptyText: { marginTop: 12, color: '#94a3b8', fontWeight: 'bold' }
});
