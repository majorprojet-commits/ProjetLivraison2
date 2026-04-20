"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  LogOut, Shield, Store, Users, BarChart3, 
  Utensils, Receipt, MessageSquare, Tag, 
  Settings, Bell, AlertTriangle, TrendingUp,
  ShoppingBag, Star, Plus, Trash2, Edit3,
  Navigation, MapPin, Globe, DollarSign,
  CheckCircle, XCircle, Ban, Search, Filter,
  Truck, FileText, Activity, Send, Clock
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
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
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

  const [isAddSellerOpen, setIsAddSellerOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newSeller, setNewSeller] = useState({ name: '', type: 'restaurant' });
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'client' });

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [uRes, rRes, sRes, oRes, dRes, pRes, lRes, diRes] = await Promise.all([
        fetchWithTimeout('/api/users', { headers }).catch(() => null),
        fetchWithTimeout('/api/sellers', { headers }).catch(() => null),
        fetchWithTimeout('/api/admin/stats', { headers }).catch(() => null),
        fetchWithTimeout('/api/orders', { headers }).catch(() => null),
        fetchWithTimeout('/api/admin/drivers', { headers }).catch(() => null),
        fetchWithTimeout('/api/admin/promos', { headers }).catch(() => null),
        fetchWithTimeout('/api/admin/audit', { headers }).catch(() => null),
        fetchWithTimeout('/api/admin/disputes', { headers }).catch(() => null)
      ]);

      if (uRes && uRes.ok) setUsers(await (uRes as any).safeJson());
      if (rRes && rRes.ok) setSellers(await (rRes as any).safeJson());
      if (sRes && sRes.ok) setAnalytics(await (sRes as any).safeJson());
      if (oRes && oRes.ok) setOrders(await (oRes as any).safeJson());
      if (dRes && dRes.ok) setDrivers(await (dRes as any).safeJson());
      if (pRes && pRes.ok) setPromos(await (pRes as any).safeJson());
      if (lRes && lRes.ok) setAuditLogs(await (lRes as any).safeJson());
      if (diRes && diRes.ok) setDisputes(await (diRes as any).safeJson());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleUpdateSellerStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/sellers/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Failed to update seller status', e);
    }
  };

  const handleDeleteSeller = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce vendeur ?')) return;
    try {
      const res = await fetch(`/api/admin/sellers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Failed to delete seller', e);
    }
  };

  const handleToggleUserBan = async (id: string, currentBanStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/ban`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isBanned: !currentBanStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Failed to update user ban status', e);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Failed to delete user', e);
    }
  };

  const handleAddSeller = async () => {
    if (!newSeller.name) return;
    try {
      const res = await fetch('/api/sellers', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name: newSeller.name, 
          type: newSeller.type, 
          status: 'active', 
          rating: 5.0, 
          deliveryTime: '20-30 min', 
          deliveryFee: 500 
        })
      });
      if (res.ok) {
        setIsAddSellerOpen(false);
        setNewSeller({ name: '', type: 'restaurant' });
        fetchData();
      }
    } catch (e) {
      console.error('Failed to add seller', e);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) return;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...newUser, password: 'password123' })
      });
      if (res.ok) {
        setIsAddUserOpen(false);
        setNewUser({ name: '', email: '', role: 'client' });
        fetchData();
      }
    } catch (e) {
      console.error('Failed to add user', e);
    }
  };

  const handleUpdateCommission = async (rate: number) => {
    try {
      const res = await fetch('/api/admin/config/commissions', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rate })
      });
      if (res.ok) {
        alert('Taux de commission mis à jour !');
        fetchData();
      }
    } catch (e) {
      console.error('Failed to update commission rate', e);
    }
  };

  const handleUpdateSettings = async (settings: any) => {
    alert('Paramètres enregistrés avec succès !');
    // For now we just mock this as it usually involves multiple config keys
  };

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
          <NavItem active={activeView === 'orders'} onClick={() => setActiveView('orders')} icon={ShoppingBag} label="Commandes" />
          <NavItem active={activeView === 'restaurants'} onClick={() => setActiveView('restaurants')} icon={Store} label="Vendeurs" />
          <NavItem active={activeView === 'users'} onClick={() => setActiveView('users')} icon={Users} label="Utilisateurs" />
          <NavItem active={activeView === 'drivers'} onClick={() => setActiveView('drivers')} icon={Truck} label="Livreurs" />
          <NavItem active={activeView === 'commissions'} onClick={() => setActiveView('commissions')} icon={DollarSign} label="Commissions" />
          <NavItem active={activeView === 'support'} onClick={() => setActiveView('support')} icon={MessageSquare} label="Support & Litiges" />
          <NavItem active={activeView === 'zones'} onClick={() => setActiveView('zones')} icon={MapPin} label="Zones" />
          <div className="pt-4 pb-2 px-4">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic serif">Système & Marketing</p>
          </div>
          <NavItem active={activeView === 'all_promos'} onClick={() => setActiveView('all_promos')} icon={Tag} label="Promos Globales" />
          <NavItem active={activeView === 'audit'} onClick={() => setActiveView('audit')} icon={Activity} label="Audit & Logs" />
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
                {activeView === 'orders' && "Gestion des Commandes"}
                {activeView === 'restaurants' && "Gestion des Vendeurs"}
                {activeView === 'users' && "Gestion des Utilisateurs"}
                {activeView === 'drivers' && "Gestion des Livreurs"}
                {activeView === 'commissions' && "Configuration Commissions"}
                {activeView === 'support' && "Support & Litiges"}
                {activeView === 'zones' && "Zones de Livraison"}
                {activeView === 'all_promos' && "Promotions Globales"}
                {activeView === 'audit' && "Audit & Sécurité"}
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
          {activeView === 'orders' && <OrdersManagement orders={orders} />}
          {activeView === 'restaurants' && (
            <SellersManagement 
              sellers={sellers} 
              onUpdateStatus={handleUpdateSellerStatus} 
              onDelete={handleDeleteSeller} 
              onAdd={() => setIsAddSellerOpen(true)}
            />
          )}
          {activeView === 'users' && (
            <UsersManagement 
              users={users} 
              onToggleBan={handleToggleUserBan} 
              onDelete={handleDeleteUser} 
              onAdd={() => setIsAddUserOpen(true)}
            />
          )}
          {activeView === 'drivers' && <DriversManagement drivers={drivers} token={token} onRefresh={fetchData} />}
          {activeView === 'all_promos' && <AllPromosManagement promos={promos} token={token} onRefresh={fetchData} />}
          {activeView === 'audit' && <AuditLogsView logs={auditLogs} />}
          {activeView === 'support' && <SupportView disputes={disputes} token={token} onRefresh={fetchData} />}
          {activeView === 'zones' && <ZonesManagement token={token} />}
          {activeView === 'commissions' && <CommissionsManagement onUpdateCommission={handleUpdateCommission} />}
          {activeView === 'settings' && <SettingsManagement onSave={handleUpdateSettings} />}
        </div>
      </main>

      {/* Add Seller Modal */}
      {isAddSellerOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black mb-2 italic serif">Nouveau Vendeur</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Ajouter un établissement à Douala / Yaoundé</p>
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nom de l'établissement</label>
                <input 
                  type="text" 
                  value={newSeller.name} 
                  onChange={(e) => setNewSeller({...newSeller, name: e.target.value})}
                  className="w-full bg-gray-50 border border-transparent focus:border-violet-200 focus:bg-white rounded-2xl px-6 py-4 font-black transition-all outline-none"
                  placeholder="ex: Le Terroir"
                />
              </div>
              
              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Type de commerce</label>
                <select 
                   value={newSeller.type} 
                   onChange={(e) => setNewSeller({...newSeller, type: e.target.value})}
                   className="w-full bg-gray-50 border border-transparent focus:border-violet-200 focus:bg-white rounded-2xl px-6 py-4 font-black transition-all outline-none"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="supermarket">Supermarché</option>
                  <option value="clothing">Boutique de vêtements</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsAddSellerOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all">Annuler</button>
                <button onClick={handleAddSeller} className="flex-1 py-4 bg-violet-600 text-white font-black rounded-2xl hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all">Créer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black mb-2 italic serif">Nouvel Utilisateur</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Créer un nouveau compte utilisateur</p>
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nom Complet</label>
                <input 
                  type="text" 
                  value={newUser.name} 
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-gray-50 border border-transparent focus:border-violet-200 focus:bg-white rounded-2xl px-6 py-4 font-black transition-all outline-none"
                  placeholder="Jean Dupont"
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                <input 
                  type="email" 
                  value={newUser.email} 
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-gray-50 border border-transparent focus:border-violet-200 focus:bg-white rounded-2xl px-6 py-4 font-black transition-all outline-none"
                  placeholder="jean@example.com"
                />
              </div>
              
              <div className="group">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Rôle</label>
                <select 
                   value={newUser.role} 
                   onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                   className="w-full bg-gray-50 border border-transparent focus:border-violet-200 focus:bg-white rounded-2xl px-6 py-4 font-black transition-all outline-none"
                >
                  <option value="client">Client</option>
                  <option value="seller">Vendeur</option>
                  <option value="driver">Livreur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsAddUserOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all">Annuler</button>
                <button onClick={handleAddUser} className="flex-1 py-4 bg-violet-600 text-white font-black rounded-2xl hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all">Créer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommissionsManagement({ onUpdateCommission }: { onUpdateCommission: (rate: number) => void }) {
  const [rate, setRate] = useState(15);
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
              <input 
                type="number" 
                value={rate} 
                onChange={(e) => setRate(Number(e.target.value))}
                className="flex-1 bg-transparent border-none font-black text-lg focus:outline-none" 
              />
              <span className="font-black text-gray-400">%</span>
            </div>
          </div>
          
          <button 
            onClick={() => onUpdateCommission(rate)}
            className="btn-primary w-full py-4 shadow-lg shadow-violet-200 mt-4"
          >
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
              <input type="number" defaultValue={500} className="flex-1 bg-transparent border-none font-black text-lg focus:outline-none" />
              <span className="font-black text-gray-400">FCFA</span>
            </div>
          </div>
          
          <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Frais par Kilomètre</label>
            <div className="flex items-center gap-4 bg-gray-50 border border-transparent group-focus-within:border-blue-200 group-focus-within:bg-white rounded-2xl px-6 py-4 transition-all">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <input type="number" defaultValue={100} className="flex-1 bg-transparent border-none font-black text-lg focus:outline-none" />
              <span className="font-black text-gray-400">FCFA</span>
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

function SettingsManagement({ onSave }: { onSave: (settings: any) => void }) {
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
          <button 
            onClick={() => onSave({})}
            className="btn-primary w-full py-5 text-lg shadow-xl shadow-violet-100"
          >
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
        <StatCard label="Volume d'Affaires" value={`${analytics.totalRevenue?.toLocaleString()} FCFA`} icon={TrendingUp} trend="+15%" color="violet" />
        <StatCard label="Vendeurs Actifs" value={analytics.activeSellers} icon={Store} trend="+3" color="blue" />
        <StatCard label="Total Commandes" value={analytics.totalOrders} icon={ShoppingBag} trend="+12%" color="green" />
        <StatCard label="Revenu Commissions" value={`${analytics.commissionRevenue?.toLocaleString()} FCFA`} icon={DollarSign} trend="+8%" color="orange" />
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
              { id: 1, user: 'Marc L.', action: 'Nouvelle commande', time: 'Il y a 2 min', amount: '4 250 FCFA', img: 'https://picsum.photos/seed/marc/100' },
              { id: 2, user: 'Sophie K.', action: 'Inscription vendeur', time: 'Il y a 15 min', amount: null, img: 'https://picsum.photos/seed/sophie/100' },
              { id: 3, user: 'Jean D.', action: 'Paiement reçu', time: 'Il y a 1h', amount: '12 500 FCFA', img: 'https://picsum.photos/seed/jean/100' },
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

function SellersManagement({ sellers, onUpdateStatus, onDelete, onAdd }: { sellers: any[], onUpdateStatus: (id: string, currentStatus: string) => void, onDelete: (id: string) => void, onAdd: () => void }) {
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
          <button 
            onClick={onAdd}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-violet-200"
          >
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
                      <img src={r.image || `https://picsum.photos/seed/${r.name}/200`} alt="" className="w-full h-full object-cover" />
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
                  <button 
                    onClick={() => onUpdateStatus(r.id, r.status)}
                    className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className={cn("w-2 h-2 rounded-full", r.status === 'active' ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      r.status === 'active' ? "text-green-600" : "text-red-600"
                    )}>
                      {r.status === 'active' ? 'Actif' : 'Suspendu'}
                    </span>
                  </button>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-violet-600 hover:border-violet-100 rounded-xl transition-all shadow-sm">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(r.id)}
                      className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 rounded-xl transition-all shadow-sm"
                    >
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

function UsersManagement({ users, onToggleBan, onDelete, onAdd }: { users: any[], onToggleBan: (id: string, currentStatus: boolean) => void, onDelete: (id: string) => void, onAdd: () => void }) {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
        <div>
          <h3 className="text-xl font-black text-gray-900">Gestion des Utilisateurs</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{users.length} comptes actifs</p>
        </div>
        <button 
          onClick={onAdd}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-violet-200"
        >
          <Plus className="w-5 h-5" /> Nouvel Utilisateur
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 text-left">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic serif">Utilisateur</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic serif">Rôle</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic serif">Statut</th>
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
                <td className="px-8 py-5">
                  <button 
                    onClick={() => onToggleBan(u.id, u.isBanned)}
                    className="flex items-center gap-2 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className={cn("w-2 h-2 rounded-full", !u.isBanned ? "bg-green-500" : "bg-red-500")} />
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      !u.isBanned ? "text-green-600" : "text-red-600"
                    )}>
                      {!u.isBanned ? 'Actif' : 'Banni'}
                    </span>
                  </button>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-violet-600 hover:border-violet-100 rounded-xl transition-all shadow-sm">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(u.id)}
                      className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 rounded-xl transition-all shadow-sm"
                    >
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

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any;
  trend: string;
  color: 'orange' | 'blue' | 'green' | 'red' | 'violet';
}

function OrdersManagement({ orders }: { orders: any[] }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['delivered', 'cancelled'].includes(o.status);
    if (filter === 'completed') return ['delivered', 'cancelled'].includes(o.status);
    return true;
  });

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
        <div>
          <h3 className="text-xl font-black text-gray-900">Toutes les Commandes</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{filteredOrders.length} commandes filtrées</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          <button onClick={() => setFilter('all')} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filter === 'all' ? "bg-violet-600 text-white shadow-md" : "text-gray-400")}>Toutes</button>
          <button onClick={() => setFilter('active')} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filter === 'active' ? "bg-violet-600 text-white shadow-md" : "text-gray-400")}>En cours</button>
          <button onClick={() => setFilter('completed')} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filter === 'completed' ? "bg-violet-600 text-white shadow-md" : "text-gray-400")}>Terminées</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 text-left">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic serif">Commande</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic serif">Vendeur</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic serif">Date</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic serif">Statut</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic serif text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredOrders.map((o: any) => (
              <tr key={o.id} className="hover:bg-gray-50/80 transition-all group">
                <td className="px-8 py-5 font-black text-sm text-gray-900">#{o.id.slice(-4).toUpperCase()}</td>
                <td className="px-8 py-5 font-bold text-xs text-gray-600 truncate max-w-[150px]">{o.sellerId}</td>
                <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{o.date ? format(new Date(o.date), 'dd/MM HH:mm') : '--/--'}</td>
                <td className="px-8 py-5">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                    o.status === 'pending' ? "bg-amber-100 text-amber-700" :
                    o.status === 'delivered' ? "bg-green-100 text-green-700" :
                    o.status === 'cancelled' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {o.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                   <button className="text-gray-400 hover:text-violet-600 transition-colors">
                     <Edit3 className="w-4 h-4" />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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

function DriversManagement({ drivers, token, onRefresh }: { drivers: any[], token: string, onRefresh: () => void }) {
  const handleVerify = async (userId: string, status: 'verified' | 'rejected' | 'pending') => {
    try {
      await fetch(`/api/admin/drivers/${userId}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Demandes de Livreurs</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Livreur</th>
              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td className="px-8 py-5">
                  <p className="font-black text-sm text-gray-900">{driver.name}</p>
                  <p className="text-[10px] text-gray-400">{driver.email}</p>
                </td>
                <td className="px-8 py-5">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                    driver.driverInfo?.verificationStatus === 'verified' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {driver.driverInfo?.verificationStatus || 'pending'}
                  </span>
                </td>
                <td className="px-8 py-5 text-right flex justify-end gap-2">
                  <button onClick={() => handleVerify(driver.id, 'verified')} className="p-2 text-green-500 hover:bg-green-50 rounded-xl transition-colors"><CheckCircle className="w-4 h-4" /></button>
                  <button onClick={() => handleVerify(driver.id, 'rejected')} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Ban className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AllPromosManagement({ promos, token, onRefresh }: { promos: any[], token: string, onRefresh: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', discountValue: 10 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsOpen(false);
      onRefresh();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-gray-900 italic serif">Promos Globales</h3>
        <button onClick={() => setIsOpen(true)} className="bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">Nouveau Code</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos.map(promo => (
          <div key={promo.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="bg-violet-600 px-4 py-2 rounded-xl text-white font-black text-lg inline-block mb-4">{promo.code}</div>
            <p className="text-xs font-bold text-gray-600">{promo.discountValue}% de réduction</p>
          </div>
        ))}
      </div>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-lg shadow-2xl">
            <h3 className="text-2xl font-black mb-8 italic serif">Créer Promo</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input type="text" placeholder="CODE" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full bg-gray-50 rounded-2xl px-6 py-4 text-sm font-bold" />
              <button type="submit" className="w-full py-5 bg-violet-600 text-white rounded-2xl font-black uppercase">Créer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditLogsView({ logs }: { logs: any[] }) {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Audit Système</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-8 py-4 text-[10px] font-bold text-gray-400">{format(new Date(log.timestamp), 'dd/MM HH:mm')}</td>
                <td className="px-8 py-4 text-xs font-black text-gray-900">{log.action}</td>
                <td className="px-8 py-4 text-xs text-gray-600">{log.adminEmail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SupportView({ disputes, token, onRefresh }: { disputes: any[], token: string, onRefresh: () => void }) {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Support & Litiges</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sujet</th>
              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {disputes.map((dispute) => (
              <tr key={dispute.id}>
                <td className="px-8 py-5">
                  <p className="font-black text-sm text-gray-900">{dispute.subject}</p>
                  <p className="text-[10px] text-gray-400">{dispute.description}</p>
                </td>
                <td className="px-8 py-5">
                  <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", dispute.status === 'open' ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>
                    {dispute.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ZonesManagement({ token }: { token: string }) {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-16 text-center italic text-gray-400 font-bold uppercase tracking-widest text-[10px]">
      Module de gestion des zones de Douala / Yaoundé en préparation...
    </div>
  );
}
