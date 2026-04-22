import React from 'react';
import { 
  DollarSign, BarChart3, Star, Clock, ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { format, startOfDay, subDays } from 'date-fns';
import { cn } from '../../lib/utils';

export function DashboardView({ orders, menu }: { orders: any[], menu: any[] }) {
  const dailyRevenue = orders
    .filter(o => o.status === 'delivered' && new Date(o.createdAt) > startOfDay(new Date()))
    .reduce((acc, o) => acc + o.total, 0);
  
  const weeklyRevenue = orders
    .filter(o => o.status === 'delivered' && new Date(o.createdAt) > subDays(new Date(), 7))
    .reduce((acc, o) => acc + o.total, 0);

  const topDishes = menu.slice(0, 3).map(m => ({ 
    name: m.name, 
    sales: orders.filter(o => o.items.some((i: any) => i.name === m.name)).length 
  }));

  const revenueHistory = [
    { date: 'Lun', amount: dailyRevenue * 0.8 },
    { date: 'Mar', amount: dailyRevenue * 0.9 },
    { date: 'Mer', amount: dailyRevenue * 1.1 },
    { date: 'Jeu', amount: dailyRevenue * 0.7 },
    { date: 'Ven', amount: dailyRevenue * 1.5 },
    { date: 'Sam', amount: dailyRevenue * 1.8 },
    { date: 'Dim', amount: dailyRevenue }
  ];

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const preparingOrders = orders.filter(o => ['accepted', 'preparing'].includes(o.status)).length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Revenus Jour" value={`${dailyRevenue.toLocaleString()} FCFA`} icon={DollarSign} trend="+12.5%" color="orange" />
        <StatCard label="Commandes Hebdo" value={`${weeklyRevenue.toLocaleString()} FCFA`} icon={BarChart3} trend="+5.2%" color="blue" />
        <StatCard label="Note Moyenne" value="4.9" icon={Star} trend="Stable" color="green" />
        <StatCard label="En Cours" value={pendingOrders + preparingOrders} icon={Clock} live color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Performance des Ventes</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Évolution des revenus (Simulation)</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 900}} />
                <Tooltip 
                  cursor={{stroke: '#f97316', strokeWidth: 2}}
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px'}}
                />
                <Area type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Meilleures Ventes</h3>
          <div className="space-y-6 flex-1">
            {topDishes.map((dish: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-md",
                  idx === 0 ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-400"
                )}>
                  0{idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-black text-gray-900 leading-none mb-2">{dish.name}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{dish.sales} unités</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors">
            Voir le Catalogue complet
          </button>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
           <h3 className="text-xl font-black text-gray-900 tracking-tight">Dernières Commandes</h3>
           <button className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2">
             Toutes les commandes <ChevronRight className="w-4 h-4" />
           </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Client</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Statut</th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.slice(0, 5).map(order => (
                <tr key={order.id} className="group">
                  <td className="py-4">
                    <p className="font-black text-gray-900">{order.userName || 'Client Anonyme'}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()}</p>
                  </td>
                  <td className="py-4 font-black text-gray-900">{order.total.toLocaleString()} FCFA</td>
                  <td className="py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                      order.status === 'delivered' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 text-xs font-bold text-gray-400">{format(new Date(order.createdAt), 'dd MMM, HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, trend, color, live }: any) {
  const colors: any = {
    orange: "bg-orange-50 text-orange-600 ring-orange-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    green: "bg-green-50 text-green-600 ring-green-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100"
  };

  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ring-4 transition-all group-hover:scale-110", colors[color])}>
        <Icon className="w-7 h-7" />
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">{label}</p>
      <div className="flex items-end justify-between">
        <h4 className="text-3xl font-black text-gray-900 tracking-tighter">{value}</h4>
        {live ? (
          <div className="px-2 py-1 bg-red-50 text-red-500 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
             <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Live
          </div>
        ) : (
          <div className="text-[10px] font-black text-green-500 flex items-center gap-1">
             {trend} <TrendingUp className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}
