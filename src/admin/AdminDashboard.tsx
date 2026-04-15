"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  LogOut, Shield, Store, Users, BarChart3, 
  Utensils, Receipt, MessageSquare, Tag, 
  Settings, Bell, AlertTriangle, TrendingUp,
  ShoppingBag, Star, Plus, Trash2, Edit3,
  Navigation, MapPin, Globe, DollarSign,
  CheckCircle, XCircle, Ban, Search, Filter
} from 'lucide-react';
import { cn, fetchWithTimeout } from '../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { format } from 'date-fns';

// We'll skip Leaflet for the initial preview to avoid SSR/Client issues in Next.js
// but we can add it back later with dynamic imports

interface AdminDashboardProps {
  token?: string;
  onLogout?: () => void;
  user?: {
    role: string;
    name: string;
  };
}

export default function AdminDashboard({ 
  token = 'dev-token', 
  onLogout = () => {}, 
  user = { role: 'admin', name: 'Admin' } 
}: AdminDashboardProps) {
  const [activeView, setActiveView] = useState<string>('dashboard');
  
  console.log('[AdminDashboard] Rendering with view:', activeView);
  const [isLoading, setIsLoading] = useState(false); // Start with false to show mock data immediately
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    totalRevenue: 154200,
    activeSellers: 42,
    totalOrders: 1250,
    commissionRevenue: 23130,
    revenueHistory: [
      { date: 'Lun', amount: 1100 },
      { date: 'Mar', amount: 1300 },
      { date: 'Mer', amount: 950 },
      { date: 'Jeu', amount: 1400 },
      { date: 'Ven', amount: 1800 },
      { date: 'Sam', amount: 2100 },
      { date: 'Dim', amount: 1600 }
    ]
  });

  const isSuperAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      setIsRefreshing(true);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [uRes, rRes] = await Promise.all([
          fetchWithTimeout('/api/users', { headers }).catch(() => null),
          fetchWithTimeout('/api/sellers', { headers }).catch(() => null)
        ]);

        if (uRes && uRes.ok) setUsers(await (uRes as any).safeJson());
        if (rRes && rRes.ok) setSellers(await (rRes as any).safeJson());
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsRefreshing(false);
      }
    };
    fetchData();
  }, [token]);

  return (
    <div className="min-h-full bg-gray-50 font-sans flex">
      {/* Refreshing Indicator */}
      {isRefreshing && (
        <div className="fixed top-4 right-4 z-[100] bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mise à jour...</span>
        </div>
      )}
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-violet-600 p-2 rounded-xl shadow-lg shadow-violet-200">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display font-black text-xl tracking-tight uppercase text-gray-900">Admin Portal</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={BarChart3} label="Dashboard" />
          <NavItem active={activeView === 'restaurants'} onClick={() => setActiveView('restaurants')} icon={Store} label="Vendeurs" />
          <NavItem active={activeView === 'users'} onClick={() => setActiveView('users')} icon={Users} label="Utilisateurs" />
          <NavItem active={activeView === 'commissions'} onClick={() => setActiveView('commissions')} icon={DollarSign} label="Commissions" />
          <NavItem active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={Settings} label="Paramètres" />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={onLogout} className="w-full flex items-center gap-3 text-red-500 font-bold text-sm p-3 rounded-xl hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md bg-white/80">
          <div className="flex items-center gap-8">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                {activeView === 'dashboard' && "Vue d'ensemble"}
                {activeView === 'restaurants' && "Gestion des Vendeurs"}
                {activeView === 'users' && "Gestion des Utilisateurs"}
                {activeView === 'commissions' && "Configuration Commissions"}
                {activeView === 'settings' && "Paramètres Système"}
              </h2>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Super Administrateur • {format(new Date(), 'dd MMMM yyyy')}</p>
            </div>
            
            <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 gap-3 w-64 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
              <Search className="w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Rechercher..." className="bg-transparent border-none text-xs font-bold w-full focus:outline-none" />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="p-2.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-violet-600 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">En ligne</p>
              </div>
              <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-violet-200">
                {user?.name?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto flex-1">
          {activeView === 'dashboard' && <SuperAdminDashboard analytics={analytics} />}
          {activeView === 'restaurants' && <SellersManagement sellers={sellers} />}
          {activeView === 'users' && <UsersManagement users={users} />}
          {activeView === 'commissions' && <CommissionsManagement />}
          {activeView === 'settings' && <SettingsManagement />}
        </div>
      </main>
    </div>
  );
}

