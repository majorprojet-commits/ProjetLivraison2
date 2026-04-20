'use client';

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { Package, Clock, CheckCircle2, XCircle, ChevronRight, AlertCircle, MapPin, Navigation, ArrowLeft, ShoppingBag } from 'lucide-react-native';
import { io, Socket } from 'socket.io-client';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'motion/react';

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

  const [activeTab, setActiveTab] = useState<'all' | 'cooking' | 'delivery' | 'history'>('all');

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

  const formatPrice = (price: number) => price.toLocaleString() + ' FCFA';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#3b82f6';
      case 'preparing': return '#8b5cf6';
      case 'ready': return '#10b981';
      case 'delivering': return '#ec4899';
      case 'picked_up': return '#ec4899';
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
      case 'picked_up': return 'Récupérée';
      case 'delivering': return 'En livraison';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'cooking':
        return orders.filter(o => ['pending', 'accepted', 'preparing'].includes(o.status));
      case 'delivery':
        return orders.filter(o => ['ready', 'picked_up', 'delivering'].includes(o.status));
      case 'history':
        return orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
      default:
        return orders;
    }
  };

  const displayOrders = getFilteredOrders();

  const sortedOrders = [...displayOrders].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      'delivering': 0,
      'picked_up': 0,
      'ready': 1,
      'preparing': 2,
      'accepted': 3,
      'pending': 4,
      'delivered': 5,
      'cancelled': 6
    };
    
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
    }
    
    return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
  });

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Mes Commandes</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'all' && styles.activeTab]} 
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Toutes ({orders.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'cooking' && styles.activeTab]} 
              onPress={() => setActiveTab('cooking')}
            >
              <Text style={[styles.tabText, activeTab === 'cooking' && styles.activeTabText]}>En cuisine ({orders.filter(o => ['pending', 'accepted', 'preparing'].includes(o.status)).length})</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'delivery' && styles.activeTab]} 
              onPress={() => setActiveTab('delivery')}
            >
              <Text style={[styles.tabText, activeTab === 'delivery' && styles.activeTabText]}>En livraison ({orders.filter(o => ['ready', 'picked_up', 'delivering'].includes(o.status)).length})</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
              onPress={() => setActiveTab('history')}
            >
              <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Historique ({orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length})</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {displayOrders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.emptyContainer}
          >
            <View style={styles.emptyIconContainer}>
              <ShoppingBag size={64} color="#8b5cf6" />
            </View>
            <Text style={styles.emptyText}>
              {activeTab === 'active' ? "Pas de commandes en cours" : "Historique vide"}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'active' 
                ? "Vos délicieux repas apparaîtront ici dès que vous aurez commandé." 
                : "Vous n'avez pas encore de commandes terminées."}
            </Text>
          </motion.div>
        ) : (
          <View style={styles.list}>
            <AnimatePresence>
              {sortedOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <View style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <View>
                        <Text style={styles.orderId}>Commande #{order.id.slice(-4).toUpperCase()}</Text>
                        <Text style={styles.orderDate}>
                          {order.date ? new Date(order.date).toLocaleDateString('fr-FR') : '--/--/----'} à {order.date ? new Date(order.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: getStatusColor(order.status) }} />
                          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{getStatusLabel(order.status)}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.itemsList}>
                      {order.items.slice(0, 3).map((item: any, idx: number) => (
                        <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={styles.itemText}>{item.name}</Text>
                          <Text style={styles.itemQty}>x{item.quantity || 1}</Text>
                        </View>
                      ))}
                      {order.items.length > 3 && (
                        <Text style={styles.moreItems}>+ {order.items.length - 3} autres articles</Text>
                      )}
                    </View>

                    <View style={styles.orderFooter}>
                      <View>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalText}>{formatPrice(order.total)}</Text>
                      </View>
                      {['picked_up', 'delivering'].includes(order.status) && (
                        <TouchableOpacity 
                          style={styles.trackButton}
                          onPress={() => startTracking(order)}
                        >
                          <Navigation size={14} color="#fff" style={{ marginRight: 6 }} />
                          <Text style={styles.trackButtonText}>Suivre</Text>
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
                </motion.div>
              ))}
            </AnimatePresence>
          </View>
        )}
      </ScrollView>

      {/* Embedded Tracking View instead of Modal */}
      <AnimatePresence>
        {trackingOrder && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={styles.trackingOverlay}
          >
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
                    zoomControl: false,
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
                        rotation: 0
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
                <Text style={styles.etaText}>Arrivée prévue: ~10 min</Text>
              </View>
              
              <Text style={styles.driverName}>Livreur: Moussa D.</Text>
              <Text style={styles.orderDetailText}>Commande #{trackingOrder?.id.slice(-4).toUpperCase()}</Text>
              
              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Appeler le livreur</Text>
              </TouchableOpacity>
            </View>
          </motion.div>
        )}
      </AnimatePresence>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#f8fafc', position: 'relative', overflow: 'hidden' },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: '900', color: '#1e293b', fontFamily: 'var(--font-display)' },
  tabsWrapper: { marginBottom: 10 },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 20 },
  tab: { paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: 'transparent', minWidth: 80, alignItems: 'center' },
  activeTab: { borderBottomColor: '#8b5cf6' },
  tabText: { fontSize: 13, fontWeight: 'bold', color: '#94a3b8' },
  activeTabText: { color: '#8b5cf6' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 40 },
  emptyIconContainer: { backgroundColor: '#f5f3ff', padding: 32, borderRadius: 100, marginBottom: 24 },
  emptyText: { fontSize: 20, fontWeight: '900', color: '#1e293b', textAlign: 'center' },
  emptySubtext: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 8, maxWidth: 250, fontWeight: '600' },
  list: { padding: 16 },
  orderCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3, borderWidth: 1, borderColor: '#f1f5f9' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderId: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
  orderDate: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  itemsList: { borderTopWidth: 1, borderTopColor: '#f8fafc', paddingTop: 16, marginBottom: 16 },
  itemText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  itemQty: { fontSize: 12, fontWeight: 'bold', color: '#94a3b8' },
  moreItems: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 4 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f8fafc', paddingTop: 16 },
  totalLabel: { fontSize: 10, textTransform: 'uppercase', fontWeight: '800', color: '#94a3b8', letterSpacing: 1, marginBottom: 2 },
  totalText: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  cancelButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#fef2f2' },
  cancelButtonText: { color: '#ef4444', fontSize: 13, fontWeight: '800' },
  trackButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  trackButtonText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  trackingOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: '#fff', 
    zIndex: 100,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden'
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backButton: { padding: 8 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
  mapContainer: { width: '100%', height: 350, backgroundColor: '#f1f5f9' },
  waitingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  waitingText: { color: '#64748b', fontWeight: 'bold', fontSize: 14 },
  trackingInfo: { padding: 24, backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -32, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 10 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  etaText: { fontWeight: '900', color: '#8b5cf6' },
  driverName: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginBottom: 4 },
  orderDetailText: { color: '#64748b', fontWeight: 'bold', marginBottom: 24 },
  contactButton: { backgroundColor: '#1e293b', padding: 16, borderRadius: 16, alignItems: 'center' },
  contactButtonText: { color: '#fff', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }
});
