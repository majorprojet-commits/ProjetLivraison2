import React, { useState } from 'react';
import { Play, Pause, MapPin, Navigation, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export function SettingsView({ seller, onUpdate, onTogglePause }: { seller: any, onUpdate: (data: any) => void, onTogglePause: () => void }) {
  const [formData, setFormData] = useState({
    name: seller?.name || '',
    description: seller?.description || '',
    address: seller?.address || '',
    image: seller?.image || '',
    deliveryTime: seller?.deliveryTime || '20-30 min',
    deliveryFee: seller?.deliveryFee || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden mb-12">
        <div className="h-64 relative">
          <img src={seller?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-10">
            <h3 className="text-4xl font-black text-white tracking-tight">{seller?.name}</h3>
          </div>
        </div>

        <div className="p-10 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-6">
            <div className={cn("w-3 h-3 rounded-full animate-pulse", seller?.isPaused ? "bg-red-500" : "bg-green-500")} />
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut Actuel</p>
              <h4 className="font-black text-xl text-gray-900">{seller?.isPaused ? "Établissement Fermé" : "Ouvert aux commandes"}</h4>
            </div>
          </div>
          <button 
            onClick={onTogglePause}
            className={cn(
              "px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl active:scale-95",
              seller?.isPaused ? "bg-green-500 text-white shadow-green-100" : "bg-red-500 text-white shadow-red-100"
            )}
          >
            {seller?.isPaused ? <><Play className="w-4 h-4 fill-current" /> Réouvrir</> : <><Pause className="w-4 h-4 fill-current" /> Faire une pause</>}
          </button>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[48px] border border-gray-100 shadow-sm">
        <h3 className="text-2xl font-black italic serif mb-10 pb-6 border-b border-gray-50">Informations Générales</h3>
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Nom de la boutique</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-6 flex items-center text-gray-400">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Adresse physique</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-6 flex items-center text-gray-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Description</label>
                <div className="relative">
                  <div className="absolute top-4 left-6 text-gray-400">
                    <Info className="w-4 h-4" />
                  </div>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 transition-all h-[124px] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-gray-50">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Temps moyen</label>
                <input 
                  type="text"
                  value={formData.deliveryTime}
                  onChange={e => setFormData({...formData, deliveryTime: e.target.value})}
                  placeholder="20-30 min"
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Frais Liv.</label>
                <input 
                  type="number"
                  step="0.01"
                  value={formData.deliveryFee}
                  onChange={e => setFormData({...formData, deliveryFee: parseFloat(e.target.value)})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">URL Image de couverture</label>
              <input 
                type="url"
                value={formData.image}
                onChange={e => setFormData({...formData, image: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-orange-500/10 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-6 bg-black text-white rounded-[32px] font-black uppercase tracking-[0.4em] text-[10px] shadow-2xl shadow-gray-200 hover:bg-gray-900 transition-all active:scale-[0.98] mt-6"
          >
            Enregistrer le profil
          </button>
        </form>
      </div>
    </div>
  );
}
