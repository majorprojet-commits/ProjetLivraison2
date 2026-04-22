import React from 'react';
import { Star, ChefHat } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ReviewsView({ reviews }: { reviews: any[] }) {
  return (
    <div className="max-w-5xl space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Note Globale</p>
          <h4 className="text-5xl font-black text-gray-900 tracking-tighter">4.9</h4>
          <div className="flex justify-center gap-1.5 mt-4">
            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase mt-4">Basé sur 1.2k avis</p>
        </div>
        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Recommandations</p>
          <h4 className="text-5xl font-black text-gray-900 tracking-tighter">98%</h4>
          <p className="text-[10px] font-black text-green-500 uppercase mt-4 bg-green-50 px-3 py-1 rounded-full inline-block">Excellent Ranking</p>
        </div>
        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Réactivité</p>
          <h4 className="text-5xl font-black text-gray-900 tracking-tighter">2h</h4>
          <p className="text-[10px] font-black text-blue-500 uppercase mt-4 bg-blue-50 px-3 py-1 rounded-full inline-block">Top Repondeur</p>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-xl font-black italic serif px-4">Derniers retours d'expérience</h3>
        {reviews.map(review => (
          <div key={review.id} className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8 group transition-all hover:shadow-xl">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gray-50 rounded-[28px] border border-gray-100 flex items-center justify-center text-3xl font-black text-gray-200">
                  {review.user.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-xl text-gray-900 tracking-tight">{review.user}</h4>
                  <div className="flex gap-1.5 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={cn("w-4 h-4", s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{review.date}</span>
            </div>
            
            <p className="text-lg text-gray-600 font-medium leading-relaxed italic serif px-4">"{review.comment}"</p>

            {review.reply ? (
              <div className="bg-gray-50 p-8 rounded-[36px] border border-gray-100 relative mt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-black rounded-xl">
                    <ChefHat className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Votre établissement</span>
                </div>
                <p className="text-sm text-gray-500 font-bold leading-relaxed">{review.reply}</p>
              </div>
            ) : (
              <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-[32px]">
                <input 
                  type="text" 
                  placeholder="Écrire une réponse personnalisée..." 
                  className="flex-1 bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all placeholder:text-gray-300"
                />
                <button className="bg-black hover:bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg">
                  Envoyer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
