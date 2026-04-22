import React, { useState } from 'react';
import { 
  Package, ChefHat, CheckCircle, Clock, Navigation
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function OperationsView({ orders, onUpdateStatus, onAddTime }: { orders: any[], onUpdateStatus: (id: string, status: string, data?: any) => void, onAddTime: (id: string, mins: number) => void }) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalType, setModalType] = useState<'accept' | 'refuse' | null>(null);
  const [prepTime, setPrepTime] = useState('20');
  const [refuseReason, setRefuseReason] = useState('');

  const pending = orders.filter(o => o.status === 'pending');
  const preparing = orders.filter(o => ['accepted', 'preparing'].includes(o.status));
  const ready = orders.filter(o => o.status === 'ready_for_pickup');

  const handleAccept = () => {
    onUpdateStatus(selectedOrder.id, 'accepted', { prepTime });
    setModalType(null);
    setSelectedOrder(null);
  };

  const handleRefuse = () => {
    onUpdateStatus(selectedOrder.id, 'cancelled', { reason: refuseReason });
    setModalType(null);
    setSelectedOrder(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full relative">
      <OrderColumn 
        title="Nouvelles" 
        icon={Package} 
        color="blue" 
        orders={pending} 
        onAction={(order: any) => { setSelectedOrder(order); setModalType('accept'); }} 
        onRefuse={(order: any) => { setSelectedOrder(order); setModalType('refuse'); }}
        actionText="Accepter" 
      />
      <OrderColumn 
        title="En Cuisine" 
        icon={ChefHat} 
        color="orange" 
        orders={preparing} 
        onAction={(order: any) => onUpdateStatus(order.id, 'ready_for_pickup')} 
        onAddTime={onAddTime}
        actionText="Prête" 
      />
      <OrderColumn 
        title="À Récupérer" 
        icon={CheckCircle} 
        color="green" 
        orders={ready} 
        onAction={(order: any) => onUpdateStatus(order.id, 'out_for_delivery')} 
        actionText="Expédiée" 
      />

      {/* Modals */}
      {modalType === 'accept' && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black mb-4">Temps de préparation</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Combien de temps faut-il pour préparer cette commande ?</p>
            <div className="grid grid-cols-4 gap-3 mb-8">
              {['10', '20', '30', '45'].map(t => (
                <button 
                  key={t}
                  onClick={() => setPrepTime(t)}
                  className={cn(
                    "py-3 rounded-xl font-black text-xs transition-all",
                    prepTime === t ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  )}
                >
                  {t} min
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setModalType(null)} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs">Annuler</button>
              <button onClick={handleAccept} className="flex-[2] py-4 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {modalType === 'refuse' && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black mb-4 text-red-600">Refuser la commande</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Indiquez la raison du refus pour le client.</p>
            <textarea 
               value={refuseReason}
               onChange={e => setRefuseReason(e.target.value)}
               className="w-full bg-gray-50 border-none rounded-2xl px-4 py-4 font-bold outline-none focus:ring-2 focus:ring-red-500/20 mb-8 h-24 resize-none"
               placeholder="ex: Rupture d'un ingrédient..."
            />
            <div className="flex gap-4">
              <button onClick={() => setModalType(null)} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs">Annuler</button>
              <button onClick={handleRefuse} className="flex-[2] py-4 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-red-100">Confirmer le Refus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderColumn({ title, icon: Icon, color, orders, onAction, onRefuse, onAddTime, actionText }: any) {
  const bgColors: any = { blue: "bg-blue-50", orange: "bg-orange-50", green: "bg-green-50" };
  const textColors: any = { blue: "text-blue-600", orange: "text-orange-600", green: "text-green-600" };
  const dotColors: any = { blue: "bg-blue-500", orange: "bg-orange-500", green: "bg-green-500" };

  return (
    <div className="flex flex-col h-full bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl", bgColors[color], textColors[color])}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-black text-gray-900 tracking-tight">{title}</h3>
        </div>
        <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase", bgColors[color], textColors[color])}>
          {orders.length}
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)]">
        {orders.map((order: any) => (
          <div key={order.id} className="bg-gray-50/50 rounded-3xl p-5 border border-gray-100 transition-all hover:shadow-lg hover:bg-white group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-black text-gray-900 leading-none mb-1">#{order.id.slice(-6).toUpperCase()}</p>
                <div className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full", dotColors[color])} />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.userName || 'Client'}</p>
                </div>
              </div>
              <p className="font-black text-orange-500 text-sm whitespace-nowrap">{order.total.toLocaleString()} FCFA</p>
            </div>
            
            <div className="space-y-2 mb-6">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-xs font-bold text-gray-600">
                  <span>{item.quantity}x {item.name}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => onAction(order)}
                className={cn(
                  "w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all",
                  color === 'blue' ? "bg-black text-white" : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                )}
              >
                {actionText}
              </button>
              {color === 'blue' && onRefuse && (
                <button onClick={() => onRefuse(order)} className="text-[10px] font-black text-red-400 uppercase tracking-widest py-1 hover:text-red-500 transition-colors">
                  Refuser
                </button>
              )}
              {color === 'orange' && onAddTime && (
                <div className="flex items-center gap-1 mt-2 justify-center">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <button onClick={() => onAddTime(order.id, 5)} className="text-[9px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">+5 min</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="h-40 flex flex-col items-center justify-center text-gray-300">
             <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 opacity-40" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest italic">Aucune commande</p>
          </div>
        )}
      </div>
    </div>
  );
}
