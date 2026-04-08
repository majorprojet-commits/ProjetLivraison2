import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ClientApp from './apps/ClientApp';
import RestaurantApp from './apps/RestaurantApp';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setUser(await res.json());
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch (e) {
        console.error(e);
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Client App Route */}
        <Route path="/" element={<ClientApp />} />
        
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
      </Routes>
    </Router>
  );
}
