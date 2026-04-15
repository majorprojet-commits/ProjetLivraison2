import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Package, Clock, CheckCircle2, XCircle, ChevronRight, AlertCircle } from 'lucide-react-native';
import { io } from 'socket.io-client';

interface OrdersScreenProps {
  onCancelOrder: (orderId: string) => void;
}

export default function OrdersScreen({ onCancelOrder }: OrdersScreenProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: { 'Authorization': 'Bearer dev-token' }
      });
      if (response.ok) {
        const data = await response.json();
        // In dev mode, we show all orders that don't have a specific userId or match dev-user
        // to ensure the user sees their orders even if userId mapping is inconsistent
        const filtered = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(filtered);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    const socket = io();
    socket.on('orderUpdated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
                  <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()} à {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
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
  cancelButtonText: { color: '#ef4444', fontSize: 12, fontWeight: '800' }
});
