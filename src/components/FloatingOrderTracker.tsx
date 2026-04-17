'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';

interface FloatingOrderTrackerProps {
  onPress?: () => void;
}

export function FloatingOrderTracker({ onPress }: FloatingOrderTrackerProps) {
  const [activeOrder, setActiveOrder] = useState<any>(null);

  useEffect(() => {
    const fetchActiveOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const orders = await res.json();
          // Find first active order
          const active = orders.find((o: any) => 
            !['delivered', 'cancelled', 'rejected'].includes(o.status)
          );
          setActiveOrder(active);
        }
      } catch (e) {
        console.error('Tracker error:', e);
      }
    };

    fetchActiveOrder();
    const interval = setInterval(fetchActiveOrder, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  if (!activeOrder) return null;

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente...';
      case 'accepted': return 'Acceptée';
      case 'preparing': return 'En cuisine...';
      case 'ready': return 'Prête pour livraison';
      case 'picked_up': return 'En cours de livraison';
      case 'delivering': return 'En cours de livraison';
      default: return 'Suivi de commande';
    }
  };

  const content = (
    <div className="pointer-events-auto block bg-black text-white rounded-2xl p-4 shadow-xl border border-white/10 overflow-hidden relative group">
      {/* Animated Background Pulse */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent"
      />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-xl">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Suivi de commande</p>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{getStatusText(activeOrder.status)}</p>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-1.5 h-1.5 rounded-full bg-orange-500"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors">
          <span className="text-sm font-medium">Voir</span>
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-4 right-4 z-[9999] pointer-events-none"
      >
        {onPress ? (
          <button onClick={onPress} className="w-full text-left pointer-events-auto">
            {content}
          </button>
        ) : (
          <Link 
            href={`/order/${activeOrder.id}`}
            className="pointer-events-auto block"
          >
            {content}
          </Link>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