function CommissionsManagement() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Taux de Commission</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Configuration des prélèvements</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Restaurants</label>
            <div className="flex items-center gap-4 bg-gray-50 border border-transparent group-focus-within:border-violet-200 group-focus-within:bg-white rounded-2xl px-6 py-4 transition-all">
              <Utensils className="w-5 h-5 text-gray-400" />
              <input type="number" defaultValue={15} className="flex-1 bg-transparent border-none font-black text-lg focus:outline-none" />
              <span className="font-black text-gray-400">%</span>
            </div>
          </div>
          
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Épiceries & Commerces</label>
            <div className="flex items-center gap-4 bg-gray-50 border border-transparent group-focus-within:border-violet-200 group-focus-within:bg-white rounded-2xl px-6 py-4 transition-all">
              <ShoppingBag className="w-5 h-5 text-gray-400" />
              <input type="number" defaultValue={10} className="flex-1 bg-transparent border-none font-black text-lg focus:outline-none" />
              <span className="font-black text-gray-400">%</span>
            </div>
          </div>
          
          <button className="btn-primary w-full py-4 shadow-lg shadow-violet-200 mt-4">
            Enregistrer les Taux
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Frais de Livraison</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logistique et transport</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Frais de Base</label>
            <div className="flex items-center gap-4 bg-gray-50 border border-transparent group-focus-within:border-blue-200 group-focus-within:bg-white rounded-2xl px-6 py-4 transition-all">
              <MapPin className="w-5 h-5 text-gray-400" />
              <input type="number" defaultValue={2.50} className="flex-1 bg-transparent border-none font-black text-lg focus:outline-none" />
              <span className="font-black text-gray-400">€</span>
            </div>
          </div>
          
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Frais par Kilomètre</label>
            <div className="flex items-center gap-4 bg-gray-50 border border-transparent group-focus-within:border-blue-200 group-focus-within:bg-white rounded-2xl px-6 py-4 transition-all">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <input type="number" defaultValue={0.50} className="flex-1 bg-transparent border-none font-black text-lg focus:outline-none" />
              <span className="font-black text-gray-400">€</span>
            </div>
          </div>
          
          <button className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all mt-4">
            Mettre à jour les Frais
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsManagement() {
  return (
    <div className="max-w-3xl bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-5 mb-10">
        <div className="w-14 h-14 bg-gray-50 text-gray-900 rounded-2xl flex items-center justify-center border border-gray-100">
          <Settings className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-900">Paramètres Système</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Configuration globale de la plateforme</p>
        </div>
      </div>

      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Nom de la Plateforme</label>
            <div className="bg-gray-50 border border-transparent group-focus-within:border-violet-200 group-focus-within:bg-white rounded-2xl px-6 py-4 transition-all">
              <input type="text" defaultValue="Multi-App Portal" className="w-full bg-transparent border-none font-black text-gray-900 focus:outline-none" />
            </div>
          </div>
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Email de Support</label>
            <div className="bg-gray-50 border border-transparent group-focus-within:border-violet-200 group-focus-within:bg-white rounded-2xl px-6 py-4 transition-all">
              <input type="email" defaultValue="support@portal.com" className="w-full bg-transparent border-none font-black text-gray-900 focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-6 bg-gray-50 rounded-[24px] cursor-pointer hover:bg-gray-100 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Bell className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">Notifications Push</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alertes temps réel pour les commandes</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="w-6 h-6 rounded-lg border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer" />
          </label>

          <label className="flex items-center justify-between p-6 bg-gray-50 rounded-[24px] cursor-pointer hover:bg-gray-100 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">Mode Maintenance</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Désactiver l'accès client temporairement</p>
              </div>
            </div>
            <input type="checkbox" className="w-6 h-6 rounded-lg border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer" />
          </label>
        </div>

        <div className="pt-4">
          <button className="btn-primary w-full py-5 text-lg shadow-xl shadow-violet-100">
            Sauvegarder les Paramètres
          </button>
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}

function NavItem({ active, onClick, icon: Icon, label }: NavItemProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all",
        active 
          ? "nav-item-active shadow-sm shadow-violet-100" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-violet-600" : "text-gray-400")} />
      {label}
    </button>
  );
}

interface SuperAdminDashboardProps {
  analytics: {
    totalRevenue: number;
    activeSellers: number;
    totalOrders: number;
    commissionRevenue: number;
    revenueHistory: Array<{ date: string; amount: number }>;
  };
}

