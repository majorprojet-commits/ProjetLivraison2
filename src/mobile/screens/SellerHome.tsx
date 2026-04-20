'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Package, TrendingUp, Users, Clock, ChevronRight, RefreshCw } from 'lucide-react-native';
import { format } from 'date-fns';
import { io } from 'socket.io-client';

export default function SellerHome() {
  const [seller, setSeller] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<'new' | 'preparing' | 'ready' | 'delivery' | 'history'>('new');

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
    const interval = setInterval(fetchData, 30000); // Less frequent poll if we have sockets

    const socket = io({
      transports: ['polling', 'websocket'],
    });

    socket.emit('join', 'seller_r1');
    socket.emit('join', 'admin');

    socket.on('newOrder', (order) => {
      console.log('[SellerHome] Socket: Nouveau commande reçue');
      setOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
    });

    socket.on('orderUpdated', (order) => {
      console.log('[SellerHome] Socket: Commande mise à jour', order.id, order.status);
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log(`[SellerHome] Mise à jour de la commande ${orderId} vers ${newStatus}`);
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        console.log('[SellerHome] Statut mis à jour avec succès');
        // Auto-switch tabs based on the new status to show the movement
        if (newStatus === 'accepted' || newStatus === 'preparing') {
          setActiveTab('preparing');
        } else if (newStatus === 'ready') {
          setActiveTab('ready');
        }
        fetchData();
      } else {
        const err = await response.json();
        console.error('[SellerHome] Échec de la mise à jour du statut:', err);
        alert(`Erreur: ${err.error || 'Inconnue'}`);
        fetchData();
      }
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const getFilteredOrders = () => {
    const sorted = [...orders].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    
    switch (activeTab) {
      case 'new':
        return sorted.filter(o => o.status === 'pending');
      case 'preparing':
        return sorted.filter(o => o.status === 'accepted' || o.status === 'preparing');
      case 'ready':
        return sorted.filter(o => o.status === 'ready');
      case 'delivery':
        return sorted.filter(o => o.status === 'picked_up' || o.status === 'delivering');
      case 'history':
        return sorted.filter(o => ['delivered', 'cancelled'].includes(o.status));
      default:
        return [];
    }
  };

  const displayOrders = getFilteredOrders();

  const dailyRevenue = orders
    .filter(o => ['delivered', 'picked_up', 'delivering'].includes(o.status) && o.date && new Date(o.date).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
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
            <Text style={styles.statVal}>{dailyRevenue.toLocaleString()} FCFA</Text>
            <Text style={styles.statLabel}>CA du jour</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
            <Package size={24} color="#2563eb" />
            <Text style={styles.statVal}>{orders.length}</Text>
            <Text style={styles.statLabel}>Total Commandes</Text>
          </View>
        </View>

        {/* Status Tabs */}
        <View style={styles.tabWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.tabContainer}
          >
            <TabButton active={activeTab === 'new'} count={orders.filter(o => o.status === 'pending').length} label="Nouvelles" onPress={() => setActiveTab('new')} />
            <TabButton active={activeTab === 'preparing'} count={orders.filter(o => o.status === 'accepted' || o.status === 'preparing').length} label="En préparation" onPress={() => setActiveTab('preparing')} />
            <TabButton active={activeTab === 'ready'} count={orders.filter(o => o.status === 'ready').length} label="Prêtes" onPress={() => setActiveTab('ready')} />
            <TabButton active={activeTab === 'delivery'} count={orders.filter(o => ['picked_up', 'delivering'].includes(o.status)).length} label="Course" onPress={() => setActiveTab('delivery')} />
            <TabButton active={activeTab === 'history'} count={orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length} label="Historique" onPress={() => setActiveTab('history')} />
          </ScrollView>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#8b5cf6" style={{ marginTop: 40 }} />
        ) : displayOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color="#e2e8f0" />
            <Text style={styles.emptyText}>Aucune commande dans cette section</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {displayOrders.map(order => (
              activeTab === 'history' ? (
                <HistoryItem key={order.id} order={order} />
              ) : (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onUpdateStatus={handleUpdateStatus}
                />
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

function HistoryItem({ order }: { order: any }) {
  const time = order.date ? format(new Date(order.date), 'dd/MM HH:mm') : '--/--';
  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      case 'picked_up': return 'Récupérée';
      case 'delivering': return 'En cours';
      default: return status;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#22c55e';
      case 'cancelled': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <View style={styles.historyItem}>
      <View style={styles.historyInfo}>
        <Text style={styles.historyId}>#{order.id.slice(-4).toUpperCase()}</Text>
        <Text style={styles.historyDate}>{time}</Text>
      </View>
      <View style={styles.historyRight}>
        <Text style={styles.historyAmount}>{order.total.toLocaleString()} FCFA</Text>
        <Text style={[styles.historyStatus, { color: getStatusColor(order.status) }]}>
          {getStatusText(order.status)}
        </Text>
      </View>
    </View>
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
  orderCard: { 
    backgroundColor: '#fff', 
    padding: 18, 
    borderRadius: 24, 
    marginBottom: 16, 
    borderLeftWidth: 6, 
    borderLeftColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  highlightCard: { borderLeftColor: '#22c55e', backgroundColor: '#f0fdf4' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  orderId: { fontWeight: '900', fontSize: 16, color: '#1e293b' },
  orderTime: { fontSize: 13, color: '#64748b', fontWeight: 'bold', backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  orderItems: { fontSize: 14, color: '#475569', marginBottom: 16, lineHeight: 20, fontWeight: '500' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', color: '#64748b' },
  tabWrapper: { marginBottom: 20 },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#f1f5f9', 
    padding: 6, 
    borderRadius: 18,
    gap: 8
  },
  tabButton: { 
    paddingHorizontal: 20,
    paddingVertical: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    minWidth: 120
  },
  tabButtonActive: { 
    backgroundColor: '#fff', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4 
  },
  tabButtonText: { fontSize: 13, fontWeight: 'bold', color: '#94a3b8' },
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
