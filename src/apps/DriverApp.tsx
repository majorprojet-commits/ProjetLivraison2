import React, { useState, useEffect } from 'react';
import { LogOut, Package, MapPin, CheckCircle, Navigation } from 'lucide-react';
import { cn, fetchWithTimeout } from '../lib/utils';

export default function DriverApp({ token, onLogout, user }: { token: string, onLogout: () => void, user: any }) {
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const [availableRes, myRes] = await Promise.all([
        fetchWithTimeout('/api/orders/available', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetchWithTimeout('/api/orders/driver', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (availableRes.ok) setAvailableOrders(await availableRes.json());
      if (myRes.ok) setMyOrders(await myRes.json());
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const acceptOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchOrders(); // Refresh lists
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
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

  const deliveringOrders = myOrders.filter(o => o.status === 'delivering');
  const completedOrders = myOrders.filter(o => o.status === 'delivered');

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-xl">
            <Navigation className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Espace Livreur</h1>
            <p className="text-sm text-gray-500">{user?.name || 'Livreur'}</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-red-500 font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Available Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
            <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
              <h2 className="font-bold text-blue-800 flex items-center gap-2">
                <Package className="w-5 h-5" /> Disponibles
              </h2>
              <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{availableOrders.length}</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {availableOrders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onAction={() => acceptOrder(order.id)} 
                  actionText="Accepter la course" 
                  actionColor="bg-blue-600" 
                />
              ))}
              {availableOrders.length === 0 && <p className="text-center text-gray-400 mt-10 text-sm">Aucune commande disponible</p>}
            </div>
          </div>

          {/* Column 2: My Deliveries */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
            <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
              <h2 className="font-bold text-orange-800 flex items-center gap-2">
                <Navigation className="w-5 h-5" /> En cours
              </h2>
              <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">{deliveringOrders.length}</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {deliveringOrders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onAction={() => updateStatus(order.id, 'delivered')} 
                  actionText="Marquer Livrée" 
                  actionColor="bg-orange-600" 
                />
              ))}
              {deliveringOrders.length === 0 && <p className="text-center text-gray-400 mt-10 text-sm">Aucune livraison en cours</p>}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
            <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
              <h2 className="font-bold text-green-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Terminées
              </h2>
              <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-full">{completedOrders.length}</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {completedOrders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onAction={() => {}} 
                  actionText="Livrée" 
                  actionColor="bg-gray-300 cursor-not-allowed text-gray-600" 
                  disabled
                />
              ))}
              {completedOrders.length === 0 && <p className="text-center text-gray-400 mt-10 text-sm">Aucune course terminée</p>}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function OrderCard({ order, onAction, actionText, actionColor, disabled = false }: { order: any, onAction: () => void, actionText: string, actionColor: string, disabled?: boolean }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs font-bold text-gray-400">#{order.id.slice(-6).toUpperCase()}</span>
          <p className="font-bold text-sm mt-1">{new Date(order.date || order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
        <span className="font-bold text-lg">{order.total.toFixed(2)} €</span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
          <span className="text-gray-600">Restaurant ID: {order.restaurantId.slice(-4)}</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <span className="text-gray-600">Client ID: {order.userId.slice(-4)}</span>
        </div>
      </div>

      <button 
        onClick={onAction}
        disabled={disabled}
        className={cn("w-full py-2 rounded-lg text-white font-bold text-sm transition-opacity hover:opacity-90", actionColor)}
      >
        {actionText}
      </button>
    </div>
  );
}