function SuperAdminDashboard({ analytics }: SuperAdminDashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Volume d'Affaires" value={`${analytics.totalRevenue?.toLocaleString()} €`} icon={TrendingUp} trend="+15%" color="violet" />
        <StatCard label="Vendeurs Actifs" value={analytics.activeSellers} icon={Store} trend="+3" color="blue" />
        <StatCard label="Total Commandes" value={analytics.totalOrders} icon={ShoppingBag} trend="+12%" color="green" />
        <StatCard label="Revenu Commissions" value={`${analytics.commissionRevenue?.toLocaleString()} €`} icon={DollarSign} trend="+8%" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900">Croissance de la Plateforme</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Revenus hebdomadaires</p>
            </div>
            <select className="bg-gray-50 border-none text-xs font-black rounded-lg px-3 py-2 focus:ring-0 cursor-pointer">
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueHistory}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black mb-8">Activité Récente</h3>
          <div className="space-y-6">
            {[
              { id: 1, user: 'Marc L.', action: 'Nouvelle commande', time: 'Il y a 2 min', amount: '42.50 €', img: 'https://picsum.photos/seed/marc/100' },
              { id: 2, user: 'Sophie K.', action: 'Inscription vendeur', time: 'Il y a 15 min', amount: null, img: 'https://picsum.photos/seed/sophie/100' },
              { id: 3, user: 'Jean D.', action: 'Paiement reçu', time: 'Il y a 1h', amount: '125.00 €', img: 'https://picsum.photos/seed/jean/100' },
              { id: 4, user: 'Marie P.', action: 'Livraison terminée', time: 'Il y a 2h', amount: null, img: 'https://picsum.photos/seed/marie/100' },
              { id: 5, user: 'Paul R.', action: 'Avis 5 étoiles', time: 'Il y a 3h', amount: null, img: 'https://picsum.photos/seed/paul/100' },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-violet-200 transition-all">
                    <img src={item.img} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 group-hover:text-violet-600 transition-colors">{item.user}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  {item.amount && <p className="text-sm font-black text-gray-900">{item.amount}</p>}
                  <p className="text-[10px] text-gray-400 font-bold">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-violet-600 transition-colors">Voir tout l'historique</button>
        </div>
      </div>
    </div>
  );
}

function SellersManagement({ sellers }: { sellers: any[] }) {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
        <div>
          <h3 className="text-xl font-black text-gray-900">Tous les Vendeurs</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{sellers.length} établissements enregistrés</p>
        </div>
        <div className="flex gap-3">
          <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-all shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
          <button className="btn-primary flex items-center gap-2 shadow-lg shadow-violet-200">
            <Plus className="w-5 h-5" /> Ajouter un Vendeur
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 text-left">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic serif">Établissement</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic serif">Type</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic serif">Statut</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic serif text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sellers.map((r: any) => (
              <tr key={r.id} className="hover:bg-gray-50/80 transition-all group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                      <img src={`https://picsum.photos/seed/${r.name}/200`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="font-black text-sm text-gray-900 block">{r.name}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {r.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg">
                    {r.type || 'vendeur'}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", r.status === 'active' ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      r.status === 'active' ? "text-green-600" : "text-red-600"
                    )}>
                      {r.status === 'active' ? 'Actif' : 'Suspendu'}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-violet-600 hover:border-violet-100 rounded-xl transition-all shadow-sm">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 rounded-xl transition-all shadow-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersManagement({ users }: { users: any[] }) {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
        <div>
          <h3 className="text-xl font-black text-gray-900">Gestion des Utilisateurs</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{users.length} comptes actifs</p>
        </div>
        <button className="btn-primary flex items-center gap-2 shadow-lg shadow-violet-200">
          <Plus className="w-5 h-5" /> Nouvel Utilisateur
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 text-left">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic serif">Utilisateur</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic serif">Rôle</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic serif text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50/80 transition-all group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                      <img src={`https://picsum.photos/seed/${u.email}/200`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-sm text-gray-900">{u.name}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={cn(
                    "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                    u.role === 'admin' ? "bg-violet-100 text-violet-700" :
                    u.role === 'seller' ? "bg-orange-100 text-orange-700" :
                    u.role === 'driver' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  )}>
                    {u.role}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-violet-600 hover:border-violet-100 rounded-xl transition-all shadow-sm">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 rounded-xl transition-all shadow-sm">
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any;
  trend: string;
  color: 'orange' | 'blue' | 'green' | 'red' | 'violet';
}

function StatCard({ label, value, icon: Icon, trend, color }: StatCardProps) {
  const colors: any = {
    orange: "bg-orange-50 text-orange-600 ring-orange-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    green: "bg-green-50 text-green-600 ring-green-100",
    red: "bg-red-50 text-red-600 ring-red-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100"
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ring-4 transition-all group-hover:scale-110", colors[color])}>
        <Icon className="w-7 h-7" />
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <h4 className="text-3xl font-black text-gray-900 tracking-tighter">{value}</h4>
        <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg", trend.startsWith('+') ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
          <span className="text-[10px] font-black">{trend}</span>
        </div>
      </div>
    </div>
  );
}
