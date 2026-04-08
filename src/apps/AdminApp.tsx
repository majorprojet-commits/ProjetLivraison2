import React, { useState, useEffect } from 'react';
import { LogOut, Users, Shield, Store, Navigation } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminApp({ token, onLogout, user }: { token: string, onLogout: () => void, user: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleRoleChange = async (userId: string, newRole: string, restaurantId?: string) => {
    try {
      const body: any = { role: newRole };
      if (newRole === 'restaurant' && restaurantId) {
        body.restaurantId = restaurantId;
      }
      
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        fetchUsers();
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-xl">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Dashboard Administrateur</h1>
            <p className="text-sm text-gray-500">{user?.name || 'Admin'}</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-red-500 font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-500" />
            <h2 className="font-bold text-lg">Gestion des Utilisateurs</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="p-4 font-medium">Nom</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Rôle Actuel</th>
                  <th className="p-4 font-medium">Actions (Changer Rôle)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.map(u => (
                  <UserRow key={u.id} user={u} onRoleChange={handleRoleChange} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function UserRow({ user, onRoleChange }: { user: any, onRoleChange: (id: string, role: string, restId?: string) => void }) {
  const [selectedRole, setSelectedRole] = useState(user.role || 'client');
  const [restaurantId, setRestaurantId] = useState(user.restaurantId || '');

  const handleSave = () => {
    onRoleChange(user.id, selectedRole, selectedRole === 'restaurant' ? restaurantId : undefined);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="p-4 font-medium">{user.name}</td>
      <td className="p-4 text-gray-500">{user.email}</td>
      <td className="p-4">
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-bold",
          user.role === 'admin' ? "bg-purple-100 text-purple-700" :
          user.role === 'restaurant' ? "bg-orange-100 text-orange-700" :
          user.role === 'driver' ? "bg-green-100 text-green-700" :
          "bg-gray-100 text-gray-700"
        )}>
          {user.role || 'client'}
        </span>
        {user.role === 'restaurant' && user.restaurantId && (
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Store className="w-3 h-3" /> {user.restaurantId}
          </div>
        )}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <select 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="client">Client</option>
            <option value="restaurant">Restaurant</option>
            <option value="driver">Livreur</option>
            <option value="admin">Admin</option>
          </select>
          
          {selectedRole === 'restaurant' && (
            <input 
              type="text" 
              placeholder="ID du Restaurant" 
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500 w-32"
            />
          )}
          
          <button 
            onClick={handleSave}
            disabled={selectedRole === user.role && (selectedRole !== 'restaurant' || restaurantId === (user.restaurantId || ''))}
            className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sauvegarder
          </button>
        </div>
      </td>
    </tr>
  );
}
