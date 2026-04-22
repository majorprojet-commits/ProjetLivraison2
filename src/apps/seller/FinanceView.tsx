import React from 'react';
import { cn } from '../../lib/utils';

export function FinanceView({ orders, payoutsData }: { orders: any[], payoutsData: any }) {
  const pastOrders = orders.filter(o => o.status === 'delivered');
  const commissionRate = 0.15; // 15% commission

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={cn(
          "p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group transition-all hover:scale-[1.02]",
          payoutsData.balance > 0 ? "bg-orange-500 shadow-orange-100" : "bg-gray-400 shadow-gray-100"
        )}>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-4">Solde Disponible</p>
          <h4 className="text-5xl font-black mb-10 tracking-tighter">{payoutsData.balance.toLocaleString()} <span className="text-2xl opacity-60">FCFA</span></h4>
          <button 
            disabled={payoutsData.balance === 0}
            className="w-full py-5 bg-white text-orange-600 rounded-[28px] font-black uppercase text-[10px] tracking-widest hover:bg-orange-50 transition-all disabled:opacity-50 shadow-xl"
          >
            Virement Immédiat
          </button>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm flex flex-col justify-between">
           <div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Commissions Plateforme</p>
             <h4 className="text-3xl font-black text-gray-900 tracking-tight">{(pastOrders.reduce((acc, o) => acc + o.total, 0) * commissionRate).toLocaleString()} FCFA</h4>
           </div>
           <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase uppercase">Taux de service</span>
              <span className="text-[10px] font-black text-orange-500 uppercase bg-orange-50 px-3 py-1 rounded-full">15% Fixe</span>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm flex flex-col justify-between">
           <div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Paiements Effectués</p>
             <h4 className="text-3xl font-black text-gray-900 tracking-tight">{payoutsData.payouts?.length || 0}</h4>
           </div>
           <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase uppercase">Dernière activité</span>
              <span className="text-[10px] font-black text-gray-900 uppercase">Aujourd'hui</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-black italic serif">Historique des Virements</h3>
          <button className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:translate-x-1 transition-transform">Exporter CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 text-left">
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Montant Brut</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Statut</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Justificatif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payoutsData.payouts?.map((p: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-10 py-6 font-black text-gray-900">#TR-{1000 + idx}</td>
                  <td className="px-10 py-6 text-sm text-gray-500 font-bold">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="px-10 py-6 font-black text-gray-900">{p.amount.toLocaleString()} FCFA</td>
                  <td className="px-10 py-6">
                    <span className={cn(
                      "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                      p.status === 'completed' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                    )}>
                      {p.status === 'completed' ? 'Validé' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors">
                       📄
                    </button>
                  </td>
                </tr>
              ))}
              {(!payoutsData.payouts || payoutsData.payouts.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center text-gray-300 font-black italic serif text-lg">
                    Aucune transaction enregistrée pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
