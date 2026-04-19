'use client';

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { XCircle } from 'lucide-react-native';

export default function PaymentCancelPage() {
  return (
    <View style={styles.container}>
      <XCircle size={80} color="#ef4444" />
      <Text style={styles.title}>Paiement Annulé</Text>
      <Text style={styles.subtitle}>
        Le processus de paiement a été interrompu. Vous pouvez réessayer depuis votre historique de commandes.
      </Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => window.location.href = '/'}
      >
        <Text style={styles.buttonText}>Retour à l'accueil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 24,
    color: '#1e293b'
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
    lineHeight: 24
  },
  button: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
