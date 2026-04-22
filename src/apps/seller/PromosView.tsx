import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Trash2, XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

export function PromosView({ token, sellerId }: { token: string, sellerId: string }) {
  const [promos, setPromos] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    usageLimit: 100,
    expiryDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    minOrderAmount: 0
  });

  const fetchPromos = async () => {
    try {
      const res = await fetch(`/api/sellers/${sellerId}/promos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPromos(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchPromos(); }, [sellerId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/sellers/${sellerId}/promos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsOpen(false);
        fetchPromos();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (promoId: string, current: boolean) => {
    try {
      await fetch(`/api/sellers/${sellerId}/promos/${promoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: current ? 'inactive' : 'active' })
      });
      fetchPromos();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (promoId: string) => {
    if (!confirm('Supprimer cette promotion ?')) return;
    try {
      await fetch(`/api/sellers/${sellerId}/promos/${promoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPromos();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight italic serif">Fidélisation & Marketing</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Créez des offres exclusives pour attirer vos clients</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-black hover:bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-gray-200 flex items-center gap-3 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Créer une Offre
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {promos.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[40px] border border-dashed border-gray-200 flex flex-col items-center">
            <Tag className="w-16 h-16 text-gray-200 mb-6" />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic serif">Aucune promotion active actuellement</p>
          </div>
        ) : (
          promos.map(promo => (
            <div key={promo.id} className={cn(
              "bg-white p-10 rounded-[48px] border transition-all hover:shadow-2xl hover:-translate-y-1 relative group overflow-hidden",
              promo.status === 'active' ? "border-orange-100 shadow-sm" : "border-gray-100 opacity-60"
            )}>
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => handleDelete(promo.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl">
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>

              <div className="flex justify-between items-start mb-10">
                <div className={cn(
                  "w-16 h-16 rounded-3xl flex items-center justify-center transition-all group-hover:scale-110",
                  promo.status === 'active' ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-400"
                )}>
                  <Tag className="w-8 h-8" />
                </div>
                <div className="text-right">
                   <p className="text-3xl font-black text-gray-900 tracking-tighter">
                     {promo.discountValue}{promo.discountType === 'percentage' ? '%' : ' FCFA'}
                   </p>
                   <p className="text-[10px] font-black text-gray-400 uppercase italic">Remise</p>
                </div>
              </div>

              <h4 className="text-xl font-black text-gray-900 tracking-tight mb-4 uppercase">{promo.code}</h4>
              
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Expiration</span>
                  <span className={cn(new Date(promo.expiryDate) < new Date() ? "text-red-500" : "text-gray-900")}>
                    {format(new Date(promo.expiryDate), 'dd MMM yyyy')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Limite</span>
                  <span className="text-gray-900">{promo.usageCount || 0} / {promo.usageLimit}</span>
                </div>
              </div>

              <button 
                onClick={() => handleToggle(promo.id, promo.status === 'active')}
                className={cn(
                  "w-full mt-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95",
                  promo.status === 'active' 
                    ? "bg-red-50 text-red-600 hover:bg-red-100 shadow-red-50" 
                    : "bg-green-50 text-green-600 hover:bg-green-100 shadow-green-50"
                )}
              >
                {promo.status === 'active' ? "Désactiver l'offre" : "Activer l'offre"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Create Promo Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] p-12 max-w-2xl w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-3xl font-black italic serif tracking-tight">Nouvelle Promotion</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Boostez votre visibilité avec une remise personnalisée</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <XCircle className="w-8 h-8 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 text-center">Code (ex: CHEZVOUS10)</label>
                  <input 
                    required
                    type="text" 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full bg-gray-50 border-none rounded-[28px] px-8 py-6 text-2xl font-black tracking-[0.2em] text-center uppercase focus:ring-4 focus:ring-orange-500/10 transition-all outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Type de remise</label>
                  <select 
                    value={formData.discountType}
                    onChange={e => setFormData({...formData, discountType: e.target.value as any})}
                    className="w-full bg-gray-50 rounded-2xl px-6 py-5 text-sm font-black transition-all outline-none h-16"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant Fixe (FCFA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Valeur remise</label>
                  <input 
                    required
                    type="number" 
                    value={formData.discountValue} 
                    onChange={e => setFormData({...formData, discountValue: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 rounded-2xl px-6 py-5 text-sm font-black outline-none h-16" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Nb. d'usages max</label>
                  <input 
                    required
                    type="number" 
                    value={formData.usageLimit} 
                    onChange={e => setFormData({...formData, usageLimit: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 rounded-2xl px-6 py-5 text-sm font-black outline-none h-16" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Fin de validité</label>
                  <input 
                    required
                    type="date" 
                    value={formData.expiryDate} 
                    onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full bg-gray-50 rounded-2xl px-6 py-5 text-sm font-black outline-none h-16" 
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-6 bg-orange-500 text-white rounded-[32px] font-black uppercase text-xs tracking-[0.4em] shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all active:scale-[0.98] mt-4">
                Lancer la Campagne
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
