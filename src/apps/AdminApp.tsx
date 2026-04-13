import React, { useState, useEffect, useRef } from 'react';
import { 
  LogOut, Shield, Store, Users, BarChart3, 
  Utensils, Receipt, MessageSquare, Tag, 
  Settings, Bell, AlertTriangle, TrendingUp,
  ShoppingBag, Star, Plus, Trash2, Edit3,
  Navigation, MapPin, Globe, DollarSign,
  CheckCircle, XCircle, Ban, Search, Filter
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, setOrders, setMenu, setAnalytics, setReviews } from '../store';
import { cn, fetchWithTimeout } from '../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { MapContainer, TileLayer, Polygon, FeatureGroup, useMapEvents } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { format } from 'date-fns';

export default function AdminApp({ token, onLogout, user: initialUser }: { token: string, onLogout: () => void, user: any }) {
  const dispatch = useDispatch();
  const { orders, menu, analytics, reviews } = useSelector((state: RootState) => state.restaurant);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [testRole, setTestRole] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: 'Nouvelle Commande', message: 'Le restaurant Burger King a reçu une commande.', time: 'Il y a 2 min', read: false },
    { id: 2, title: 'Litige Ouvert', message: 'Un client a signalé un problème avec sa commande.', time: 'Il y a 10 min', read: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const currentUser = testRole ? { ...initialUser, role: testRole } : initialUser;
  const isSuperAdmin = currentUser?.role === 'admin';
  const restaurantId = currentUser?.restaurantId;

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      if (isSuperAdmin) {
        // Super Admin Data
        const [uRes, rRes, sRes, zRes, dRes] = await Promise.all([
          fetchWithTimeout('/api/users', { headers }),
          fetchWithTimeout('/api/restaurants', { headers }),
          fetchWithTimeout('/api/admin/stats', { headers }),
          fetchWithTimeout('/api/admin/zones', { headers }),
          fetchWithTimeout('/api/admin/disputes', { headers })
        ]);

        if (uRes.ok) setUsers(await (uRes as any).safeJson());
        if (rRes.ok) setRestaurants(await (rRes as any).safeJson());
        if (sRes.ok) dispatch(setAnalytics(await (sRes as any).safeJson()));
        if (zRes.ok) setZones(await (zRes as any).safeJson());
        if (dRes.ok) setDisputes(await (dRes as any).safeJson());
      } else if (restaurantId) {
        // Restaurant Owner Data
        const menuRes = await fetchWithTimeout(`/api/restaurants/${restaurantId}/menu`, { headers });
        if (menuRes.ok) dispatch(setMenu(await (menuRes as any).safeJson()));

        const reviewsRes = await fetchWithTimeout(`/api/restaurants/${restaurantId}/reviews`, { headers });
        if (reviewsRes.ok) dispatch(setReviews(await (reviewsRes as any).safeJson()));

        const ordersRes = await fetchWithTimeout(`/api/orders/restaurant/${restaurantId}`, { headers });
        if (ordersRes.ok) dispatch(setOrders(await (ordersRes as any).safeJson()));

        // Restaurant Analytics Mock
        dispatch(setAnalytics({
          dailyRevenue: 1250.50,
          weeklyRevenue: 8400.00,
          topDishes: [
            { name: 'Burger Classic', sales: 45 },
            { name: 'Pizza Margherita', sales: 38 }
          ],
          revenueHistory: [
            { date: 'Lun', amount: 1100 },
            { date: 'Mar', amount: 1300 },
            { date: 'Mer', amount: 950 },
            { date: 'Jeu', amount: 1400 },
            { date: 'Ven', amount: 1800 },
            { date: 'Sam', amount: 2100 },
            { date: 'Dim', amount: 1600 }
          ]
        }));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, isSuperAdmin, restaurantId, dispatch]);

  const handleUpdateRestaurantStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/restaurants/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setRestaurants(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      }
    } catch (e) { console.error(e); }
  };

  const handleBanUser = async (id: string, isBanned: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/ban`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isBanned })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, isBanned } : u));
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdateCommission = async (rate: number) => {
    try {
      const res = await fetch(`/api/admin/config/commissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rate })
      });
      if (res.ok) {
        alert("Taux de commission mis à jour !");
      }
    } catch (e) { console.error(e); }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-purple-600 p-2 rounded-xl shadow-lg shadow-purple-200">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-black text-xl tracking-tight uppercase">Admin Portal</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={BarChart3} label="Tableau de Bord" />
          
          {isSuperAdmin ? (
            <>
              <NavItem active={activeView === 'restaurants'} onClick={() => setActiveView('restaurants')} icon={Store} label="Restaurants" />
              <NavItem active={activeView === 'users'} onClick={() => setActiveView('users')} icon={Users} label="Utilisateurs" />
              <NavItem active={activeView === 'commissions'} onClick={() => setActiveView('commissions')} icon={DollarSign} label="Commissions" />
              <NavItem active={activeView === 'support'} onClick={() => setActiveView('support')} icon={MessageSquare} label="Support Client" />
              <NavItem active={activeView === 'zones'} onClick={() => setActiveView('zones')} icon={MapPin} label="Zones & Catégories" />
            </>
          ) : (
            <>
              <NavItem active={activeView === 'menu'} onClick={() => setActiveView('menu')} icon={Utensils} label="Ma Carte" />
              <NavItem active={activeView === 'finance'} onClick={() => setActiveView('finance')} icon={Receipt} label="Mes Factures" />
              <NavItem active={activeView === 'reviews'} onClick={() => setActiveView('reviews')} icon={AvisIcon} label="Avis Clients" />
              <NavItem active={activeView === 'promos'} onClick={() => setActiveView('promos')} icon={Tag} label="Mes Promotions" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={onLogout} className="w-full flex items-center gap-3 text-red-500 font-bold text-sm p-3 rounded-xl hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                {activeView === 'dashboard' && "Vue d'ensemble"}
                {activeView === 'restaurants' && "Gestion des Restaurants"}
                {activeView === 'users' && "Gestion des Utilisateurs"}
                {activeView === 'menu' && "Éditeur de Menu"}
                {activeView === 'finance' && "Finance & Facturation"}
                {activeView === 'reviews' && "Avis Clients"}
                {activeView === 'promos' && "Promotions"}
                {activeView === 'commissions' && "Configuration Commissions"}
                {activeView === 'support' && "Support & Litiges"}
                {activeView === 'zones' && "Zones de Livraison"}
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                {isSuperAdmin ? "Super Administrateur" : `Restaurateur - ${currentUser?.name}`}
              </p>
            </div>

            {/* Role Switcher for Testing */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setTestRole('admin')}
                className={cn("px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", isSuperAdmin ? "bg-white text-purple-600 shadow-sm" : "text-gray-400")}
              >
                Admin
              </button>
              <button 
                onClick={() => setTestRole('restaurant')}
                className={cn("px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", !isSuperAdmin ? "bg-white text-orange-600 shadow-sm" : "text-gray-400")}
              >
                Owner
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-600 relative"
              >
                <Bell className="w-6 h-6" />
                {notifications.some(n => !n.read) && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-white rounded-[24px] shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                    <h4 className="font-black text-xs uppercase tracking-widest">Notifications</h4>
                    <button 
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                      className="text-[10px] font-bold text-purple-600 hover:underline"
                    >
                      Tout marquer comme lu
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={cn("p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors", !n.read && "bg-purple-50/30")}>
                        <p className="font-black text-sm mb-1">{n.title}</p>
                        <p className="text-xs text-gray-500 mb-2">{n.message}</p>
                        <span className="text-[10px] font-bold text-gray-400">{n.time}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                      const newNotif = {
                        id: Date.now(),
                        title: 'Test Notification',
                        message: 'Ceci est une notification de test générée manuellement.',
                        time: 'À l\'instant',
                        read: false
                      };
                      setNotifications([newNotif, ...notifications]);
                    }}
                    className="w-full p-3 text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
                  >
                    Simuler une Notification
                  </button>
                </div>
              )}
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-black text-purple-600">
              {currentUser?.name?.[0] || 'A'}
            </div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto flex-1">
          {activeView === 'dashboard' && (isSuperAdmin ? <SuperAdminDashboard analytics={analytics} /> : <RestaurantDashboard analytics={analytics} />)}
          {activeView === 'restaurants' && isSuperAdmin && <RestaurantsManagement restaurants={restaurants} onUpdateStatus={handleUpdateRestaurantStatus} />}
          {activeView === 'users' && isSuperAdmin && <UsersManagement users={users} onBan={handleBanUser} />}
          {activeView === 'menu' && !isSuperAdmin && <MenuView menu={menu} token={token} restaurantId={restaurantId} onRefresh={fetchData} />}
          {activeView === 'finance' && !isSuperAdmin && <FinanceView orders={orders} />}
          {activeView === 'reviews' && !isSuperAdmin && <ReviewsView reviews={reviews} />}
          {activeView === 'promos' && !isSuperAdmin && <PromosView />}
          {activeView === 'commissions' && isSuperAdmin && <CommissionsConfig onUpdate={handleUpdateCommission} />}
          {activeView === 'support' && isSuperAdmin && <SupportView disputes={disputes} token={token} setDisputes={setDisputes} />}
          {activeView === 'zones' && isSuperAdmin && <ZonesConfig zones={zones} token={token} setZones={setZones} />}
        </div>
      </main>
    </div>
  );
}

