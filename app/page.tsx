"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { LayoutDashboard, Smartphone, Monitor } from 'lucide-react';

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

export default function Home() {
  const [view, setView] = useState<'admin' | 'mobile'>('admin');

  const handleViewChange = (newView: 'admin' | 'mobile') => {
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
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${view === 'admin' ? 'bg-white text-violet-600 shadow-md scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
          >
            <Monitor className="w-4 h-4" /> Admin Web
          </button>
          <button 
            onClick={() => handleViewChange('mobile')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${view === 'mobile' ? 'bg-white text-violet-600 shadow-md scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
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
          <div className="h-full overflow-auto bg-white">
            <AdminDashboard />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-8 bg-gray-900">
            {/* Phone Frame */}
            <div className="relative w-[375px] h-[812px] bg-black rounded-[60px] shadow-2xl border-[8px] border-gray-800 overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-800 rounded-b-3xl z-50" />
              
              {/* Mobile Content */}
              <div className="w-full h-full bg-white">
                <MobileApp />
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-300 rounded-full z-50" />
            </div>
            
            <div className="ml-12 max-w-xs text-white">
              <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Aperçu Mobile</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Ceci est un rendu **React Native for Web**. 
                Le code utilisé ici est 100% compatible avec **Expo**.
                Vous pouvez tester la navigation et l'UI directement.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Debug Info */}
      <div className="fixed bottom-4 right-4 bg-black/80 text-white text-[10px] p-2 rounded-lg font-mono z-[200] pointer-events-none">
        VIEW: {view.toUpperCase()} | NEXT_JS: 15.0.0 | REACT: 19.0.0
      </div>
    </div>
  );
}
