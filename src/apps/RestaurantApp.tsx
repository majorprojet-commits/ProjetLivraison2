import React, { useState, useEffect, useRef } from 'react';
import { 
  LogOut, Package, CheckCircle, Clock, ChefHat, 
  LayoutDashboard, Utensils, Calendar, BarChart3, 
  Settings, Bell, AlertTriangle, Play, Pause, 
  Plus, Trash2, Edit3, MessageSquare, Receipt,
  TrendingUp, Users, ShoppingBag, Star,
  ChevronRight, MapPin, Info, Navigation, Tag
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setOrders, updateOrderStatus, setMenu, toggleRushMode, setAnalytics, setReviews } from '../store';
import { cn, fetchWithTimeout } from '../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function RestaurantApp({ token, onLogout, user }: { token: string, onLogout: () => void, user: any }) {
  const dispatch = useDispatch();
  const { orders, settings, menu } = useSelector((state: RootState) => state.restaurant);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('operations');
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  const restaurantId = user?.restaurantId;

  useEffect(() => {
    notificationSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  useEffect(() => {
    if (!restaurantId) {
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Initial Fetch Orders
        const ordersRes = await fetchWithTimeout(`/api/orders/restaurant/${restaurantId}`, { headers });
        if (ordersRes.ok) {
          const newOrders = await (ordersRes as any).safeJson();
          dispatch(setOrders(newOrders));
        }

        // Fetch Menu
        const menuRes = await fetchWithTimeout(`/api/restaurants/${restaurantId}/menu`, { headers });
        if (menuRes.ok) {
          dispatch(setMenu(await (menuRes as any).safeJson()));
        }
      } catch (error) {
        console.error("Failed to fetch restaurant data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Firestore Real-time Listener
    const q = query(collection(db, 'orders'), where('restaurantId', '==', restaurantId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          // Trigger a re-fetch or update local state
          // For simplicity, we re-fetch to get full order data from Mongo
          fetchData();
          if (change.type === 'added') {
            notificationSound.current?.play().catch(() => {});
          }
        }
      });
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return () => unsubscribe();
  }, [token, restaurantId, dispatch]);

  const handleUpdateStatus = async (orderId: string, newStatus: string, data?: any) => {
    dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, ...data })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTime = async (orderId: string, minutes: number) => {
    try {
      const order = orders.find(o => o.id === orderId);
      const currentExtension = order?.prepTimeExtension || 0;
      const newExtension = currentExtension + minutes;
      
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          status: 'preparing', 
          prepTimeExtension: newExtension 
        })
      });
      // Optimistic update or wait for poll
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDish = async (dishData: any) => {
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(dishData)
      });
      if (res.ok) {
        const addedDish = await (res as any).safeJson();
        dispatch(setMenu([...menu, addedDish]));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-200">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Terminal Cuisine</h2>
            <p className="text-xs text-gray-500 font-bold">{user?.name || 'Restaurant'}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2 px-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode Rush</span>
              <button 
                onClick={() => dispatch(toggleRushMode())}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative",
                  settings.isRushMode ? "bg-red-500" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-transform",
                  settings.isRushMode ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2 px-3 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">En Ligne</span>
            </div>
          </div>

          <button onClick={onLogout} className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" /> Quitter
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('operations')}
            className={cn("px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all", activeTab === 'operations' ? "bg-orange-500 text-white shadow-lg shadow-orange-100" : "bg-white text-gray-400 border border-gray-100")}
          >
            Cuisine
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={cn("px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all", activeTab === 'inventory' ? "bg-orange-500 text-white shadow-lg shadow-orange-100" : "bg-white text-gray-400 border border-gray-100")}
          >
            Inventaire Rapide
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={cn("px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all", activeTab === 'menu' ? "bg-orange-500 text-white shadow-lg shadow-orange-100" : "bg-white text-gray-400 border border-gray-100")}
          >
            Ma Carte
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn("px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all", activeTab === 'dashboard' ? "bg-orange-500 text-white shadow-lg shadow-orange-100" : "bg-white text-gray-400 border border-gray-100")}
          >
            Stats
          </button>
        </div>

        {activeTab === 'operations' && <OperationsView orders={orders} onUpdateStatus={handleUpdateStatus} onAddTime={handleAddTime} />}
        {activeTab === 'menu' && <MenuView menu={menu} onAddDish={handleAddDish} />}
        {activeTab === 'inventory' && <QuickInventory menu={menu} token={token} restaurantId={restaurantId} />}
        {activeTab === 'dashboard' && <DashboardView analytics={{ dailyRevenue: 0, weeklyRevenue: 0, cancellationRate: 0, revenueHistory: [], topDishes: [] }} />}
      </main>
    </div>
  );
}