function AvisIcon(props: any) {
  return <MessageSquare {...props} />;
}

function NavItem({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all",
        active 
          ? "bg-purple-50 text-purple-600 shadow-sm shadow-purple-100" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-purple-600" : "text-gray-400")} />
      {label}
    </button>
  );
}

// --- Super Admin Components ---

function SuperAdminDashboard({ analytics }: any) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Volume d'Affaires" value={`${analytics.totalRevenue?.toLocaleString()} €`} icon={TrendingUp} trend="+15%" color="purple" />
        <StatCard label="Restaurants Actifs" value={analytics.activeRestaurants} icon={Store} trend="+3" color="blue" />
        <StatCard label="Total Commandes" value={analytics.totalOrders} icon={ShoppingBag} trend="+12%" color="green" />
        <StatCard label="Revenu Commissions" value={`${analytics.commissionRevenue?.toLocaleString()} €`} icon={DollarSign} trend="+8%" color="orange" />
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <h3 className="text-xl font-black mb-8">Croissance de la Plateforme</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.revenueHistory}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} />
              <Tooltip />
              <Area type="monotone" dataKey="amount" stroke="#9333ea" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function RestaurantsManagement({ restaurants, onUpdateStatus }: any) {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-xl font-black">Tous les Restaurants</h3>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher..." className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20" />
          </div>
          <button className="p-2 bg-gray-50 rounded-xl text-gray-500 hover:bg-gray-100"><Filter className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Établissement</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Type</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Propriétaire</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Statut</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {restaurants.map((r: any) => (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      {r.type === 'clothing' ? '👕' : r.type === 'supermarket' ? '🛒' : r.type === 'pharmacy' ? '🏥' : '🏪'}
                    </div>
                    <span className="font-black text-sm">{r.name}</span>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                    {r.type || 'restaurant'}
                  </span>
                </td>
                <td className="px-8 py-4 text-sm text-gray-500 font-medium">{r.ownerEmail || 'N/A'}</td>
                <td className="px-8 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    r.status === 'active' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  )}>
                    {r.status === 'active' ? 'Actif' : 'Suspendu'}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onUpdateStatus(r.id, r.status === 'active' ? 'suspended' : 'active')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors",
                        r.status === 'active' ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                      )}
                    >
                      {r.status === 'active' ? 'Suspendre' : 'Activer'}
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

function UsersManagement({ users, onBan }: any) {
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50">
        <h3 className="text-xl font-black">Gestion des Utilisateurs</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Utilisateur</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Rôle</th>
              <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex flex-col">
                    <span className="font-black text-sm">{u.name}</span>
                    <span className="text-xs text-gray-400">{u.email}</span>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    u.role === 'admin' ? "bg-purple-100 text-purple-700" :
                    u.role === 'restaurant' ? "bg-orange-100 text-orange-700" :
                    u.role === 'driver' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  )}>
                    {u.role}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <button 
                    onClick={() => onBan(u.id, !u.isBanned)}
                    className={cn(
                      "font-black text-[10px] uppercase tracking-widest hover:underline",
                      u.isBanned ? "text-green-600" : "text-red-500"
                    )}
                  >
                    {u.isBanned ? 'Débannir' : 'Bannir'}
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

function CommissionsConfig({ onUpdate }: any) {
  const [rate, setRate] = useState(15);
  return (
    <div className="max-w-2xl bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
      <h3 className="text-xl font-black mb-6">Configuration des Commissions</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Taux de Commission Standard (%)</label>
          <div className="flex gap-4">
            <input 
              type="number" 
              value={rate} 
              onChange={(e) => setRate(Number(e.target.value))}
              className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-black outline-none focus:ring-2 focus:ring-purple-500/20" 
            />
            <button 
              onClick={() => onUpdate(rate)}
              className="bg-purple-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest"
            >
              Mettre à jour
            </button>
          </div>
        </div>
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-xs text-blue-700 font-medium">Ce taux sera appliqué à toutes les nouvelles commandes. Les restaurants partenaires peuvent avoir des taux personnalisés négociés.</p>
        </div>
      </div>
    </div>
  );
}

function SupportView({ disputes, token, setDisputes }: any) {
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/disputes/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setDisputes((prev: any[]) => prev.map(d => d._id === id ? { ...d, status } : d));
      }
    } catch (e) { console.error(e); }
  };

  if (!disputes || disputes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-300">
        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="font-black text-lg text-gray-400">Centre de Support</h3>
        <p className="text-sm font-medium">Aucun litige en cours.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {disputes.map((dispute: any) => (
        <div key={dispute._id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                dispute.priority === 'high' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
              )}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-lg">{dispute.reason}</h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Commande #{dispute.orderId?._id?.slice(-6).toUpperCase()} • {dispute.userId?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                dispute.status === 'open' ? "bg-red-50 text-red-600" :
                dispute.status === 'in_progress' ? "bg-blue-50 text-blue-600" :
                "bg-green-50 text-green-600"
              )}>
                {dispute.status.replace('_', ' ')}
              </span>
              <select 
                value={dispute.status}
                onChange={(e) => handleUpdateStatus(dispute._id, e.target.value)}
                className="text-[10px] font-black uppercase tracking-widest bg-gray-50 border-none rounded-lg px-2 py-1 outline-none"
              >
                <option value="open">Ouvrir</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolu</option>
                <option value="closed">Fermé</option>
              </select>
            </div>
          </div>
          <p className="text-gray-600 font-medium mb-6">{dispute.description}</p>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-2">Restaurant concerné</p>
            <p className="font-bold text-gray-700">{dispute.restaurantId?.name || 'N/A'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ZonesConfig({ zones, token, setZones }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [newZone, setNewZone] = useState({ name: '', deliveryFee: 5, minOrder: 15 });

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/zones/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setZones((prev: any[]) => prev.filter(z => z._id !== id));
      }
    } catch (e) { console.error(e); }
  };

  const handleAddZone = async (coordinates: any) => {
    try {
      const res = await fetch('/api/admin/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...newZone, coordinates })
      });
      if (res.ok) {
        const zone = await res.json();
        setZones((prev: any[]) => [...prev, zone]);
        setIsAdding(false);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black mb-6">Zones de Livraison</h3>
          <div className="space-y-4">
            {zones.map((zone: any) => (
              <div key={zone._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="font-black text-sm text-gray-700">{zone.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Frais: {zone.deliveryFee}€ • Min: {zone.minOrder}€</p>
                </div>
                <button onClick={() => handleDelete(zone._id)} className="text-red-500 hover:text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {!isAdding ? (
              <button 
                onClick={() => setIsAdding(true)}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-black text-xs uppercase tracking-widest hover:border-purple-300 hover:text-purple-500 transition-all"
              >
                + Ajouter une Zone
              </button>
            ) : (
              <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 space-y-4">
                <input 
                  type="text" 
                  placeholder="Nom de la zone" 
                  value={newZone.name}
                  onChange={e => setNewZone({...newZone, name: e.target.value})}
                  className="w-full bg-white border-none rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500/20" 
                />
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    placeholder="Frais" 
                    value={newZone.deliveryFee}
                    onChange={e => setNewZone({...newZone, deliveryFee: Number(e.target.value)})}
                    className="w-1/2 bg-white border-none rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500/20" 
                  />
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={newZone.minOrder}
                    onChange={e => setNewZone({...newZone, minOrder: Number(e.target.value)})}
                    className="w-1/2 bg-white border-none rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500/20" 
                  />
                </div>
                <p className="text-[10px] text-purple-600 font-black uppercase tracking-widest text-center">Dessinez la zone sur la carte</p>
                <button onClick={() => setIsAdding(false)} className="w-full py-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600">Annuler</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 h-[600px] bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden relative">
        <MapContainer center={[48.8566, 2.3522]} zoom={12} className="w-full h-full z-0">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {zones.map((zone: any) => (
            <Polygon 
              key={zone._id} 
              positions={zone.coordinates} 
              pathOptions={{ color: zone.color || '#9333ea', fillColor: zone.color || '#9333ea', fillOpacity: 0.2 }} 
            />
          ))}
          {isAdding && (
            <FeatureGroup>
              <EditControl
                position="topright"
                onCreated={(e: any) => {
                  const { layer } = e;
                  const latlngs = layer.getLatLngs()[0].map((ll: any) => [ll.lat, ll.lng]);
                  handleAddZone(latlngs);
                }}
                draw={{
                  rectangle: false,
                  circle: false,
                  polyline: false,
                  marker: false,
                  circlemarker: false,
                  polygon: {
                    allowIntersection: false,
                    drawError: { color: '#e1e1e1', message: '<strong>Erreur<strong>' },
                    shapeOptions: { color: '#9333ea' }
                  }
                }}
              />
            </FeatureGroup>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

// --- Shared Components (Moved from RestaurantApp) ---

function RestaurantDashboard({ analytics }: any) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="CA du Jour" value={`${analytics.dailyRevenue} €`} icon={TrendingUp} trend="+12%" color="orange" />
        <StatCard label="CA Hebdo" value={`${analytics.weeklyRevenue} €`} icon={BarChart3} trend="+5%" color="blue" />
        <StatCard label="Top Plat" value={analytics.topDishes?.[0]?.name || 'N/A'} icon={Utensils} trend="Best Seller" color="green" />
      </div>

      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <h3 className="text-xl font-black mb-8">Revenus de la Semaine</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.revenueHistory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} />
              <Tooltip />
              <Bar dataKey="amount" fill="#f97316" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
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
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600"
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

function MenuView({ menu, token, restaurantId, onRefresh }: { menu: any[], token: string, restaurantId: string, onRefresh: () => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Plat',
    image: '',
    available: true
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const url = editingDishId 
        ? `/api/restaurants/${restaurantId}/menu/${editingDishId}`
        : `/api/restaurants/${restaurantId}/menu`;
      
      const res = await fetch(url, {
        method: editingDishId ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingDishId(null);
        setFormData({
          name: '',
          description: '',
          price: '',
          category: 'Plat',
          image: '',
          available: true
        });
        onRefresh();
      } else {
        const data = await res.json();
        setError(data.error || "Une erreur est survenue.");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (dishId: string) => {
    if (!window.confirm('Supprimer ce plat ?')) return;
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/menu/${dishId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) onRefresh();
    } catch (e) { console.error(e); }
  };

  const openEditModal = (dish: any) => {
    setEditingDishId(dish.id);
    setFormData({
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      category: dish.category || 'Plat',
      image: dish.image,
      available: dish.available
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingDishId(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Plat',
      image: '',
      available: true
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black">Ma Carte</h3>
        <button 
          onClick={openAddModal}
          className="bg-black text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-gray-200 active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" /> Ajouter un Plat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {menu.map((item: any) => (
          <div key={item.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm group">
            <div className="h-48 relative">
              <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => openEditModal(item)}
                  className="p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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

      {/* Add Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">{editingDishId ? 'Modifier le plat' : 'Ajouter un nouveau plat'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nom du plat</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Burger Gourmet"
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500/20" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Décrivez votre plat..."
                    rows={3}
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500/20 resize-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Prix (€)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="12.50"
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500/20" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Catégorie</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none"
                    >
                      <option value="Entrée">Entrée</option>
                      <option value="Plat">Plat</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Boisson">Boisson</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">URL de l'image</label>
                  <input 
                    type="url" 
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500/20" 
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-black text-gray-900">Disponible immédiatement</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Le plat apparaîtra sur la carte</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, available: !formData.available})}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      formData.available ? "bg-green-500" : "bg-gray-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                      formData.available ? "translate-x-7" : "translate-x-1"
                    )} />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-4 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-gray-200 hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Envoi..." : (editingDishId ? "Enregistrer" : "Ajouter le plat")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FinanceView({ orders }: { orders: any[] }) {
  const pastOrders = orders.filter(o => o.status === 'delivered');
  const commissionRate = 0.15;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-purple-600 p-8 rounded-[32px] text-white shadow-xl shadow-purple-100">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Solde à Reverser</p>
          <h4 className="text-4xl font-black mb-6">4,250.80 €</h4>
          <button className="w-full py-3 bg-white/20 backdrop-blur-md rounded-2xl font-black text-sm hover:bg-white/30 transition-colors">
            Demander un Virement
          </button>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Commandes Terminées</p>
          <h4 className="text-3xl font-black text-gray-900">{pastOrders.length}</h4>
          <p className="text-xs text-gray-400 font-bold mt-2">Mois de Mars 2024</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50">
          <h3 className="text-xl font-black">Historique des Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Commande</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Net</th>
                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pastOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-4 font-black text-sm">#{order.id.slice(-6).toUpperCase()}</td>
                  <td className="px-8 py-4 text-sm text-gray-500 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
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
    <div className="space-y-6">
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
        </div>
      ))}
    </div>
  );
}

function PromosView() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black">Mes Offres Actives</h3>
        <button className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-purple-100">
          <Plus className="w-5 h-5" /> Créer une Promo
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-[32px] border border-purple-100 bg-white shadow-sm h-48 flex flex-col justify-center items-center text-gray-300">
          <Tag className="w-12 h-12 mb-2 opacity-20" />
          <p className="font-bold">Aucune promotion active</p>
        </div>
      </div>
    </div>
  );
}
