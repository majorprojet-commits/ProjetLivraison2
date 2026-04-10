import React, { useState, useEffect } from 'react';
import { LogOut, Package, MapPin, CheckCircle, Navigation, Phone, MessageSquare, Camera, Key } from 'lucide-react';
import { cn, fetchWithTimeout } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';

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
    
    // Firestore Real-time Listener
    const q = query(collection(db, 'orders'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      fetchOrders();
    });

    return () => unsubscribe();
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

  const deliveringOrders = myOrders.filter(o => o.status === 'delivering' || o.status === 'picked_up');
  const completedOrders = myOrders.filter(o => o.status === 'delivered');

  const dailyEarnings = completedOrders.reduce((sum, o) => sum + (o.total * 0.1), 0); // Mock 10% commission for driver

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
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gains du jour</p>
            <p className="text-lg font-black text-green-600">{dailyEarnings.toFixed(2)} €</p>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-red-500 font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
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
                  onAction={(status) => updateStatus(order.id, status)} 
                  actionText={order.status === 'picked_up' ? 'Marquer Livrée' : 'Marquer Récupérée'} 
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

function OrderCard({ order, onAction, actionText, actionColor, disabled = false }: { order: any, onAction: (data?: any) => void, actionText: string, actionColor: string, disabled?: boolean, key?: any }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [clientCodeInput, setClientCodeInput] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (order.status === 'picked_up') {
      if (clientCodeInput.toUpperCase() === order.clientCode) {
        onAction('delivered');
        setShowConfirm(false);
      } else {
        setError('Code incorrect');
      }
    } else {
      onAction('picked_up');
    }
  };

  const launchRoute = () => {
    const address = order.status === 'delivering' ? 'Paris, France' : 'Paris, France'; // Mock addresses
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <div className="border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all bg-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</span>
          <p className="font-black text-lg mt-0.5">{new Date(order.date || order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
        <div className="text-right">
          <p className="font-black text-lg">{order.total.toFixed(2)} €</p>
          {order.status === 'delivering' && (
             <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded uppercase">Retrait: {order.pickupCode}</span>
          )}
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3 text-sm">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Restaurant</p>
            <p className="font-bold text-gray-700">Restaurant ID: {order.restaurantId.slice(-4)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</p>
            <p className="font-bold text-gray-700">Client ID: {order.userId.slice(-4)}</p>
          </div>
        </div>
      </div>

      {order.status !== 'delivered' && !showConfirm && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button 
            onClick={() => window.open('tel:0123456789')}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-600 font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors"
          >
            <Phone className="w-3 h-3" /> {order.status === 'picked_up' ? 'Client' : 'Resto'}
          </button>
          <button 
            onClick={() => {}}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-600 font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors"
          >
            <MessageSquare className="w-3 h-3" /> Chat
          </button>
        </div>
      )}

      {!disabled && (
        <div className="space-y-2">
          {order.status !== 'delivered' && (
            <button 
              onClick={launchRoute}
              className="w-full py-3 rounded-xl bg-black text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
            >
              <Navigation className="w-4 h-4" /> Itinéraire
            </button>
          )}

          {order.status === 'picked_up' && showConfirm ? (
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-3 text-center">Confirmation Livraison</p>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                  <input 
                    type="text" 
                    placeholder="Code Client" 
                    value={clientCodeInput}
                    onChange={e => { setClientCodeInput(e.target.value); setError(''); }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border-none rounded-lg text-sm font-black focus:ring-2 focus:ring-orange-500/20 outline-none uppercase"
                  />
                </div>
                <button className="p-2.5 bg-white rounded-lg text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              {error && <p className="text-[10px] text-red-500 font-bold mb-3 text-center">{error}</p>}
              <div className="flex gap-2">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Annuler</button>
                <button onClick={handleConfirm} className="flex-[2] py-2 bg-orange-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-100">Confirmer</button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => order.status === 'picked_up' ? setShowConfirm(true) : onAction('picked_up')}
              disabled={disabled}
              className={cn("w-full py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95", actionColor)}
            >
              {order.status === 'delivering' ? 'Récupérer la commande' : actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
