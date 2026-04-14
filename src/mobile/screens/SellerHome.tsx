import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Package, TrendingUp, Users, Clock, ChevronRight } from 'lucide-react-native';
import { Order } from '../types';

export default function SellerHome() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Dashboard Vendeur</Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#f5f3ff' }]}>
          <TrendingUp size={24} color="#9333ea" />
          <Text style={styles.statVal}>1,250€</Text>
          <Text style={styles.statLabel}>CA du jour</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
          <Package size={24} color="#2563eb" />
          <Text style={styles.statVal}>18</Text>
          <Text style={styles.statLabel}>Commandes</Text>
        </View>
      </View>

      {/* Active Orders Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Commandes Actives</Text>
        <TouchableOpacity><Text style={styles.seeAll}>Toutes</Text></TouchableOpacity>
      </View>

      <OrderCard id="8421" items="2x Whopper, 1x Fries" status="En préparation" time="12:45" />
      <OrderCard id="8422" items="1x Steakhouse, 1x Coke" status="Prêt" time="12:50" highlight />
      <OrderCard id="8423" items="3x Nuggets, 2x Sprite" status="En attente" time="13:05" />

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>Actions Rapides</Text>
      <TouchableOpacity style={styles.actionItem}>
        <View style={styles.actionIcon}><Clock size={20} color="#64748b" /></View>
        <Text style={styles.actionText}>Modifier les horaires</Text>
        <ChevronRight size={20} color="#cbd5e1" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionItem}>
        <View style={styles.actionIcon}><Users size={20} color="#64748b" /></View>
        <Text style={styles.actionText}>Gérer le personnel</Text>
        <ChevronRight size={20} color="#cbd5e1" />
      </TouchableOpacity>
    </ScrollView>
  );
}

function OrderCard({ id, items, status, time, highlight }: Order) {
  return (
    <TouchableOpacity style={[styles.orderCard, highlight && styles.highlightCard]}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{id}</Text>
        <Text style={styles.orderTime}>{time}</Text>
      </View>
      <Text style={styles.orderItems} numberOfLines={1}>{items}</Text>
      <View style={styles.orderFooter}>
        <View style={[styles.statusBadge, status === 'Prêt' && styles.readyBadge]}>
          <Text style={[styles.statusText, status === 'Prêt' && styles.readyText]}>{status}</Text>
        </View>
        <TouchableOpacity style={styles.detailBtn}><Text style={styles.detailBtnText}>Détails</Text></TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 24 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard: { flex: 1, padding: 16, borderRadius: 20, gap: 8 },
  statVal: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '900' },
  seeAll: { color: '#8b5cf6', fontWeight: 'bold', fontSize: 12 },
  orderCard: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 20, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#e2e8f0' },
  highlightCard: { borderLeftColor: '#22c55e', backgroundColor: '#f0fdf4' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  orderId: { fontWeight: '900', fontSize: 14 },
  orderTime: { fontSize: 12, color: '#94a3b8', fontWeight: 'bold' },
  orderItems: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { backgroundColor: '#e2e8f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', color: '#64748b' },
  readyBadge: { backgroundColor: '#dcfce7' },
  readyText: { color: '#166534' },
  detailBtn: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, borderColor: '#e2e8f0' },
  detailBtnText: { fontSize: 12, fontWeight: 'bold' },
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  actionIcon: { width: 40, height: 40, backgroundColor: '#f8fafc', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actionText: { flex: 1, fontWeight: 'bold', fontSize: 14, color: '#334155' }
});
