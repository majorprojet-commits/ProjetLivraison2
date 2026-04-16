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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Livreur</Text>
        <TouchableOpacity onPress={() => { setIsLoading(true); fetchData(); }}>
          <RefreshCw size={20} color="#8b5cf6" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchData(); }} />
        }
      >
        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <View>
            <Text style={styles.earningsLabel}>Gains du jour</Text>
            <Text style={styles.earningsVal}>{dailyEarnings.toFixed(2)}€</Text>
          </View>
          <View style={styles.earningsStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValSmall}>{myOrders.filter(o => o.status === 'delivered').length}</Text>
              <Text style={styles.statLabelSmall}>Courses</Text>
            </View>
          </View>
        </View>

        {myOrders.filter(o => ['delivering', 'picked_up'].includes(o.status)).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Course en cours</Text>
            {myOrders.filter(o => ['delivering', 'picked_up'].includes(o.status)).map(order => (
              <ActiveOrderCard 
                key={order.id} 
                order={order} 
                onPickUp={() => handlePickUpOrder(order.id)}
                onComplete={() => handleCompleteOrder(order.id)} 
              />
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Offres Disponibles ({availableOrders.length})</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#8b5cf6" />
        ) : availableOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Navigation size={48} color="#e2e8f0" />
            <Text style={styles.emptyText}>Aucune offre pour le moment</Text>
          </View>
        ) : (
          availableOrders.map(order => (
            <OfferCard 
              key={order.id} 
              order={order} 
              onAccept={() => handleAcceptOrder(order.id)} 
            />
          ))
        )}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Historique Récent</Text>
        {myOrders.filter(o => o.status === 'delivered').slice(0, 5).map(order => (
          <HistoryItem key={order.id} order={order} />
        ))}
      </ScrollView>
    </View>
  );
}

function OfferCard({ order, onAccept }: { order: any, onAccept: () => void }) {
  return (
    <View style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>Commande #{order.id.slice(-4).toUpperCase()}</Text>
          <Text style={styles.distanceText}>Prêt pour ramassage</Text>
        </View>
        <Text style={styles.payoutText}>5.00€</Text>
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
        {isPickedUp ? `Destination: Client ID ${order.userId}` : `Restaurant ID: ${order.sellerId}`}
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
        <Text style={styles.historyName}>Commande #{order.id.slice(-4).toUpperCase()}</Text>
        <Text style={styles.historyTime}>{order.date ? new Date(order.date).toLocaleTimeString() : '--:--'}</Text>
      </View>
      <Text style={styles.historyAmount}>5.00€</Text>
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
