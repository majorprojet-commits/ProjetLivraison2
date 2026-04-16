import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { Package, Clock, CheckCircle2, XCircle, ChevronRight, AlertCircle, MapPin, Navigation, ArrowLeft } from 'lucide-react-native';
import { io, Socket } from 'socket.io-client';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%'
};

const DEFAULT_CENTER = {
  lat: 4.0511, // Douala, Cameroon
  lng: 9.7679
};

interface OrdersScreenProps {
  onCancelOrder: (orderId: string) => void;
}

export default function OrdersScreen({ onCancelOrder }: OrdersScreenProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<any | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number, lng: number } | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': 'Bearer dev-token' }
      });
      if (response.ok) {
        const data = await response.json();
        const filtered = data.sort((a: any, b: any) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
        setOrders(filtered);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const trackingOrderRef = useRef<any>(null);

  useEffect(() => {
    trackingOrderRef.current = trackingOrder;
  }, [trackingOrder]);

  useEffect(() => {
    fetchOrders();
    
    socketRef.current = io({
      transports: ['polling', 'websocket'],
    });
    
    socketRef.current.emit('join', 'admin');
    
    socketRef.current.on('orderUpdated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      if (trackingOrderRef.current && trackingOrderRef.current.id === updatedOrder.id) {
        setTrackingOrder(updatedOrder);
      }
    });

    socketRef.current.on('locationUpdated', (data) => {
      console.log('[OrdersScreen] Received location update:', data);
      if (trackingOrderRef.current && data.orderId === trackingOrderRef.current.id) {
        setDriverLocation({ lat: data.lat, lng: data.lng });
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []); // Only run once

  const startTracking = (order: any) => {
    setTrackingOrder(order);
    if (socketRef.current) {
      socketRef.current.emit('join', `order_${order.id}`);
    }
  };

  const stopTracking = () => {
    if (socketRef.current && trackingOrder) {
      // We don't really have a leave room event in the simple server.ts yet, 
      // but we can just clear the local state
    }
    setTrackingOrder(null);
    setDriverLocation(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#3b82f6';
      case 'preparing': return '#8b5cf6';
      case 'ready': return '#10b981';
      case 'delivering': return '#ec4899';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'preparing': return 'En préparation';
      case 'ready': return 'Prête';
      case 'delivering': return 'En livraison';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Mes Commandes</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>Vous n'avez pas encore de commandes</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Commande #{order.id.slice(-4).toUpperCase()}</Text>
                  <Text style={styles.orderDate}>
                    {order.date ? new Date(order.date).toLocaleDateString() : '--/--/----'} à {order.date ? new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{getStatusLabel(order.status)}</Text>
                </View>
              </View>

              <View style={styles.itemsList}>
                {order.items.slice(0, 2).map((item: any, idx: number) => (
                  <Text key={idx} style={styles.itemText}>• {item.name} x1</Text>
                ))}
                {order.items.length > 2 && (
                  <Text style={styles.moreItems}>+ {order.items.length - 2} autres articles</Text>
                )}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.totalText}>Total: {order.total.toFixed(2)}€</Text>
                {['picked_up', 'delivering'].includes(order.status) && (
                  <TouchableOpacity 
                    style={styles.trackButton}
                    onPress={() => startTracking(order)}
                  >
                    <Navigation size={14} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={styles.trackButtonText}>Suivre en direct</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'pending' && (
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => onCancelOrder(order.id)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      <Modal
        visible={!!trackingOrder}
        animationType="slide"
        onRequestClose={stopTracking}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={stopTracking} style={styles.backButton}>
              <ArrowLeft size={24} color="#1e293b" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Suivi en direct</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.mapContainer}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={MAP_CONTAINER_STYLE}
                center={driverLocation || DEFAULT_CENTER}
                zoom={15}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                }}
              >
                {/* Destination Marker */}
                <MarkerF 
                  position={DEFAULT_CENTER} 
                  label="Moi"
                />
                
                {/* Driver Marker */}
                {driverLocation && (
                  <MarkerF
                    position={driverLocation}
                    label="Livreur"
                    icon={{
                      path: "M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z",
                      fillColor: "#8b5cf6",
                      fillOpacity: 1,
                      strokeWeight: 2,
                      strokeColor: "#ffffff",
                      scale: 1.5,
                      rotation: 0 // Could rotate based on heading if available
                    }}
                  />
                )}
              </GoogleMap>
            ) : (
              <View style={styles.waitingContainer}>
                <ActivityIndicator color="#8b5cf6" />
                <Text style={styles.waitingText}>Chargement de la carte...</Text>
              </View>
            )}
          </View>

          <View style={styles.trackingInfo}>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(trackingOrder?.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(trackingOrder?.status) }]}>
                  {getStatusLabel(trackingOrder?.status)}
                </Text>
              </View>
              <Text style={styles.etaText}>Arrivée prévue: 12 min</Text>
            </View>
            
            <Text style={styles.driverName}>Livreur: Moussa D.</Text>
            <Text style={styles.orderDetailText}>Commande #{trackingOrder?.id.slice(-4).toUpperCase()}</Text>
            
            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Appeler le livreur</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 100 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#64748b', textAlign: 'center', marginTop: 20 },
  list: { padding: 16 },
  orderCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderId: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  orderDate: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  itemsList: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12, marginBottom: 12 },
  itemText: { fontSize: 13, color: '#475569', marginBottom: 4 },
  moreItems: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  totalText: { fontSize: 16, fontWeight: '900', color: '#1e293b' },
  cancelButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fef2f2' },
  cancelButtonText: { color: '#ef4444', fontSize: 12, fontWeight: '800' },
  trackButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8b5cf6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  trackButtonText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backButton: { padding: 8 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
  mapContainer: { flex: 1, backgroundColor: '#f1f5f9' },
  mockMap: { flex: 1, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  destinationMarker: { position: 'absolute', top: '20%', right: '20%', alignItems: 'center' },
  driverMarkerContainer: { position: 'absolute' },
  driverMarker: { alignItems: 'center' },
  markerLabel: { fontSize: 10, fontWeight: '900', color: '#1e293b', marginTop: 4, backgroundColor: '#fff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  waitingContainer: { alignItems: 'center', gap: 12 },
  waitingText: { color: '#64748b', fontWeight: 'bold', fontSize: 14 },
  trackingInfo: { padding: 24, backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -32, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 10 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  etaText: { fontWeight: '900', color: '#8b5cf6' },
  driverName: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginBottom: 4 },
  orderDetailText: { color: '#64748b', fontWeight: 'bold', marginBottom: 24 },
  contactButton: { backgroundColor: '#1e293b', padding: 16, borderRadius: 16, alignItems: 'center' },
  contactButtonText: { color: '#fff', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }
});
