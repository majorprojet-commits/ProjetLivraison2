import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Package, TrendingUp, Users, Clock, ChevronRight, RefreshCw } from 'lucide-react-native';
import { format } from 'date-fns';

export default function SellerHome() {
  const [seller, setSeller] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // In MVP, we use 'r1' as the default seller ID for the dev-token admin
      const [sellerRes, ordersRes] = await Promise.all([
        fetch('/api/sellers', { headers: { 'Authorization': 'Bearer dev-token' } }),
        fetch('/api/orders/seller/r1', { headers: { 'Authorization': 'Bearer dev-token' } })
      ]);

      if (sellerRes.ok) {
        const allSellers = await sellerRes.json();
        const currentSeller = allSellers.find((s: any) => s.id === 'r1');
        setSeller(currentSeller);
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log(`[SellerHome] Updating order ${orderId} to ${newStatus}`);
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        console.log('[SellerHome] Status updated successfully');
        fetchData();
      } else {
        const err = await response.json();
        console.error('[SellerHome] Update status failed:', err);
        alert(`Erreur: ${err.error || 'Inconnue'}`);
      }
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const dailyRevenue = orders
    .filter(o => o.status === 'delivered' && o.date && new Date(o.date).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchData(); }} />
      }
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{seller?.name || 'Dashboard Vendeur'}</Text>
          <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Hub Vendeur Mobile</Text>
        </View>
        <TouchableOpacity onPress={() => { setIsLoading(true); fetchData(); }}>
          <RefreshCw size={20} color="#8b5cf6" />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#f5f3ff' }]}>
          <TrendingUp size={24} color="#9333ea" />
          <Text style={styles.statVal}>{dailyRevenue.toFixed(2)}€</Text>
          <Text style={styles.statLabel}>CA du jour</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
          <Package size={24} color="#2563eb" />
          <Text style={styles.statVal}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total Commandes</Text>
        </View>
      </View>

      {/* Active Orders Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Commandes Actives ({activeOrders.length})</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#8b5cf6" style={{ marginTop: 20 }} />
      ) : activeOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Package size={48} color="#e2e8f0" />
          <Text style={styles.emptyText}>Aucune commande active</Text>
        </View>
      ) : (
        activeOrders.map(order => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onUpdateStatus={handleUpdateStatus}
          />
        ))
      )}

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>Actions Rapides</Text>
      <TouchableOpacity style={styles.actionItem}>
        <View style={styles.actionIcon}><Clock size={20} color="#64748b" /></View>
        <Text style={styles.actionText}>Modifier les horaires</Text>
        <ChevronRight size={20} color="#cbd5e1" />
      </TouchableOpacity>

      {/* Order History Section */}
      <Text style={[styles.sectionTitle, { marginTop: 32, marginBottom: 16 }]}>Historique Récent</Text>
      {orders.filter(o => o.status === 'delivered' || o.status === 'cancelled').slice(0, 10).map(order => (
        <View key={order.id} style={styles.historyItem}>
          <View style={styles.historyInfo}>
            <Text style={styles.historyId}>#{order.id.slice(-4).toUpperCase()}</Text>
            <Text style={styles.historyDate}>{order.date ? format(new Date(order.date), 'dd/MM HH:mm') : '--/--'}</Text>
          </View>
          <View style={styles.historyRight}>
            <Text style={styles.historyAmount}>{order.total.toFixed(2)}€</Text>
            <Text style={[styles.historyStatus, { color: order.status === 'delivered' ? '#22c55e' : '#ef4444' }]}>
              {order.status === 'delivered' ? 'Livré' : 'Annulé'}
            </Text>
          </View>
        </View>
      ))}
      {orders.filter(o => o.status === 'delivered' || o.status === 'cancelled').length === 0 && (
        <Text style={styles.emptyHistoryText}>Aucun historique disponible</Text>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function OrderCard({ order, onUpdateStatus }: { order: any, onUpdateStatus: (id: string, status: string) => void }) {
  const itemsText = order.items.map((i: any) => {
    const optionsText = i.selectedChoices ? Object.values(i.selectedChoices).map((c: any) => c.name).join(', ') : '';
    return `${i.quantity || 1}x ${i.name}${optionsText ? ` (${optionsText})` : ''}`;
  }).join('\n');
  const time = order.date ? format(new Date(order.date), 'HH:mm') : '--:--';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#fef3c7';
      case 'preparing': return '#dcfce7';
      case 'ready': return '#eff6ff';
      default: return '#f1f5f9';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'preparing': return 'En préparation';
      case 'ready': return 'Prêt';
      case 'delivering': return 'En livraison';
      case 'delivered': return 'Livré';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <View style={[styles.orderCard, order.status === 'ready' && styles.highlightCard]}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{order.id.slice(-4).toUpperCase()}</Text>
        <Text style={styles.orderTime}>{time}</Text>
      </View>
      <Text style={styles.orderItems} numberOfLines={5}>{itemsText}</Text>
      <View style={styles.orderFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </View>
        
        <View style={styles.actions}>
          {order.status === 'pending' && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]} 
              onPress={() => onUpdateStatus(order.id, 'accepted')}
            >
              <Text style={styles.actionBtnText}>Accepter</Text>
            </TouchableOpacity>
          )}
          {order.status === 'accepted' && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#8b5cf6' }]} 
              onPress={() => onUpdateStatus(order.id, 'preparing')}
            >
              <Text style={styles.actionBtnText}>Préparer</Text>
            </TouchableOpacity>
          )}
          {order.status === 'preparing' && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#22c55e' }]} 
              onPress={() => onUpdateStatus(order.id, 'ready')}
            >
              <Text style={styles.actionBtnText}>Prêt</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '900' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard: { flex: 1, padding: 16, borderRadius: 20, gap: 8 },
  statVal: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '900' },
  orderCard: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 20, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#e2e8f0' },
  highlightCard: { borderLeftColor: '#22c55e', backgroundColor: '#f0fdf4' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  orderId: { fontWeight: '900', fontSize: 14 },
  orderTime: { fontSize: 12, color: '#94a3b8', fontWeight: 'bold' },
  orderItems: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: '#64748b' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#f8fafc', borderRadius: 24 },
  emptyText: { marginTop: 12, color: '#94a3b8', fontWeight: 'bold' },
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  actionIcon: { width: 40, height: 40, backgroundColor: '#f8fafc', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actionText: { flex: 1, fontWeight: 'bold', fontSize: 14, color: '#334155' },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  historyInfo: { gap: 4 },
  historyId: { fontSize: 14, fontWeight: '900', color: '#1e293b' },
  historyDate: { fontSize: 12, color: '#64748b' },
  historyRight: { alignItems: 'flex-end', gap: 4 },
  historyAmount: { fontSize: 14, fontWeight: '900', color: '#1e293b' },
  historyStatus: { fontSize: 12, fontWeight: 'bold' },
  emptyHistoryText: { textAlign: 'center', color: '#94a3b8', marginTop: 8, fontStyle: 'italic' }
});
