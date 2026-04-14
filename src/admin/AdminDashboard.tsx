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
  const [isLoading, setIsLoading] = useState(true);
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
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [uRes, rRes] = await Promise.all([
          fetchWithTimeout('/api/users', { headers }),
          fetchWithTimeout('/api/sellers', { headers })
        ]);

        if (uRes.ok) setUsers(await (uRes as any).safeJson());
        if (rRes.ok) setSellers(await (rRes as any).safeJson());
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 font-sans flex">
      {/* Render Test */}
      <div className="hidden">AdminDashboard Loaded</div>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-violet-600 p-2 rounded-xl shadow-lg shadow-violet-200">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display font-black text-xl tracking-tight uppercase text-gray-900">Admin Portal</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={BarChart3} label="Tableau de Bord" />
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
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {activeView === 'dashboard' && "Vue d'ensemble"}
              {activeView === 'restaurants' && "Gestion des Vendeurs"}
              {activeView === 'users' && "Gestion des Utilisateurs"}
              {activeView === 'commissions' && "Configuration Commissions"}
            </h2>
            <p className="text-sm text-gray-500 font-medium">Super Administrateur</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-6 h-6" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center font-black text-violet-600">
              {user?.name?.[0] || 'A'}
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <h3 className="text-xl font-black mb-6">Taux de Commission</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Restaurants</label>
            <div className="flex items-center gap-4">
              <input type="number" defaultValue={15} className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold" />
              <span className="font-black text-gray-400">%</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Epiceries</label>
            <div className="flex items-center gap-4">
              <input type="number" defaultValue={10} className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold" />
              <span className="font-black text-gray-400">%</span>
            </div>
          </div>
          <button className="btn-primary w-full">Enregistrer les Taux</button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <h3 className="text-xl font-black mb-6">Frais de Livraison</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Frais de Base</label>
            <div className="flex items-center gap-4">
              <input type="number" defaultValue={2.50} className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold" />
              <span className="font-black text-gray-400">€</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Frais par KM</label>
            <div className="flex items-center gap-4">
              <input type="number" defaultValue={0.50} className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold" />
              <span className="font-black text-gray-400">€</span>
            </div>
          </div>
          <button className="btn-primary w-full">Mettre à jour les Frais</button>
        </div>
      </div>
    </div>
  );
}

function SettingsManagement() {
  return (
    <div className="max-w-2xl bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
      <h3 className="text-xl font-black mb-8">Paramètres Généraux</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nom de la Plateforme</label>
            <input type="text" defaultValue="Multi-App Portal" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold" />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email de Support</label>
            <input type="email" defaultValue="support@portal.com" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold" />
          </div>
        </div>
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-gray-300 text-violet-600 focus:ring-violet-500" />
            <span className="text-sm font-bold text-gray-700">Activer les notifications push</span>
          </label>
        </div>
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-gray-300 text-violet-600 focus:ring-violet-500" />
            <span className="text-sm font-bold text-gray-700">Maintenance du système</span>
          </label>
        </div>
        <div className="pt-4">
          <button className="btn-primary w-full">Sauvegarder les Paramètres</button>
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Volume d'Affaires" value={`${analytics.totalRevenue?.toLocaleString()} €`} icon={TrendingUp} trend="+15%" color="violet" />
        <StatCard label="Vendeurs Actifs" value={analytics.activeSellers} icon={Store} trend="+3" color="blue" />
        <StatCard label="Total Commandes" value={analytics.totalOrders} icon={ShoppingBag} trend="+12%" color="green" />
        <StatCard label="Revenu Commissions" value={`${analytics.commissionRevenue?.toLocaleString()} €`} icon={DollarSign} trend="+8%" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black mb-8">Croissance de la Plateforme</h3>
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
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black mb-8">Activité Récente</h3>
          <div className="space-y-6">
            {[
              { id: 1, user: 'Marc L.', action: 'Nouvelle commande', time: 'Il y a 2 min', amount: '42.50 €' },
              { id: 2, user: 'Sophie K.', action: 'Inscription vendeur', time: 'Il y a 15 min', amount: null },
              { id: 3, user: 'Jean D.', action: 'Paiement reçu', time: 'Il y a 1h', amount: '125.00 €' },
              { id: 4, user: 'Marie P.', action: 'Livraison terminée', time: 'Il y a 2h', amount: null },
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-violet-50 rounded-full flex items-center justify-center font-black text-violet-600 text-xs">
                    {item.user[0]}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{item.user}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{item.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  {item.amount && <p className="text-sm font-black text-violet-600">{item.amount}</p>}
                  <p className="text-[10px] text-gray-400 font-bold">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SellersManagement({ sellers }: { sellers: any[] }) {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-xl font-black">Tous les Vendeurs</h3>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Ajouter un Vendeur
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Établissement</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Type</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Statut</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sellers.map((r: any) => (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden">
                      <img src={`https://picsum.photos/seed/${r.name}/100`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-black text-sm">{r.name}</span>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                    {r.type || 'vendeur'}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    r.status === 'active' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  )}>
                    {r.status === 'active' ? 'Actif' : 'Suspendu'}
                  </span>
                </td>
                <td className="px-8 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-xl font-black">Gestion des Utilisateurs</h3>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Nouvel Utilisateur
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Utilisateur</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Rôle</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center font-black text-violet-600">
                      {u.name?.[0] || 'U'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-sm">{u.name}</span>
                      <span className="text-xs text-gray-400">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    u.role === 'admin' ? "bg-violet-100 text-violet-700" :
                    u.role === 'seller' ? "bg-orange-100 text-orange-700" :
                    u.role === 'driver' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  )}>
                    {u.role}
                  </span>
                </td>
                <td className="px-8 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    violet: "bg-violet-50 text-violet-600"
  };

  return (
    <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end justify-between">
        <h4 className="text-2xl font-black text-gray-900">{value}</h4>
        <span className={cn("text-xs font-black px-2 py-1 rounded-lg", trend.startsWith('+') ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
          {trend}
        </span>
      </div>
    </div>
  );
}
