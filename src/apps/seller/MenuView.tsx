import React, { useState } from 'react';
import { 
  Plus, Trash2, Edit3, Calendar, AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function MenuView({ menu, onAddDish, onUpdateDish, onDeleteDish, term, hours, onUpdateHours }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Plat',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    available: true
  });
  const [localHours, setLocalHours] = useState<any>(hours || {});

  const openEditModal = (dish: any) => {
    setEditingDishId(dish.id);
    setFormData({
      name: dish.name,
      price: dish.price.toString(),
      description: dish.description,
      category: dish.category || 'Plat',
      image: dish.image,
      available: dish.available
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDishId) {
      onUpdateDish(editingDishId, formData);
    } else {
      onAddDish(formData);
    }
    setIsModalOpen(false);
    setEditingDishId(null);
    setFormData({ name: '', price: '', description: '', category: 'Plat', image: '', available: true });
  };

  const handleUpdateHoursClick = () => {
    onUpdateHours(localHours);
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight italic serif">Gestion du {term.menu}</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Organisez vos articles et vos horaires d'ouverture</p>
        </div>
        <button 
          onClick={() => { setEditingDishId(null); setIsModalOpen(true); }}
          className="bg-black hover:bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-gray-200 flex items-center gap-3 active:scale-95"
        >
          <Plus className="w-5 h-5" /> {term.addDish}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {menu.map((item: any) => (
              <div key={item.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm group">
                <div className="h-48 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => openEditModal(item)}
                      className="p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteDish(item.id)}
                      className="p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-sm text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-red-500 text-white px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest">Épuisé</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-lg">{item.name}</h4>
                    <span className="font-black text-orange-500">{item.price.toLocaleString()} FCFA</span>
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
        </div>

        {/* Schedule Management */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-orange-500" /> Horaires
            </h3>
            <div className="space-y-4">
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-600">{day}</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={localHours[day]?.[0] || '11:00'} 
                      onChange={e => setLocalHours({...localHours, [day]: [e.target.value, localHours[day]?.[1] || '22:00']})}
                      className="w-16 bg-gray-50 border-none rounded-lg px-2 py-1 text-xs font-bold text-center" 
                    />
                    <span className="text-gray-300">-</span>
                    <input 
                      type="text" 
                      value={localHours[day]?.[1] || '22:00'} 
                      onChange={e => setLocalHours({...localHours, [day]: [localHours[day]?.[0] || '11:00', e.target.value]})}
                      className="w-16 bg-gray-50 border-none rounded-lg px-2 py-1 text-xs font-bold text-center" 
                    />
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={handleUpdateHoursClick}
              className="w-full mt-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors"
            >
              Enregistrer les Horaires
            </button>
          </div>

          <div className="bg-red-50 p-8 rounded-[32px] border border-red-100">
            <h3 className="text-xl font-black text-red-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" /> Fermeture Exceptionnelle
            </h3>
            <p className="text-sm text-red-600 font-medium mb-6">Désactivez votre commerce pour une période définie (vacances, travaux...).</p>
            <button className="w-full py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100">
              Planifier une Fermeture
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black mb-6">{editingDishId ? `Modifier le ${term.dish.toLowerCase()}` : term.addDish}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Nom du {term.dish.toLowerCase()}</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder={`ex: ${term.dish === 'Plat' ? 'Burger Deluxe' : term.dish === 'Article' ? 'T-shirt Coton' : 'Produit'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Prix (FCFA)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="12.50"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Catégorie</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option>Plat</option>
                    <option>Entrée</option>
                    <option>Dessert</option>
                    <option>Boisson</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Description</label>
                <textarea 
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-orange-500/20 h-24 resize-none"
                  placeholder="Description du plat..."
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">URL de l'image</label>
                <input 
                  type="url" 
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs">Annuler</button>
                <button type="submit" className="flex-[2] py-4 rounded-2xl bg-orange-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-100">
                  {editingDishId ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