function NavItem({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all",
        active 
          ? "bg-orange-50 text-orange-600 shadow-sm shadow-orange-100" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-orange-600" : "text-gray-400")} />
      {label}
    </button>
  );
}

function OperationsView({ orders, onUpdateStatus, onAddTime }: { orders: any[], onUpdateStatus: (id: string, status: string, data?: any) => void, onAddTime: (id: string, mins: number) => void }) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalType, setModalType] = useState<'accept' | 'refuse' | null>(null);
  const [prepTime, setPrepTime] = useState('20');
  const [refuseReason, setRefuseReason] = useState('');

  const pending = orders.filter(o => o.status === 'pending');
  const preparing = orders.filter(o => o.status === 'preparing');
  const ready = orders.filter(o => o.status === 'ready');

  const handleAccept = () => {
    onUpdateStatus(selectedOrder.id, 'preparing', { prepTime });
    setModalType(null);
    setSelectedOrder(null);
  };

  const handleRefuse = () => {
    onUpdateStatus(selectedOrder.id, 'cancelled', { reason: refuseReason });
    setModalType(null);
    setSelectedOrder(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full relative">
      <OrderColumn 
        title="Nouvelles" 
        icon={Package} 
        color="blue" 
        orders={pending} 
        onAction={(order: any) => { setSelectedOrder(order); setModalType('accept'); }} 
        onRefuse={(order: any) => { setSelectedOrder(order); setModalType('refuse'); }}
        actionText="Accepter" 
      />
      <OrderColumn 
        title="En Cuisine" 
        icon={ChefHat} 
        color="orange" 
        orders={preparing} 
        onAction={(order: any) => onUpdateStatus(order.id, 'ready')} 
        onAddTime={onAddTime}
        actionText="Prête" 
      />
      <OrderColumn 
        title="À Récupérer" 
        icon={CheckCircle} 
        color="green" 
        orders={ready} 
        onAction={(order: any) => onUpdateStatus(order.id, 'delivered')} 
        actionText="Livrée" 
      />

      {/* Modals */}
      {modalType === 'accept' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black mb-2">Accepter la commande</h3>
            <p className="text-gray-500 mb-6 font-medium">Définissez le temps de préparation estimé.</p>
            
            <div className="grid grid-cols-3 gap-3 mb-8">
              {['15', '20', '30', '45', '60'].map(t => (
                <button 
                  key={t}
                  onClick={() => setPrepTime(t)}
                  className={cn(
                    "py-4 rounded-2xl font-black transition-all border-2",
                    prepTime === t ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-100" : "bg-gray-50 text-gray-400 border-transparent hover:border-gray-200"
                  )}
                >
                  {t} min
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setModalType(null)} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs">Annuler</button>
              <button onClick={handleAccept} className="flex-[2] py-4 rounded-2xl bg-orange-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-100">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {modalType === 'refuse' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black mb-2 text-red-600">Refuser la commande</h3>
            <p className="text-gray-500 mb-6 font-medium">Pourquoi refusez-vous cette commande ?</p>
            
            <div className="space-y-3 mb-8">
              {['Rupture de stock', 'Restaurant trop occupé', 'Fermeture imminente', 'Autre'].map(r => (
                <button 
                  key={r}
                  onClick={() => setRefuseReason(r)}
                  className={cn(
                    "w-full p-4 rounded-2xl font-bold text-left transition-all border-2",
                    refuseReason === r ? "bg-red-50 text-red-600 border-red-200" : "bg-gray-50 text-gray-400 border-transparent hover:border-gray-200"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setModalType(null)} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs">Annuler</button>
              <button onClick={handleRefuse} disabled={!refuseReason} className="flex-[2] py-4 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-red-100 disabled:opacity-50">Confirmer le Refus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderColumn({ title, icon: Icon, color, orders, onAction, onRefuse, onAddTime, actionText }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    green: "bg-green-50 text-green-700 border-green-100"
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className={cn("p-4 rounded-2xl border mb-6 flex justify-between items-center", colors[color])}>
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <h3 className="font-black uppercase tracking-wider text-sm">{title}</h3>
        </div>
        <span className="font-black text-lg">{orders.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
        {orders.map((order: any) => (
          <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">#{order.id.slice(-6)}</span>
                <p className="font-black text-lg mt-0.5">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-orange-500">{order.total.toFixed(2)} €</p>
                <div className="flex items-center gap-2 justify-end">
                   <span className="text-[10px] font-black bg-gray-100 px-2 py-0.5 rounded text-gray-500 uppercase">Code: {order.pickupCode}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm font-medium">
                  <span className="text-gray-600"><span className="text-black font-black">{item.quantity}x</span> {item.name}</span>
                </div>
              ))}
            </div>

            {order.driverId && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl flex items-center gap-3 border border-blue-100">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-blue-800 uppercase tracking-wider">Livreur Assigné</p>
                  <p className="text-xs font-bold text-blue-600">
                    {order.driverEta ? `Arrivée: ${new Date(order.driverEta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Arrivée dans 5 min'}
                  </p>
                </div>
              </div>
            )}

            {title === "En Cuisine" && (
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => onAddTime(order.id, 5)}
                  className="flex-1 py-1.5 rounded-lg bg-gray-50 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:bg-orange-50 hover:text-orange-600 transition-colors border border-gray-100"
                >
                  +5 min
                </button>
                <button 
                  onClick={() => onAddTime(order.id, 10)}
                  className="flex-1 py-1.5 rounded-lg bg-gray-50 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:bg-orange-50 hover:text-orange-600 transition-colors border border-gray-100"
                >
                  +10 min
                </button>
              </div>
            )}

            <div className="flex gap-2">
              {title === "Nouvelles" && (
                <button 
                  onClick={() => onRefuse(order)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  Refuser
                </button>
              )}
              <button 
                onClick={() => onAction(order)}
                className={cn(
                  "flex-[2] py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg",
                  color === 'blue' ? "bg-blue-600 shadow-blue-100" : 
                  color === 'orange' ? "bg-orange-600 shadow-orange-100" : "bg-green-600 shadow-green-100"
                )}
              >
                {actionText}
              </button>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <Icon className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold text-sm">Aucune commande</p>
          </div>
        )}
      </div>
    </div>
  );
}


function DashboardView({ analytics }: { analytics: any }) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="CA du Jour" value={`${analytics.dailyRevenue} €`} icon={TrendingUp} trend="+12%" color="orange" />
        <StatCard label="CA Hebdo" value={`${analytics.weeklyRevenue} €`} icon={BarChart3} trend="+5%" color="blue" />
        <StatCard label="Plats Vendus" value="105" icon={ShoppingBag} trend="+18%" color="green" />
        <StatCard label="Taux Annulation" value={`${analytics.cancellationRate}%`} icon={AlertTriangle} trend="-1%" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black mb-8">Revenus de la Semaine</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.revenueHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="amount" fill="#f97316" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Dishes */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black mb-8">Top 3 Plats</h3>
          <div className="space-y-6">
            {analytics.topDishes.map((dish: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg", 
                  idx === 0 ? "bg-orange-100 text-orange-600" : 
                  idx === 1 ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                )}>
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-black text-gray-900">{dish.name}</p>
                  <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", idx === 0 ? "bg-orange-500" : idx === 1 ? "bg-blue-500" : "bg-gray-500")} 
                      style={{width: `${(dish.sales / 50) * 100}%`}} 
                    />
                  </div>
                </div>
                <span className="font-black text-gray-900">{dish.sales}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, color }: any) {
  const colors: any = {
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600"
  };

  return (
    <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
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

function MenuView({ menu, onAddDish }: { menu: any[], onAddDish: (dish: any) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDish, setNewDish] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Plat',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddDish({
      ...newDish,
      price: parseFloat(newDish.price)
    });
    setIsModalOpen(false);
    setNewDish({ name: '', price: '', description: '', category: 'Plat', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black">Gestion de la Carte</h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-black text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-gray-200 active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" /> Ajouter un Plat
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menu.map((item: any) => (
              <div key={item.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm group">
                <div className="h-48 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button className="p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-sm text-gray-600 hover:text-blue-600 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-sm text-gray-600 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest">Épuisé</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-lg">{item.name}</h4>
                    <span className="font-black text-orange-500">{item.price.toFixed(2)} €</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                      {item.category || 'Plat'}
                    </span>
                    <button className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors",
                      item.available ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                      {item.available ? "En Stock" : "Hors Stock"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Management */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-orange-500" /> Horaires
            </h3>
            <div className="space-y-4">
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-600">{day}</span>
                  <div className="flex items-center gap-2">
                    <input type="text" defaultValue="11:00" className="w-16 bg-gray-50 border-none rounded-lg px-2 py-1 text-xs font-bold text-center" />
                    <span className="text-gray-300">-</span>
                    <input type="text" defaultValue="22:30" className="w-16 bg-gray-50 border-none rounded-lg px-2 py-1 text-xs font-bold text-center" />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors">
              Enregistrer les Horaires
            </button>
          </div>

          <div className="bg-red-50 p-8 rounded-[32px] border border-red-100">
            <h3 className="text-xl font-black text-red-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" /> Fermeture Exceptionnelle
            </h3>
            <p className="text-sm text-red-600 font-medium mb-6">Désactivez votre restaurant pour une période définie (vacances, travaux...).</p>
            <button className="w-full py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100">
              Planifier une Fermeture
            </button>
          </div>
        </div>
      </div>

      {/* Add Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black mb-6">Ajouter un nouveau plat</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Nom du plat</label>
                <input 
                  required
                  type="text" 
                  value={newDish.name}
                  onChange={e => setNewDish({...newDish, name: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="ex: Burger Deluxe"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Prix (€)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={newDish.price}
                    onChange={e => setNewDish({...newDish, price: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="12.50"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Catégorie</label>
                  <select 
                    value={newDish.category}
                    onChange={e => setNewDish({...newDish, category: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option>Plat</option>
                    <option>Entrée</option>
                    <option>Dessert</option>
                    <option>Boisson</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Description</label>
                <textarea 
                  required
                  value={newDish.description}
                  onChange={e => setNewDish({...newDish, description: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-orange-500/20 h-24 resize-none"
                  placeholder="Description du plat..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs">Annuler</button>
                <button type="submit" className="flex-[2] py-4 rounded-2xl bg-orange-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-100">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickInventory({ menu, token, restaurantId }: { menu: any[], token: string, restaurantId: string }) {
  const dispatch = useDispatch();

  const toggleAvailability = async (itemId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ available: !current })
      });
      if (res.ok) {
        const updatedMenu = menu.map(item => item.id === itemId ? { ...item, available: !current } : item);
        dispatch(setMenu(updatedMenu));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50">
        <h3 className="text-xl font-black">Inventaire Rapide</h3>
        <p className="text-sm text-gray-500 font-medium">Désactivez les plats en rupture de stock instantanément.</p>
      </div>
      <div className="divide-y divide-gray-50">
        {menu.map(item => (
          <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <p className="font-black text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-400 font-bold uppercase">{item.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                item.available ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {item.available ? "Disponible" : "Épuisé"}
              </span>
              <button 
                onClick={() => toggleAvailability(item.id, item.available)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  item.available ? "bg-green-500" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                  item.available ? "translate-x-7" : "translate-x-1"
                )} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceView({ orders }: { orders: any[] }) {
  const pastOrders = orders.filter(o => o.status === 'delivered');
  const commissionRate = 0.15; // 15% commission

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-500 p-8 rounded-[32px] text-white shadow-xl shadow-orange-100">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Solde à Reverser</p>
          <h4 className="text-4xl font-black mb-6">4,250.80 €</h4>
          <button className="w-full py-3 bg-white/20 backdrop-blur-md rounded-2xl font-black text-sm hover:bg-white/30 transition-colors">
            Demander un Virement
          </button>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Commissions (15%)</p>
          <h4 className="text-3xl font-black text-gray-900">637.62 €</h4>
          <p className="text-xs text-green-500 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +4% vs mois dernier
          </p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Commandes Terminées</p>
          <h4 className="text-3xl font-black text-gray-900">{pastOrders.length}</h4>
          <p className="text-xs text-gray-400 font-bold mt-2">Mois de Mars 2024</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-black">Historique des Transactions</h3>
          <button className="text-sm font-bold text-orange-500 hover:text-orange-600">Exporter en PDF</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Commande</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Montant Brut</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Commission</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Net</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pastOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-4 font-black text-sm">#{order.id.slice(-6).toUpperCase()}</td>
                  <td className="px-8 py-4 text-sm text-gray-500 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-4 font-bold text-sm">{order.total.toFixed(2)} €</td>
                  <td className="px-8 py-4 text-sm text-red-500 font-bold">-{(order.total * commissionRate).toFixed(2)} €</td>
                  <td className="px-8 py-4 font-black text-sm text-green-600">{(order.total * (1 - commissionRate)).toFixed(2)} €</td>
                  <td className="px-8 py-4">
                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Versé</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReviewsView({ reviews }: { reviews: any[] }) {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Note Moyenne</p>
          <h4 className="text-4xl font-black text-gray-900">4.8</h4>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Avis</p>
          <h4 className="text-4xl font-black text-gray-900">{reviews.length}</h4>
          <p className="text-xs text-green-500 font-bold mt-2">+12 ce mois</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Taux de Réponse</p>
          <h4 className="text-4xl font-black text-gray-900">85%</h4>
          <p className="text-xs text-blue-500 font-bold mt-2">Excellent</p>
        </div>
      </div>

      {reviews.map(review => (
        <div key={review.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl">👤</div>
              <div>
                <h4 className="font-black text-lg">{review.user}</h4>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={cn("w-3 h-3", s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
                  ))}
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-gray-400">{review.date}</span>
          </div>
          
          <p className="text-gray-600 font-medium leading-relaxed">{review.comment}</p>

          {review.reply ? (
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <ChefHat className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-black uppercase tracking-widest text-orange-800">Votre réponse</span>
              </div>
              <p className="text-sm text-orange-700 font-medium italic">"{review.reply}"</p>
            </div>
          ) : (
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Répondre à ce client..." 
                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
              />
              <button className="bg-black text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform">
                Envoyer
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PromosView() {
  const promos = [
    { id: '1', title: '-20% sur tout le menu', type: 'percentage', value: 20, active: true, end: '2024-04-30' },
    { id: '2', title: '1 Burger acheté = 1 offert', type: 'bogo', value: 1, active: false, end: '2024-03-15' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black">Vos Offres Actives</h3>
        <button className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-orange-100 active:scale-95 transition-transform">
          <Plus className="w-5 h-5" /> Créer une Promo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promos.map(promo => (
          <div key={promo.id} className={cn(
            "p-8 rounded-[32px] border flex flex-col justify-between h-64 relative overflow-hidden",
            promo.active ? "bg-white border-orange-100 shadow-sm" : "bg-gray-50 border-gray-200 opacity-60"
          )}>
            {promo.active && <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest">Active</div>}
            
            <div>
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", promo.active ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-400")}>
                <Tag className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black mb-2">{promo.title}</h4>
              <p className="text-sm text-gray-500 font-medium">Expire le {new Date(promo.end).toLocaleDateString()}</p>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit3 className="w-5 h-5" /></button>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
              </div>
              <button className={cn(
                "px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-colors",
                promo.active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
              )}>
                {promo.active ? "Désactiver" : "Réactiver"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

