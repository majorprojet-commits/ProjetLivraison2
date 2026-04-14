import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Navigation, MapPin, DollarSign, Clock, CheckCircle } from 'lucide-react-native';
import { DriverOffer, HistoryItem as HistoryItemType } from '../types';

export default function DriverHome() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Livreur</Text>
        <View style={styles.statusToggle}>
          <View style={styles.onlineDot} />
          <Text style={styles.statusText}>En ligne</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <View>
            <Text style={styles.earningsLabel}>Gains du jour</Text>
            <Text style={styles.earningsVal}>42.50€</Text>
          </View>
          <View style={styles.earningsStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValSmall}>8</Text>
              <Text style={styles.statLabelSmall}>Courses</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValSmall}>4.5h</Text>
              <Text style={styles.statLabelSmall}>Temps</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Offres Disponibles</Text>

        <OfferCard 
          restaurant="Burger King" 
          distance="1.2 km" 
          payout="5.50€" 
          address="12 Rue de Rivoli, Paris" 
        />
        
        <OfferCard 
          restaurant="Pizza Hut" 
          distance="2.5 km" 
          payout="7.20€" 
          address="45 Blvd Haussmann, Paris" 
        />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Historique Récent</Text>
        <HistoryItem restaurant="Sushi Shop" time="Il y a 20 min" amount="6.00€" />
        <HistoryItem restaurant="McDo" time="Il y a 1h" amount="5.20€" />
      </ScrollView>
    </View>
  );
}

function OfferCard({ restaurant, distance, payout, address }: DriverOffer) {
  return (
    <View style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant}</Text>
          <Text style={styles.distanceText}>{distance} de vous</Text>
        </View>
        <Text style={styles.payoutText}>{payout}</Text>
      </View>
      <View style={styles.addressRow}>
        <MapPin size={14} color="#94a3b8" />
        <Text style={styles.addressText} numberOfLines={1}>{address}</Text>
      </View>
      <TouchableOpacity style={styles.acceptBtn}>
        <Text style={styles.acceptBtnText}>Accepter la course</Text>
      </TouchableOpacity>
    </View>
  );
}

function HistoryItem({ restaurant, time, amount }: HistoryItemType) {
  return (
    <View style={styles.historyItem}>
      <View style={styles.historyIcon}><CheckCircle size={20} color="#22c55e" /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.historyName}>{restaurant}</Text>
        <Text style={styles.historyTime}>{time}</Text>
      </View>
      <Text style={styles.historyAmount}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '900' },
  statusToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  onlineDot: { width: 8, height: 8, backgroundColor: '#22c55e', borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#166534' },
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
  historyAmount: { fontWeight: '900', fontSize: 14, color: '#334155' }
});
