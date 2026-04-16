'use client';

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <View style={styles.container}>
      <CheckCircle2 size={80} color="#22c55e" />
      <Text style={styles.title}>Paiement Réussi !</Text>
      <Text style={styles.subtitle}>
        Votre commande #{orderId?.slice(-4).toUpperCase()} a été payée avec succès via PayUnit.
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
