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
import { io } from 'socket.io-client';

interface SellerDashboardProps {
  sellerId?: string;
  token?: string;
  onLogout?: () => void;
  externalNotifications?: any[];
  onClearNotifications?: () => void;
  socketConnected?: boolean;
}

export default function SellerDashboard({ 
  sellerId = 'r1', 
  token = 'dev-token',
  onLogout = () => {},
  externalNotifications = [],
  onClearNotifications = () => {},
  socketConnected = false
}: SellerDashboardProps) {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [seller, setSeller] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDish, setNewDish] = useState<any>({ 
    name: '', 
    price: '', 
    description: '', 
    category: 'Plats', 
    image: '',
    options: []
  });
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const socket = io({
      transports: ['polling', 'websocket'],
    });
    socket.emit('join', `seller_${sellerId}`);

    socket.on('newOrder', (order) => {
      setOrders(prev => {
        if (prev.find(o => o.id === order.id)) return prev;
        return [order, ...prev];
      });
    });

    socket.on('orderUpdated', (order) => {
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    });

    return () => {
      socket.disconnect();
    };
  }, [sellerId]);

  const addOptionToNewDish = () => {
    setNewDish({
      ...newDish,
      options: [...newDish.options, { id: Date.now().toString(), name: '', required: false, choices: [] }]
    });
  };

  const addChoiceToOption = (optId: string) => {
    setNewDish({
      ...newDish,
      options: newDish.options.map((opt: any) => 
        opt.id === optId ? { ...opt, choices: [...opt.choices, { id: Date.now().toString(), name: '', priceExtra: 0 }] } : opt
      )
    });
  };

  useEffect(() => {
    const fetchSellerData = async () => {
      setIsRefreshing(true);
      try {
        const [sellerRes, ordersRes] = await Promise.all([
          fetch(`/api/sellers`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/orders/seller/${sellerId}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (sellerRes.ok) {
          const allSellers = await sellerRes.json();
          const currentSeller = allSellers.find((s: any) => s.id === sellerId);
          setSeller(currentSeller);
        }
        if (ordersRes.ok) {
          setOrders(await ordersRes.json());
        }
      } catch (error) {
        console.error("Failed to fetch seller data:", error);
      } finally {
        setIsRefreshing(false);
      }
    };
    fetchSellerData();
  }, [sellerId, token]);

  const handleToggleAvailability = async (dishId: string, currentAvailable: boolean) => {
    try {
      const res = await fetch(`/api/sellers/${sellerId}/menu/${dishId}/availability`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ available: !currentAvailable })
      });
      if (res.ok) {
        setSeller({
          ...seller,
          menu: seller.menu.map((item: any) => 
            item.id === dishId ? { ...item, available: !currentAvailable } : item
          )
        });
      }
    } catch (error) {
      console.error("Failed to toggle availability:", error);
    }
  };

  const handleAddDish = async () => {
    if (!newDish.name || !newDish.price || !newDish.image) {
      alert("Veuillez remplir tous les champs obligatoires, y compris l'image.");
      return;
    }
    try {
      const res = await fetch(`/api/sellers/${sellerId}/menu`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newDish, price: parseFloat(newDish.price) })
      });
      if (res.ok) {
        const addedDish = await res.json();
        setSeller({
          ...seller,
          menu: [...(seller.menu || []), addedDish]
        });
        setShowAddModal(false);
        setNewDish({ 
          name: '', 
          price: '', 
          description: '', 
          category: 'Plats', 
          image: '',
          options: []
        });
      }
    } catch (error) {
      console.error("Failed to add dish:", error);
    }
  };

  const handleUpdateSettings = async (settings: any) => {
    try {
      const res = await fetch(`/api/sellers/${sellerId}/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSeller({ ...seller, ...settings });
        alert('Paramètres mis à jour !');
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (!seller) return <div className="flex items-center justify-center h-full">Chargement...</div>;

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
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{seller.name} • ID: {sellerId}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", socketConnected ? "bg-green-500" : "bg-red-500")} />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {socketConnected ? "Live" : "Offline"}
              </span>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {externalNotifications.length > 0 && (
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-600 rounded-full border-2 border-white" />
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-300">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Notifications</p>
                    <button onClick={onClearNotifications} className="text-[10px] font-black uppercase tracking-widest text-orange-600">Effacer</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {externalNotifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-xs font-bold text-gray-400">Aucune notification</p>
                      </div>
                    ) : (
                      externalNotifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { setActiveView('orders'); setShowNotifications(false); }}>
                          <p className="text-sm font-bold text-gray-900">{n.message}</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-1">À l'instant</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="text-right">
                <p className="text-xs font-black text-gray-900">{seller.name}</p>
                <p className={cn("text-[10px] font-bold uppercase tracking-widest", seller.status === 'active' ? "text-green-500" : "text-red-500")}>
                  {seller.status === 'active' ? 'Ouvert' : 'Fermé'}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-orange-200 overflow-hidden">
                <img src={seller.image} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto flex-1">
          {activeView === 'dashboard' && <SellerStatsView seller={seller} orders={orders} />}
          {activeView === 'orders' && (
            <SellerOrdersView 
              orders={orders} 
              onUpdateStatus={handleUpdateStatus}
            />
          )}
          {activeView === 'menu' && (
            <SellerMenuView 
              menu={seller.menu || []} 
              onAdd={() => setShowAddModal(true)} 
              onToggleAvailability={handleToggleAvailability}
            />
          )}
          {activeView === 'settings' && <SellerSettingsView seller={seller} onSave={handleUpdateSettings} />}
        </div>
      </main>

      {/* Add Dish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black mb-6">Ajouter un plat</h3>
            <div className="space-y-4">
              <input 
                placeholder="Nom du plat" 
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold"
                value={newDish.name}
                onChange={e => setNewDish({...newDish, name: e.target.value})}
              />
              <input 
                placeholder="Prix (FCFA)" 
                type="number"
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold"
                value={newDish.price}
                onChange={e => setNewDish({...newDish, price: e.target.value})}
              />
              <textarea 
                placeholder="Description" 
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold"
                value={newDish.description}
                onChange={e => setNewDish({...newDish, description: e.target.value})}
              />

              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Image du plat (Obligatoire)</p>
                <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                  <button 
                    onClick={() => setImageInputType('url')}
                    className={cn("flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", imageInputType === 'url' ? "bg-white text-orange-600 shadow-sm" : "text-gray-400")}
                  >
                    Lien URL
                  </button>
                  <button 
                    onClick={() => setImageInputType('upload')}
                    className={cn("flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", imageInputType === 'upload' ? "bg-white text-orange-600 shadow-sm" : "text-gray-400")}
                  >
                    Importer
                  </button>
                </div>
                
                {imageInputType === 'url' ? (
                  <input 
                    placeholder="https://exemple.com/image.jpg" 
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-sm"
                    value={newDish.image}
                    onChange={e => setNewDish({...newDish, image: e.target.value})}
                  />
                ) : (
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewDish({...newDish, image: reader.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl px-6 py-8 flex flex-col items-center justify-center gap-2">
                      {newDish.image ? (
                        <img src={newDish.image} alt="Preview" className="w-20 h-20 object-cover rounded-xl mb-2" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <p className="text-xs font-bold text-gray-500">
                        {newDish.image ? "Changer l'image" : "Cliquez pour importer une image"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Options (ex: Cuisson, Suppléments)</p>
                  <button onClick={addOptionToNewDish} className="text-orange-600 font-black text-[10px] uppercase tracking-widest">+ Ajouter Option</button>
                </div>
                
                {newDish.options.map((opt: any, optIdx: number) => (
                  <div key={opt.id} className="bg-gray-50 p-4 rounded-2xl space-y-3">
                    <div className="flex gap-2">
                      <input 
                        placeholder="Nom de l'option" 
                        className="flex-1 bg-white border-none rounded-xl px-4 py-2 text-sm font-bold"
                        value={opt.name}
                        onChange={e => {
                          const opts = [...newDish.options];
                          opts[optIdx].name = e.target.value;
                          setNewDish({...newDish, options: opts});
                        }}
                      />
                      <button 
                        onClick={() => {
                          const opts = [...newDish.options];
                          opts[optIdx].required = !opts[optIdx].required;
                          setNewDish({...newDish, options: opts});
                        }}
                        className={cn("px-3 py-2 rounded-xl text-[10px] font-black uppercase", opt.required ? "bg-orange-600 text-white" : "bg-white text-gray-400")}
                      >
                        Obligatoire
                      </button>
                    </div>

                    <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                      {opt.choices.map((choice: any, choiceIdx: number) => (
                        <div key={choice.id} className="flex gap-2">
                          <input 
                            placeholder="Choix" 
                            className="flex-1 bg-white border-none rounded-xl px-4 py-2 text-xs font-bold"
                            value={choice.name}
                            onChange={e => {
                              const opts = [...newDish.options];
                              opts[optIdx].choices[choiceIdx].name = e.target.value;
                              setNewDish({...newDish, options: opts});
                            }}
                          />
                          <input 
                            placeholder="+0 FCFA" 
                            type="number"
                            className="w-20 bg-white border-none rounded-xl px-4 py-2 text-xs font-bold"
                            value={choice.priceExtra}
                            onChange={e => {
                              const opts = [...newDish.options];
                              opts[optIdx].choices[choiceIdx].priceExtra = parseFloat(e.target.value);
                              setNewDish({...newDish, options: opts});
                            }}
                          />
                        </div>
                      ))}
                      <button onClick={() => addChoiceToOption(opt.id)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-orange-600">+ Ajouter Choix</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-gray-100 font-black rounded-2xl"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleAddDish}
                  className="flex-1 py-4 bg-orange-600 text-white font-black rounded-2xl shadow-lg shadow-orange-100"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SellerStatsView({ seller, orders }: any) {
  const deliveredOrders = orders.filter((o: any) => o.status === 'delivered');
  const revenue = deliveredOrders.reduce((sum: number, o: any) => sum + o.total, 0);
  
  // Calculate revenue per day for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const revenueByDay = last7Days.map(dayStr => {
    const dayTotal = deliveredOrders
      .filter((o: any) => o.date && o.date.startsWith(dayStr))
      .reduce((sum: number, o: any) => sum + o.total, 0);
    
    return {
      name: format(new Date(dayStr), 'ccc'),
      total: dayTotal
    };
  });

  const revenueData = revenueByDay;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Revenus Totaux" value={`${revenue.toLocaleString()} FCFA`} icon={DollarSign} trend="+12%" color="orange" />
        <StatCard label="Commandes" value={orders.length} icon={Package} trend="+5" color="blue" />
        <StatCard label="Note Moyenne" value={seller.rating} icon={Star} trend="Stable" color="green" />
        <StatCard label="En cours" value={orders.filter((o: any) => ['pending', 'preparing', 'ready', 'delivering'].includes(o.status)).length} icon={Clock} trend="Live" color="violet" />
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
                  <p className="text-sm font-black text-gray-900">{order.total.toLocaleString()} FCFA</p>
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

function SellerOrdersView({ orders, onUpdateStatus }: { orders: any[], onUpdateStatus: (id: string, s: string) => void }) {
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
          <h3 className="text-xl font-black text-gray-900">Gestion des Commandes</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{filteredOrders.length} commandes affichées</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
            <button 
              onClick={() => setFilter('all')}
              className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filter === 'all' ? "bg-orange-600 text-white shadow-md" : "text-gray-400 hover:text-gray-600")}
            >
              Toutes
            </button>
            <button 
              onClick={() => setFilter('active')}
              className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filter === 'active' ? "bg-orange-600 text-white shadow-md" : "text-gray-400 hover:text-gray-600")}
            >
              En cours
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", filter === 'completed' ? "bg-orange-600 text-white shadow-md" : "text-gray-400 hover:text-gray-600")}
            >
              Terminées
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 text-left">
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Commande</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Articles</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Statut</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <Package size={64} />
                    <p className="font-black uppercase tracking-widest text-xs">Aucune commande trouvée</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((o: any) => (
                <tr key={o.id} className="hover:bg-gray-50/80 transition-all group">
                  <td className="px-8 py-5">
                    <span className="font-black text-sm text-gray-900">#{o.id.slice(-4).toUpperCase()}</span>
                    <span className="block text-[10px] text-gray-400 font-bold">{o.date ? format(new Date(o.date), 'dd/MM HH:mm') : '--/--'}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-gray-700">{o.items?.length || 0} articles</span>
                      <span className="text-[10px] text-gray-400 truncate max-w-[200px]">{o.items?.[0]?.name}{o.items?.length > 1 ? ', ...' : ''}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="font-black text-sm text-orange-600">{o.total.toLocaleString()} FCFA</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                      o.status === 'pending' ? "bg-amber-100 text-amber-700" :
                      o.status === 'accepted' ? "bg-blue-100 text-blue-700" :
                      o.status === 'preparing' ? "bg-purple-100 text-purple-700" :
                      o.status === 'ready' ? "bg-cyan-100 text-cyan-700" :
                      o.status === 'delivered' ? "bg-green-100 text-green-700" :
                      o.status === 'cancelled' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                    )}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {o.status === 'pending' && (
                        <button 
                          onClick={() => onUpdateStatus(o.id, 'accepted')}
                          className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg shadow-sm"
                        >
                          Accepter
                        </button>
                      )}
                      {o.status === 'accepted' && (
                        <button 
                          onClick={() => onUpdateStatus(o.id, 'preparing')}
                          className="px-3 py-1.5 bg-purple-600 text-white text-[10px] font-black uppercase rounded-lg shadow-sm"
                        >
                          Préparer
                        </button>
                      )}
                      {o.status === 'preparing' && (
                        <button 
                          onClick={() => onUpdateStatus(o.id, 'ready')}
                          className="px-3 py-1.5 bg-green-600 text-white text-[10px] font-black uppercase rounded-lg shadow-sm"
                        >
                          Prêt
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SellerMenuView({ menu, onAdd, onToggleAvailability }: { menu: any[], onAdd: () => void, onToggleAvailability: (id: string, avail: boolean) => void }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-gray-900">Carte du Restaurant</h3>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Gérez vos plats et tarifs</p>
        </div>
        <button 
          onClick={onAdd}
          className="btn-primary flex items-center gap-2 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-100"
        >
          <Plus className="w-5 h-5" /> Ajouter un Article
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menu.map(item => (
          <div key={item.id} className={cn(
            "bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group",
            item.available === false && "opacity-75 grayscale-[0.5]"
          )}>
            <div className="h-48 relative overflow-hidden">
              <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900">
                {item.category || 'Plat'}
              </div>
              {item.available === false && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-red-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest">Épuisé</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-lg text-gray-900">{item.name}</h4>
                  <p className="text-xl font-black text-orange-600">{item.price.toLocaleString()} FCFA</p>
                </div>
                <button 
                  onClick={() => onToggleAvailability(item.id, item.available !== false)}
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    item.available !== false ? "bg-green-500" : "bg-gray-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                    item.available !== false ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4 line-clamp-2">{item.description}</p>
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

function SellerSettingsView({ seller, onSave }: { seller: any, onSave: (s: any) => void }) {
  const [formData, setFormData] = useState({
    name: seller.name,
    type: seller.type,
    image: seller.image,
    status: seller.status
  });

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
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-black text-gray-900 focus:ring-2 focus:ring-orange-100 transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Catégorie</label>
            <select 
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-black text-gray-900 focus:ring-2 focus:ring-orange-100 transition-all"
            >
              <option value="restaurant">Restaurant</option>
              <option value="supermarket">Épicerie</option>
              <option value="clothing">Vêtements</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL de l'image</label>
          <input 
            type="text" 
            value={formData.image} 
            onChange={e => setFormData({...formData, image: e.target.value})}
            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-orange-100 transition-all" 
          />
        </div>

        <div className="flex items-center justify-between p-6 bg-orange-50 rounded-[24px] border border-orange-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">Statut de la Boutique</p>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                {formData.status === 'active' ? 'Actuellement en ligne' : 'Fermé temporairement'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setFormData({...formData, status: formData.status === 'active' ? 'suspended' : 'active'})}
            className={cn(
              "w-12 h-6 rounded-full relative transition-colors",
              formData.status === 'active' ? "bg-orange-600" : "bg-gray-300"
            )}
          >
            <div className={cn(
              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
              formData.status === 'active' ? "right-1" : "left-1"
            )} />
          </button>
        </div>

        <button 
          onClick={() => onSave(formData)}
          className="w-full py-5 bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all"
        >
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
