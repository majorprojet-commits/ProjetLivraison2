"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LayoutDashboard, Smartphone, Monitor, ShoppingBag } from 'lucide-react';
import { io } from 'socket.io-client';

// Dynamically import MobileApp to avoid SSR issues with react-native-web
const MobileApp = dynamic(() => import('../src/mobile/MobileApp'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Chargement de l'App Mobile...</div>
});

// Dynamically import AdminDashboard to avoid SSR issues with Recharts
const AdminDashboard = dynamic(() => import('../src/admin/AdminDashboard'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Chargement du Dashboard Admin...</div>
});

// Dynamically import SellerDashboard
const SellerDashboard = dynamic(() => import('../src/admin/SellerDashboard'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Chargement du Dashboard Vendeur...</div>
});

export default function Home() {
  const [view, setView] = useState<'admin' | 'seller' | 'mobile'>('admin');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const sellerId = 'r1';

  useEffect(() => {
    const socket = io();
    
    socket.on('connect', () => {
      console.log('[Root Socket] Connected!', socket.id);
      setSocketConnected(true);
      socket.emit('join', `seller_${sellerId}`);
      socket.emit('join', 'admin');
    });

    socket.on('connect_error', (err) => {
      console.error('[Root Socket] Connection error:', err);
      setSocketConnected(false);
    });

    socket.on('newOrder', (order) => {
      console.log('[Root Socket] New order received:', order);
      setNotifications(prev => [{ 
        id: Date.now(), 
        message: `Nouvelle commande #${order.id.slice(-4).toUpperCase()}`, 
        orderId: order.id,
        type: 'new_order'
      }, ...prev]);
      
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play();
      } catch (e) {
        console.log('Audio play blocked');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleViewChange = (newView: 'admin' | 'seller' | 'mobile') => {
    console.log(`[Switcher] Changing view to: ${newView}`);
    setView(newView);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Top Switcher Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center z-[100]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => alert('Header clicked!')}>
          <div className="bg-purple-600 p-1.5 rounded-lg">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight uppercase">Multi-App Portal</span>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button 
            onClick={() => handleViewChange('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${view === 'admin' ? 'bg-white text-violet-600 shadow-md scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
          >
            <Monitor className="w-4 h-4" /> Admin Web
          </button>
          <button 
            onClick={() => handleViewChange('seller')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${view === 'seller' ? 'bg-white text-orange-600 shadow-md scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Vendeur Web
            {notifications.length > 0 && (
              <span className="ml-2 bg-orange-600 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-bounce">
                {notifications.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => handleViewChange('mobile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${view === 'mobile' ? 'bg-white text-violet-600 shadow-md scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
          >
            <Smartphone className="w-4 h-4" /> Mobile Apps
          </button>
        </div>

        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          AI Studio Build Preview
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {view === 'admin' ? (
          <div className="h-full overflow-auto bg-white scrollbar-hide">
            <AdminDashboard />
          </div>
        ) : view === 'seller' ? (
          <div className="h-full overflow-auto bg-white scrollbar-hide">
            <SellerDashboard 
              externalNotifications={notifications} 
              onClearNotifications={() => setNotifications([])}
              socketConnected={socketConnected}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-4 md:p-8 bg-gray-900 overflow-y-auto">
            {/* Phone Frame */}
            <div className="relative w-[375px] h-[812px] bg-black rounded-[60px] shadow-2xl border-[8px] border-gray-800 overflow-hidden shrink-0">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-800 rounded-b-3xl z-50" />
              
              {/* Mobile Content */}
              <div className="w-full h-full bg-white flex flex-col overflow-hidden">
                <MobileApp />
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-300 rounded-full z-50" />
            </div>
            
            <div className="ml-12 hidden lg:block max-w-xs text-white">
              <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Aperçu Multi-App</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Utilisez les onglets en bas de l'écran mobile pour basculer entre les interfaces **Client**, **Vendeur** et **Livreur**.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase">App Client</p>
                    <p className="text-[10px] text-gray-500">Commander des repas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase">App Vendeur</p>
                    <p className="text-[10px] text-gray-500">Gérer les commandes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Debug Info */}
      <div className="fixed bottom-4 right-4 bg-black/80 text-white text-[10px] p-2 rounded-lg font-mono z-[200] pointer-events-none">
        VIEW: {view.toUpperCase()} | NEXT_JS: 15.1.0 | REACT: 19.0.0
      </div>
    </div>
  );
}
