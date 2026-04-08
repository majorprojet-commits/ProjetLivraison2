import React, { useState, useEffect } from 'react';
import { LogOut, Package, CheckCircle, Clock, ChefHat } from 'lucide-react';
import { cn } from '../lib/utils';

export default function RestaurantApp({ token, onLogout, user }: { token: string, onLogout: () => void, user: any }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // We assume user.restaurantId is set. For testing, if not, we fallback to the first restaurant ID.
  const restaurantId = user?.restaurantId || 'mock-restaurant-id';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders/restaurant/${restaurantId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setOrders(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch restaurant orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
    // In a real app, we'd use WebSockets or polling here
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [token, restaurantId]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        // Revert on failure
        const fetchOrders = async () => {
          const res = await fetch(`/api/orders/restaurant/${restaurantId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) setOrders(await res.json());
        };
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-xl">
            <ChefHat className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Espace Restaurant</h1>
            <p className="text-sm text-gray-500">{user?.name || 'Restaurant'}</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-red-500 font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column 1: Nouvelles Commandes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
            <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
              <h2 className="font-bold text-blue-800 flex items-center gap-2">
                <Package className="w-5 h-5" /> Nouvelles
              </h2>
              <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{pendingOrders.length}</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {pendingOrders.map(order => (
                <OrderCard key={order.id} order={order} onAction={() => updateOrderStatus(order.id, 'preparing')} actionText="Accepter & Préparer" actionColor="bg-blue-600" />
              ))}
              {pendingOrders.length === 0 && <p className="text-center text-gray-400 mt-10 text-sm">Aucune nouvelle commande</p>}
            </div>
          </div>

          {/* Column 2: En Préparation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
            <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
              <h2 className="font-bold text-orange-800 flex items-center gap-2">
                <Clock className="w-5 h-5" /> En Préparation
              </h2>
              <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">{preparingOrders.length}</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {preparingOrders.map(order => (
                <OrderCard key={order.id} order={order} onAction={() => updateOrderStatus(order.id, 'ready')} actionText="Marquer Prête" actionColor="bg-orange-600" />
              ))}
              {preparingOrders.length === 0 && <p className="text-center text-gray-400 mt-10 text-sm">Aucune commande en préparation</p>}
            </div>
          </div>

          {/* Column 3: Prêtes pour Livraison */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
            <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
              <h2 className="font-bold text-green-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Prêtes
              </h2>
              <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-full">{readyOrders.length}</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {readyOrders.map(order => (
                <OrderCard key={order.id} order={order} onAction={() => updateOrderStatus(order.id, 'delivered')} actionText="Livrée (Test)" actionColor="bg-green-600" />
              ))}
              {readyOrders.length === 0 && <p className="text-center text-gray-400 mt-10 text-sm">Aucune commande en attente de livreur</p>}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function OrderCard({ order, onAction, actionText, actionColor }: { order: any, onAction: () => void, actionText: string, actionColor: string }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-bold text-gray-400">#{order.id.slice(-6).toUpperCase()}</span>
          <p className="font-bold text-sm mt-1">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
        <span className="font-bold text-lg">{order.total.toFixed(2)} €</span>
      </div>
      
      <div className="space-y-2 mb-4">
        {order.items.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-gray-600"><span className="font-bold text-black">{item.quantity}x</span> {item.name}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={onAction}
        className={cn("w-full py-2 rounded-lg text-white font-bold text-sm transition-opacity hover:opacity-90", actionColor)}
      >
        {actionText}
      </button>
    </div>
  );
}
