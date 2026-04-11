import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import ClientApp from './apps/ClientApp';
import RestaurantApp from './apps/RestaurantApp';
import DriverApp from './apps/DriverApp';
import AdminApp from './apps/AdminApp';
import { fetchWithTimeout } from './lib/utils';

export default function App() {
  // We initialize with a 'dev-token' and 'admin' user to bypass login for testing
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || 'dev-token');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // If we are using the dev-token, we set a mock user immediately
      if (token === 'dev-token') {
        setUser({ id: 'dev-admin-id', role: 'admin', name: 'Administrateur (Dev)', restaurantId: 'r1' });
        setIsLoading(false);
        return;
      }

      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetchWithTimeout('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setUser(await (res as any).safeJson());
        } else {
          // If real token fails, fallback to dev mode for testing
          setToken('dev-token');
          setUser({ id: 'dev-admin-id', role: 'admin', name: 'Administrateur (Dev)', restaurantId: 'r1' });
        }
      } catch (e) {
        console.error("Auth check failed, falling back to dev mode:", e);
        setToken('dev-token');
        setUser({ id: 'dev-admin-id', role: 'admin', name: 'Administrateur (Dev)', restaurantId: 'r1' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
        {/* Dev Navigation Bar (Visible even during loading) */}
        <div className="bg-black text-white p-2 flex justify-center gap-4 text-xs font-bold sticky bottom-0 z-[9999] opacity-80 hover:opacity-100 transition-opacity">
          <span className="text-gray-500 mr-2 uppercase tracking-widest">Dev Mode:</span>
          <button 
            onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}
            className="text-red-400 hover:text-red-300"
          >
            Reset Auth (If Stuck)
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <Routes>
            {/* Client App Route */}
            <Route path="/" element={<ClientApp token={token!} user={user} onLogout={handleLogout} />} />
            
            {/* Restaurant App Route */}
            <Route 
              path="/restaurant/*" 
              element={
                !token ? (
                  <Navigate to="/" replace />
                ) : user?.role === 'restaurant' || user?.role === 'admin' ? (
                  <RestaurantApp token={token} onLogout={handleLogout} user={user} />
                ) : (
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-500">Accès Refusé</h1>
                    <p>Vous n'êtes pas un restaurateur.</p>
                    <a href="/" className="text-blue-500 underline mt-4 block">Retour à l'accueil</a>
                  </div>
                )
              } 
            />

            {/* Driver App Route */}
            <Route 
              path="/driver/*" 
              element={
                !token ? (
                  <Navigate to="/" replace />
                ) : user?.role === 'driver' || user?.role === 'admin' ? (
                  <DriverApp token={token} onLogout={handleLogout} user={user} />
                ) : (
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-500">Accès Refusé</h1>
                    <p>Vous n'êtes pas un livreur.</p>
                    <a href="/" className="text-blue-500 underline mt-4 block">Retour à l'accueil</a>
                  </div>
                )
              } 
            />

            {/* Admin App Route */}
            <Route 
              path="/admin/*" 
              element={
                !token ? (
                  <Navigate to="/" replace />
                ) : (user?.role === 'admin' || user?.role === 'restaurant') ? (
                  <AdminApp token={token} onLogout={handleLogout} user={user} />
                ) : (
                  <div className="p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-500">Accès Refusé</h1>
                    <p>Vous n'avez pas les permissions pour accéder au Dashboard.</p>
                    <a href="/" className="text-blue-500 underline mt-4 block">Retour à l'accueil</a>
                  </div>
                )
              } 
            />
          </Routes>
        </div>

        {/* Dev Navigation Bar (Bypass Mode Active) */}
        <div className="bg-orange-600 text-white p-2 flex justify-center gap-6 text-xs font-bold sticky bottom-0 z-[9999] shadow-lg">
          <span className="bg-white text-orange-600 px-2 py-0.5 rounded uppercase tracking-widest text-[10px]">Mode Test Actif</span>
          <Link to="/" className="hover:underline transition-all">Interface Client</Link>
          <Link to="/restaurant" className="hover:underline transition-all">Interface Restaurant</Link>
          <Link to="/driver" className="hover:underline transition-all">Interface Livreur</Link>
          <Link to="/admin" className="hover:underline transition-all">Dashboard Admin</Link>
        </div>
      </div>
    </Router>
  );
}
