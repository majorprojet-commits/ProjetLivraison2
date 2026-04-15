"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, ShoppingBag, Utensils, Settings, 
  Bell, Search, TrendingUp, Clock, CheckCircle,
  Plus, Edit3, Trash2, DollarSign, Package,
  ChevronRight, Star, AlertCircle
} from 'lucide-react';
import { cn, fetchWithTimeout } from '../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { format } from 'date-fns';

interface SellerDashboardProps {
  sellerId?: string;
  token?: string;
  onLogout?: () => void;
}

export default function SellerDashboard({ 
  sellerId = 'r1', 
  token = 'dev-token',
  onLogout = () => {} 
}: SellerDashboardProps) {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = {
    revenue: 1240.50,
    ordersCount: 48,
    avgRating: 4.8,
    activeOrders: 5
  };

  const revenueData = [
    { name: 'Lun', total: 400 },
    { name: 'Mar', total: 300 },
    { name: 'Mer', total: 500 },
    { name: 'Jeu', total: 280 },
    { name: 'Ven', total: 590 },
    { name: 'Sam', total: 800 },
    { name: 'Dim', total: 600 },
  ];

  useEffect(() => {
    const fetchSellerData = async () => {
      setIsRefreshing(true);
      try {
        const response = await fetch(`/api/orders/seller/${sellerId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setOrders(await response.json());
        }
      } catch (error) {
        console.error("Failed to fetch seller orders:", error);
      } finally {
        setIsRefreshing(false);
      }
    };
    fetchSellerData();
  }, [sellerId, token]);

  return (
    <div className="min-h-full bg-gray-50 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-orange-600 p-2 rounded-xl shadow-lg shadow-orange-200">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display font-black text-xl tracking-tight uppercase text-gray-900">Seller Hub</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={BarChart3} label="Dashboard" />
          <NavItem active={activeView === 'orders'} onClick={() => setActiveView('orders')} icon={Package} label="Commandes" />
          <NavItem active={activeView === 'menu'} onClick={() => setActiveView('menu')} icon={ShoppingBag} label="Mon Menu" />
          <NavItem active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={Settings} label="Ma Boutique" />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={onLogout} className="w-full flex items-center gap-3 text-red-500 font-bold text-sm p-3 rounded-xl hover:bg-red-50 transition-colors">
            <Settings className="w-5 h-5" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md bg-white/80">
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              {activeView === 'dashboard' && "Tableau de Bord"}
              {activeView === 'orders' && "Gestion des Commandes"}
              {activeView === 'menu' && "Gestion du Menu"}
              {activeView === 'settings' && "Paramètres Boutique"}
            </h2>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Vendeur ID: {sellerId} • {format(new Date(), 'dd MMMM yyyy')}</p>
          </div>

          <div className="flex items-center gap-6">
            <button className="p-2.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-600 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right">
                <p className="text-xs font-black text-gray-900">Le Gourmet</p>
                <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Ouvert</p>
              </div>
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-orange-200">
                G
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto flex-1">
          {activeView === 'dashboard' && <SellerStatsView stats={stats} revenueData={revenueData} orders={orders} />}
          {activeView === 'orders' && <SellerOrdersView orders={orders} />}
          {activeView === 'menu' && <SellerMenuView />}
          {activeView === 'settings' && <SellerSettingsView />}
        </div>
      </main>
    </div>
  );
}

function SellerStatsView({ stats, revenueData, orders }: any) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Revenus (7j)" value={`${stats.revenue.toLocaleString()} €`} icon={DollarSign} trend="+12%" color="orange" />
        <StatCard label="Commandes" value={stats.ordersCount} icon={Package} trend="+5" color="blue" />
        <StatCard label="Note Moyenne" value={stats.avgRating} icon={Star} trend="Stable" color="green" />
        <StatCard label="En cours" value={stats.activeOrders} icon={Clock} trend="Live" color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-8">Performance des Ventes</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorSeller" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#ea580c" strokeWidth={4} fillOpacity={1} fill="url(#colorSeller)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black mb-8">Dernières Commandes</h3>
          <div className="space-y-6">
            {orders.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-black text-gray-900">#{order.id.slice(-4).toUpperCase()}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{order.total.toFixed(2)} €</p>
                  <p className="text-[10px] text-gray-400 font-bold">{order.date ? format(new Date(order.date), 'HH:mm') : '--:--'}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all">
            Voir toutes les commandes
          </button>
        </div>
      </div>
    </div>
  );
}

function SellerOrdersView({ orders }: { orders: any[] }) {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
        <div>
          <h3 className="text-xl font-black text-gray-900">Gestion des Commandes</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{orders.length} commandes au total</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
            <button className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-orange-600 text-white shadow-md">Toutes</button>
            <button className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600">En cours</button>
            <button className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600">Terminées</button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 text-left">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Commande</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Client</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Articles</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Statut</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((o: any) => (
              <tr key={o.id} className="hover:bg-gray-50/80 transition-all group">
                <td className="px-8 py-5">
                  <span className="font-black text-sm text-gray-900">#{o.id.slice(-4).toUpperCase()}</span>
                  <span className="block text-[10px] text-gray-400 font-bold">{o.date ? format(new Date(o.date), 'dd/MM HH:mm') : '--/--'}</span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-bold text-gray-600">Client ID: {o.userId.slice(0, 8)}</span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs font-medium text-gray-500">{o.items?.length || 0} articles</span>
                </td>
                <td className="px-8 py-5">
                  <span className="font-black text-sm text-gray-900">{o.total.toFixed(2)} €</span>
                </td>
                <td className="px-8 py-5">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                    o.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                    o.status === 'preparing' ? "bg-orange-100 text-orange-700" :
                    o.status === 'ready' ? "bg-blue-100 text-blue-700" :
                    o.status === 'delivered' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  )}>
                    {o.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                    <ChevronRight className="w-5 h-5" />
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

function SellerMenuView() {
  const menuItems = [
    { id: 1, name: 'Burger Classic', price: 12.50, category: 'Plats', status: 'available', img: 'https://picsum.photos/seed/burger/200' },
    { id: 2, name: 'Frites Maison', price: 4.50, category: 'Accompagnements', status: 'available', img: 'https://picsum.photos/seed/fries/200' },
    { id: 3, name: 'Salade César', price: 10.00, category: 'Plats', status: 'out_of_stock', img: 'https://picsum.photos/seed/salad/200' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-gray-900">Carte du Restaurant</h3>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Gérez vos plats et tarifs</p>
        </div>
        <button className="btn-primary flex items-center gap-2 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-100">
          <Plus className="w-5 h-5" /> Ajouter un Article
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menuItems.map(item => (
          <div key={item.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
            <div className="h-48 relative overflow-hidden">
              <img src={item.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900">
                {item.category}
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-lg text-gray-900">{item.name}</h4>
                  <p className="text-xl font-black text-orange-600">{item.price.toFixed(2)} €</p>
                </div>
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  item.status === 'available' ? "bg-green-500" : "bg-red-500"
                )} />
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-50">
                <button className="flex-1 py-2 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-all">Modifier</button>
                <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SellerSettingsView() {
  return (
    <div className="max-w-3xl bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-5 mb-10">
        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center border border-orange-100">
          <Store size={28} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-gray-900">Profil de la Boutique</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Informations publiques et horaires</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom du Restaurant</label>
            <input type="text" defaultValue="Le Gourmet" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-black text-gray-900 focus:ring-2 focus:ring-orange-100 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Catégorie</label>
            <select className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-black text-gray-900 focus:ring-2 focus:ring-orange-100 transition-all">
              <option>Restaurant</option>
              <option>Épicerie</option>
              <option>Boulangerie</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
          <textarea rows={4} defaultValue="Cuisine traditionnelle avec des produits frais et locaux." className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-orange-100 transition-all" />
        </div>

        <div className="flex items-center justify-between p-6 bg-orange-50 rounded-[24px] border border-orange-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">Statut de la Boutique</p>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Actuellement en ligne</p>
            </div>
          </div>
          <div className="w-12 h-6 bg-orange-600 rounded-full relative">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
          </div>
        </div>

        <button className="w-full py-5 bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all">
          Enregistrer les Modifications
        </button>
      </div>
    </div>
  );
}

function NavItem({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all",
        active 
          ? "bg-orange-50 text-orange-600 shadow-sm shadow-orange-50" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-orange-600" : "text-gray-400")} />
      {label}
    </button>
  );
}

function StatCard({ label, value, icon: Icon, trend, color }: any) {
  const colors: any = {
    orange: "bg-orange-50 text-orange-600 ring-orange-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    green: "bg-green-50 text-green-600 ring-green-100",
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
        <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg", trend.startsWith('+') ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600")}>
          <span className="text-[10px] font-black">{trend}</span>
        </div>
      </div>
    </div>
  );
}

function Store({ size }: { size: number }) {
  return <Utensils size={size} />;
}
