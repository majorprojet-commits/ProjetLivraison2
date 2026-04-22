import React from 'react';
import { useDispatch } from 'react-redux';
import { setMenu } from '../../store';
import { cn } from '../../lib/utils';

export function QuickInventory({ menu, token, sellerId }: { menu: any[], token: string, sellerId: string }) {
  const dispatch = useDispatch();

  const toggleAvailability = async (itemId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/sellers/${sellerId}/menu/${itemId}/availability`, {
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
        <h3 className="text-xl font-black italic serif underline decoration-orange-500/30">Inventaire Rapide</h3>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Gérez la disponibilité de vos articles en un clic</p>
      </div>
      <div className="divide-y divide-gray-50 max-h-[calc(100vh-350px)] overflow-y-auto">
        {menu.map(item => (
          <div key={item.id} className="p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-black text-gray-900 text-lg mb-1">{item.name}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all",
                item.available ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
              )}>
                {item.available ? "Disponible" : "Épuisé"}
              </span>
              <button 
                onClick={() => toggleAvailability(item.id, item.available)}
                className={cn(
                  "w-16 h-8 rounded-full transition-all relative flex items-center shadow-inner",
                  item.available ? "bg-green-500" : "bg-gray-200"
                )}
              >
                <div className={cn(
                  "absolute w-6 h-6 bg-white rounded-full transition-transform shadow-md flex items-center justify-center",
                  item.available ? "translate-x-9" : "translate-x-1"
                )} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
