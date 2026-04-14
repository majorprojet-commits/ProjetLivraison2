import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { User, Settings, CreditCard, MapPin, Bell, LogOut, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: 'https://picsum.photos/seed/user/200' }} style={styles.avatar} />
          </View>
          <Text style={styles.userName}>Jean Dupont</Text>
          <Text style={styles.userEmail}>jean.dupont@email.com</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mon Compte</Text>
        <ProfileItem icon={User} label="Informations personnelles" />
        <ProfileItem icon={MapPin} label="Mes adresses" />
        <ProfileItem icon={CreditCard} label="Moyens de paiement" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        <ProfileItem icon={Bell} label="Notifications" />
        <ProfileItem icon={Settings} label="Paramètres" />
      </View>

      <TouchableOpacity style={styles.logoutBtn}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ProfileItem({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <TouchableOpacity style={styles.item}>
      <View style={styles.itemLeft}>
        <View style={styles.iconBox}>
          <Icon size={20} color="#64748b" />
        </View>
        <Text style={styles.itemLabel}>{label}</Text>
      </View>
      <ChevronRight size={20} color="#cbd5e1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', padding: 32, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  profileInfo: { alignItems: 'center' },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, padding: 4, backgroundColor: '#f5f3ff', marginBottom: 16 },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  userName: { fontSize: 22, fontWeight: '900', color: '#1e293b', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 16, borderRadius: 20, marginBottom: 8 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, backgroundColor: '#f8fafc', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontSize: 15, fontWeight: 'bold', color: '#334155' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 40, marginBottom: 40, padding: 16 },
  logoutText: { color: '#ef4444', fontWeight: '900', fontSize: 16 }
});
