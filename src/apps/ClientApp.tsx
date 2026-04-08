import React, { useState, useEffect } from 'react';
import { Home, Search, Receipt, User, MapPin, Clock, Star, ChevronLeft, Plus, Minus, ShoppingBag, Moon, Sun, Globe, X, Tag, Calendar, CreditCard, Edit2, Check, LogOut, Package, CheckCircle, ChevronRight, ChevronDown, ChevronUp, Phone, MessageCircle, Navigation } from 'lucide-react';
import { CATEGORIES } from '../data';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const TRANSLATIONS = {
  fr: {
    deliverNow: 'Livrer maintenant',
    scheduled: 'Programmée',
    searchPlaceholder: 'Plats, restaurants ou cuisines',
    featured: 'À la une',
    popular: 'Populaires',
    deliveryFee: 'Frais de livraison',
    free: 'Gratuit',
    viewCart: 'Voir le panier',
    cartTitle: 'Votre Panier',
    promoCode: 'Code promo (ex: UBER10)',
    apply: 'Appliquer',
    subtotal: 'Sous-total',
    total: 'Total',
    checkout: 'Commander',
    home: 'Accueil',
    search: 'Recherche',
    orders: 'Commandes',
    profile: 'Compte',
    scheduleDelivery: 'Planifier la livraison',
    today: 'Aujourd\'hui',
    tomorrow: 'Demain',
    discount: 'Réduction',
    profileTitle: 'Mon Profil',
    personalInfo: 'Informations Personnelles',
    edit: 'Modifier',
    save: 'Enregistrer',
    name: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    deliveryAddresses: 'Adresses de livraison',
    paymentMethods: 'Moyens de paiement',
    addAddress: 'Ajouter une adresse',
    addPayment: 'Ajouter un moyen de paiement',
    logout: 'Se déconnecter',
    wip: 'En cours de développement...',
    activeOrders: 'En cours',
    pastOrders: 'Passées',
    delivered: 'Livrée',
    inTransit: 'En route',
    reorder: 'Recommander',
    track: 'Suivre',
    searchPrompt: 'Que voulez-vous manger ?',
    noResults: 'Aucun résultat trouvé',
    trackingOrder: 'Suivi de commande',
    estimatedTime: 'Temps estimé',
    driverOnTheWay: 'Votre livreur est en route',
    call: 'Appeler',
    message: 'Message',
    preparing: 'Préparation en cours',
    pickedUp: 'Commande récupérée',
    arriving: 'Arrivée imminente',
    driverName: 'Marc D.',
    resultsFor: 'Résultats pour',
    loading: 'Chargement...'
  },
  en: {
    deliverNow: 'Deliver now',
    scheduled: 'Scheduled',
    searchPlaceholder: 'Dishes, restaurants or cuisines',
    featured: 'Featured',
    popular: 'Popular',
    deliveryFee: 'Delivery fee',
    free: 'Free',
    viewCart: 'View cart',
    cartTitle: 'Your Cart',
    promoCode: 'Promo code (e.g. UBER10)',
    apply: 'Apply',
    subtotal: 'Subtotal',
    total: 'Total',
    checkout: 'Checkout',
    home: 'Home',
    search: 'Search',
    orders: 'Orders',
    profile: 'Profile',
    scheduleDelivery: 'Schedule delivery',
    today: 'Today',
    tomorrow: 'Tomorrow',
    discount: 'Discount',
    profileTitle: 'My Profile',
    personalInfo: 'Personal Information',
    edit: 'Edit',
    save: 'Save',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    deliveryAddresses: 'Delivery Addresses',
    paymentMethods: 'Payment Methods',
    addAddress: 'Add an address',
    addPayment: 'Add payment method',
    logout: 'Log out',
    wip: 'Work in progress...',
    activeOrders: 'Active',
    pastOrders: 'Past',
    delivered: 'Delivered',
    inTransit: 'In Transit',
    reorder: 'Reorder',
    track: 'Track',
    searchPrompt: 'What do you want to eat?',
    noResults: 'No results found',
    trackingOrder: 'Order Tracking',
    estimatedTime: 'Estimated Time',
    driverOnTheWay: 'Your driver is on the way',
    call: 'Call',
    message: 'Message',
    preparing: 'Preparing your order',
    pickedUp: 'Order picked up',
    arriving: 'Arriving soon',
    driverName: 'Mark D.',
    resultsFor: 'Results for',
    loading: 'Loading...'
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [cart, setCart] = useState<{ itemId: string; quantity: number; price: number; name: string }[]>([]);
  
  // Features State
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [deliveryMode, setDeliveryMode] = useState<'now' | 'scheduled'>('now');

  // API Data State
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth State
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');

  // Profile & Orders State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    id: '',
    name: '',
    email: '',
    phone: ''
  });
  const [orderFilter, setOrderFilter] = useState<'active' | 'past'>('active');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingOrder, setTrackingOrder] = useState<any | null>(null);

  const t = TRANSLATIONS[lang];
  const restaurant = restaurants.find(r => r.id === selectedRestaurant);

  // Fetch Data on Mount or Token Change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const resRes = await fetch('/api/restaurants');
        if (resRes.ok) setRestaurants(await resRes.json());

        if (token) {
          const [userRes, ordersRes] = await Promise.all([
            fetch('/api/users/me', { headers }),
            fetch('/api/orders', { headers })
          ]);
          
          if (userRes.ok) setProfileData(await userRes.json());
          if (ordersRes.ok) setOrders(await ordersRes.json());
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      
      if (authMode === 'register') {
        setAuthMode('login');
        setAuthError('Inscription réussie ! Veuillez vous connecter.');
      } else {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        if (data.user?.role === 'restaurant' || data.user?.role === 'admin') {
          window.location.href = '/restaurant';
        } else if (data.user?.role === 'driver') {
          window.location.href = '/driver';
        }
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setProfileData({ id: '', name: '', email: '', phone: '' });
    setOrders([]);
    setActiveTab('home');
  };

  const handleSaveProfile = async () => {
    setIsEditingProfile(false);
    try {
      const res = await fetch(`/api/users/me`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        setProfileData(await res.json());
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: selectedRestaurant,
          items: cart,
          total: cartTotal
        })
      });
      if (res.ok) {
        const newOrder = await res.json();
        setOrders(prev => [newOrder, ...prev]);
        setCart([]);
        setIsCartOpen(false);
        setActiveTab('orders');
        setOrderFilter('active');
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  const handleReorder = (order: any) => {
    setSelectedRestaurant(order.restaurantId);
    setCart(order.items.map((item: any) => ({
      itemId: item.itemId || item.name,
      quantity: item.quantity,
      price: item.price,
      name: item.name
    })));
    setDiscount(0);
    setPromoCode('');
    setActiveTab('home');
    setIsCartOpen(true);
  };

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.itemId === item.id);
      if (existing) {
        return prev.map(i => i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { itemId: item.id, quantity: 1, price: item.price, name: item.name }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.itemId !== itemId);
    });
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'UBER10') {
      setDiscount(0.10); // 10% discount
    } else {
      setDiscount(0);
    }
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = cartSubtotal * discount;
  const deliveryFee = restaurant?.deliveryFee || 0;
  const cartTotal = cartSubtotal - discountAmount + deliveryFee;
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredOrders = orders.filter(order => 
    orderFilter === 'active' ? order.status === 'PENDING' || order.status === 'IN_TRANSIT' : order.status === 'DELIVERED'
  );

  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    r.menu?.some((item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className={cn("flex justify-center items-center min-h-screen font-sans", isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black")}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={cn("flex justify-center items-center min-h-screen font-sans transition-colors duration-300", isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black")}>
        <div className={cn("w-full max-w-md p-8 rounded-3xl shadow-2xl", isDark ? "bg-gray-800" : "bg-white")}>
          <h1 className="text-3xl font-bold text-center mb-8">
            {authMode === 'login' ? 'Connexion' : 'Inscription'}
          </h1>
          
          {authError && (
            <div className={cn("p-3 rounded-xl mb-6 text-sm text-center font-medium", authError.includes('réussie') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className={cn("text-sm font-medium", isDark ? "text-gray-300" : "text-gray-700")}>Nom</label>
                <input 
                  type="text" 
                  required
                  value={authForm.name}
                  onChange={e => setAuthForm({...authForm, name: e.target.value})}
                  className={cn("w-full mt-1 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors", isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black")}
                />
              </div>
            )}
            <div>
              <label className={cn("text-sm font-medium", isDark ? "text-gray-300" : "text-gray-700")}>Email</label>
              <input 
                type="email" 
                required
                value={authForm.email}
                onChange={e => setAuthForm({...authForm, email: e.target.value})}
                className={cn("w-full mt-1 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors", isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black")}
              />
            </div>
            <div>
              <label className={cn("text-sm font-medium", isDark ? "text-gray-300" : "text-gray-700")}>Mot de passe</label>
              <input 
                type="password" 
                required
                value={authForm.password}
                onChange={e => setAuthForm({...authForm, password: e.target.value})}
                className={cn("w-full mt-1 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors", isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black")}
              />
            </div>
            <button 
              type="submit"
              className={cn("w-full py-4 rounded-xl font-bold text-lg mt-6 transition-transform active:scale-95", isDark ? "bg-white text-black" : "bg-black text-white")}
            >
              {authMode === 'login' ? 'Se connecter' : 'S\'inscrire'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError('');
              }}
              className={cn("text-sm font-medium hover:underline", isDark ? "text-gray-400" : "text-gray-600")}
            >
              {authMode === 'login' ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex justify-center min-h-screen font-sans transition-colors duration-300", isDark ? "bg-gray-900" : "bg-gray-100")}>
      
      {/* Settings Panel (Outside Mobile Simulator) */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-50">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-800 dark:text-white hover:scale-110 transition-transform"
          title="Toggle Dark Mode"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button 
          onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg text-gray-800 dark:text-white hover:scale-110 transition-transform font-bold text-sm flex items-center justify-center"
          title="Toggle Language"
        >
          {lang.toUpperCase()}
        </button>
      </div>

      {/* Mobile Container Simulator */}
      <div className={cn(
        "w-full max-w-md min-h-screen shadow-2xl relative overflow-hidden flex flex-col transition-colors duration-300",
        isDark ? "bg-gray-900 text-white" : "bg-white text-black"
      )}>
        
        <AnimatePresence mode="wait">
          {activeTab === 'home' && !selectedRestaurant && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto pb-24"
            >
              {/* Header */}
              <div className={cn("sticky top-0 z-10 px-4 pt-6 pb-4 shadow-sm transition-colors", isDark ? "bg-gray-900" : "bg-white")}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <button 
                        onClick={() => setDeliveryMode('now')}
                        className={cn("text-xs font-bold px-2 py-1 rounded-full transition-colors", deliveryMode === 'now' ? (isDark ? "bg-white text-black" : "bg-black text-white") : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400")}
                      >
                        {t.deliverNow}
                      </button>
                      <button 
                        onClick={() => setDeliveryMode('scheduled')}
                        className={cn("text-xs font-bold px-2 py-1 rounded-full transition-colors", deliveryMode === 'scheduled' ? (isDark ? "bg-white text-black" : "bg-black text-white") : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400")}
                      >
                        {t.scheduled}
                      </button>
                    </div>
                    <div className="flex items-center gap-1 cursor-pointer">
                      <h1 className="text-sm font-bold truncate max-w-[200px]">123 Rue de la Livraison, Paris</h1>
                      <MapPin className={cn("w-4 h-4", isDark ? "text-white" : "text-black")} />
                    </div>
                  </div>
                  <div 
                    onClick={() => setActiveTab('profile')}
                    className={cn("w-10 h-10 rounded-full flex items-center justify-center overflow-hidden cursor-pointer", isDark ? "bg-gray-800" : "bg-gray-200")}
                  >
                    <User className={cn("w-6 h-6", isDark ? "text-gray-400" : "text-gray-500")} />
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mt-4 relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder={t.searchPlaceholder} 
                    className={cn(
                      "w-full rounded-full py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-colors",
                      isDark ? "bg-gray-800 text-white placeholder-gray-500" : "bg-gray-100 text-black"
                    )}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="px-4 py-6">
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {CATEGORIES.map(cat => (
                    <div key={cat.id} className="flex flex-col items-center gap-2 min-w-[70px]">
                      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-colors", isDark ? "bg-gray-800" : "bg-gray-100")}>
                        {cat.icon}
                      </div>
                      <span className={cn("text-xs font-medium", isDark ? "text-gray-300" : "text-gray-700")}>{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Restaurant List */}
              <div className="px-4 pb-6">
                <h2 className="text-xl font-bold mb-4">{t.featured}</h2>
                <div className="flex flex-col gap-6">
                  {restaurants.map(restaurant => (
                    <div 
                      key={restaurant.id} 
                      className="cursor-pointer group"
                      onClick={() => {
                        setSelectedRestaurant(restaurant.id);
                        setCart([]); // Clear cart when changing restaurant (Multi-restaurant logic constraint)
                        setDiscount(0);
                        setPromoCode('');
                      }}
                    >
                      <div className="relative h-48 rounded-2xl overflow-hidden mb-3">
                        <img 
                          src={restaurant.image} 
                          alt={restaurant.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className={cn("absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md", isDark ? "bg-gray-900 text-white" : "bg-white text-black")}>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {restaurant.rating}
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold">{restaurant.name}</h3>
                          <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>{restaurant.tags.join(' • ')}</p>
                        </div>
                        <div className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1", isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-black")}>
                          <Clock className="w-3 h-3" />
                          {restaurant.deliveryTime}
                        </div>
                      </div>
                      <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                        {t.deliveryFee} : {restaurant.deliveryFee === 0 ? t.free : `${restaurant.deliveryFee}€`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'home' && selectedRestaurant && (
            <motion.div 
              key="restaurant"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn("flex-1 overflow-y-auto pb-24 transition-colors", isDark ? "bg-gray-950" : "bg-gray-50")}
            >
              {/* Restaurant Header */}
              <div className="relative h-64">
                <img src={restaurant?.image} alt={restaurant?.name} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setSelectedRestaurant(null)}
                  className={cn("absolute top-6 left-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md", isDark ? "bg-gray-900 text-white" : "bg-white text-black")}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>
              
              <div className={cn("-mt-6 relative rounded-t-3xl px-4 pt-6 pb-4 shadow-sm transition-colors", isDark ? "bg-gray-900" : "bg-white")}>
                <h1 className="text-3xl font-bold">{restaurant?.name}</h1>
                <div className={cn("flex items-center gap-4 mt-2 text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                  <span className={cn("flex items-center gap-1 font-medium", isDark ? "text-white" : "text-black")}>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {restaurant?.rating} (500+ avis)
                  </span>
                  <span>•</span>
                  <span>{restaurant?.deliveryTime}</span>
                </div>
                <p className={cn("text-sm mt-2", isDark ? "text-gray-400" : "text-gray-500")}>{restaurant?.tags.join(' • ')}</p>
              </div>

              {/* Menu */}
              <div className="px-4 py-6">
                <h2 className="text-xl font-bold mb-4">{t.popular}</h2>
                <div className="flex flex-col gap-4">
                  {restaurant?.menu.map(item => {
                    const cartItem = cart.find(i => i.itemId === item.id);
                    return (
                      <div key={item.id} className={cn("p-4 rounded-2xl shadow-sm flex gap-4 transition-colors", isDark ? "bg-gray-900" : "bg-white")}>
                        <div className="flex-1">
                          <h3 className="font-bold">{item.name}</h3>
                          <p className={cn("text-sm mt-1 line-clamp-2", isDark ? "text-gray-400" : "text-gray-500")}>{item.description}</p>
                          <p className="font-medium mt-2">{item.price.toFixed(2)} €</p>
                        </div>
                        <div className="relative w-28 h-28 flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                          {cartItem ? (
                            <div className={cn("absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full flex items-center shadow-lg", isDark ? "bg-white text-black" : "bg-black text-white")}>
                              <button onClick={() => removeFromCart(item.id)} className="p-1.5"><Minus className="w-4 h-4" /></button>
                              <span className="px-2 text-sm font-bold">{cartItem.quantity}</span>
                              <button onClick={() => addToCart(item)} className="p-1.5"><Plus className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => addToCart(item)}
                              className={cn("absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full p-2 shadow-lg border", isDark ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black border-gray-100")}
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn("flex-1 overflow-y-auto pb-24 transition-colors", isDark ? "bg-gray-950" : "bg-gray-50")}
            >
              <div className={cn("sticky top-0 z-10 px-4 pt-12 pb-4 shadow-sm transition-colors", isDark ? "bg-gray-900" : "bg-white")}>
                <h1 className="text-3xl font-bold">{t.orders}</h1>
                
                {/* Order Filters */}
                <div className="flex gap-4 mt-6">
                  <button 
                    onClick={() => setOrderFilter('active')}
                    className={cn("pb-2 font-bold transition-colors relative", orderFilter === 'active' ? (isDark ? "text-white" : "text-black") : "text-gray-400")}
                  >
                    {t.activeOrders}
                    {orderFilter === 'active' && (
                      <motion.div layoutId="orderTab" className={cn("absolute bottom-0 left-0 right-0 h-0.5", isDark ? "bg-white" : "bg-black")} />
                    )}
                  </button>
                  <button 
                    onClick={() => setOrderFilter('past')}
                    className={cn("pb-2 font-bold transition-colors relative", orderFilter === 'past' ? (isDark ? "text-white" : "text-black") : "text-gray-400")}
                  >
                    {t.pastOrders}
                    {orderFilter === 'past' && (
                      <motion.div layoutId="orderTab" className={cn("absolute bottom-0 left-0 right-0 h-0.5", isDark ? "bg-white" : "bg-black")} />
                    )}
                  </button>
                </div>
              </div>

              <div className="px-4 py-6 space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className={cn("text-gray-500", isDark ? "text-gray-400" : "")}>Aucune commande trouvée.</p>
                  </div>
                ) : (
                  filteredOrders.map(order => (
                    <div key={order.id} className={cn("p-4 rounded-2xl shadow-sm transition-colors", isDark ? "bg-gray-900" : "bg-white")}>
                      <div 
                        className={cn("flex items-center justify-between mb-4", order.status === 'DELIVERED' && "cursor-pointer")}
                        onClick={() => {
                          if (order.status === 'DELIVERED') {
                            setExpandedOrderId(expandedOrderId === order.id ? null : order.id);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <img src={order.image} alt={order.restaurantName} className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <h3 className="font-bold">{order.restaurantName}</h3>
                            <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>{order.date} • {order.total.toFixed(2)} €</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={cn("text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1", 
                            order.status === 'IN_TRANSIT' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          )}>
                            {order.status === 'IN_TRANSIT' ? <Package className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            {order.status === 'IN_TRANSIT' ? t.inTransit : t.delivered}
                          </span>
                          {order.status === 'DELIVERED' && (
                            expandedOrderId === order.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {expandedOrderId === order.id && order.status === 'DELIVERED' ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className={cn("py-3 border-t text-sm mb-4", isDark ? "border-gray-800" : "border-gray-100")}>
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between mb-2 last:mb-0">
                                  <div className="flex items-center gap-2">
                                    <span className={cn("px-2 py-0.5 rounded border text-xs font-medium", isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600")}>
                                      {item.quantity}x
                                    </span>
                                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>{item.name}</span>
                                  </div>
                                  <span className={isDark ? "text-gray-400" : "text-gray-500"}>{(item.price * item.quantity).toFixed(2)} €</span>
                                </div>
                              ))}
                              <div className={cn("mt-3 pt-3 border-t flex justify-between text-xs", isDark ? "border-gray-800 text-gray-400" : "border-gray-100 text-gray-500")}>
                                <span>{t.deliveryFee}</span>
                                <span>{order.deliveryFee === 0 ? t.free : `${order.deliveryFee.toFixed(2)} €`}</span>
                              </div>
                              <div className={cn("mt-1 flex justify-between font-bold text-sm", isDark ? "text-white" : "text-black")}>
                                <span>{t.total}</span>
                                <span>{order.total.toFixed(2)} €</span>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className={cn("py-3 border-t border-b text-sm mb-4", isDark ? "border-gray-800 text-gray-300" : "border-gray-100 text-gray-600")}>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 mb-1 last:mb-0">
                                <span className={cn("w-1.5 h-1.5 rounded-full", isDark ? "bg-gray-700" : "bg-gray-300")} />
                                {item.quantity}x {item.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </AnimatePresence>

                      <button 
                        onClick={() => {
                          if (order.status === 'IN_TRANSIT') {
                            setTrackingOrder(order);
                          } else {
                            handleReorder(order);
                          }
                        }}
                        className={cn("w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors", 
                        order.status === 'IN_TRANSIT' 
                          ? (isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800")
                          : (isDark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-black hover:bg-gray-200")
                      )}>
                        {order.status === 'IN_TRANSIT' ? t.track : t.reorder}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn("flex-1 overflow-y-auto pb-24 transition-colors", isDark ? "bg-gray-950" : "bg-gray-50")}
            >
              <div className={cn("px-4 pt-12 pb-6 shadow-sm transition-colors", isDark ? "bg-gray-900" : "bg-white")}>
                <h1 className="text-3xl font-bold">{t.profileTitle}</h1>
                <div className="flex items-center gap-4 mt-6">
                  <div className={cn("w-20 h-20 rounded-full flex items-center justify-center text-3xl", isDark ? "bg-gray-800" : "bg-gray-200")}>
                    👤
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{profileData.name}</h2>
                    <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>{profileData.email}</p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-6 space-y-6">
                {/* Personal Info */}
                <div className={cn("p-4 rounded-2xl shadow-sm transition-colors", isDark ? "bg-gray-900" : "bg-white")}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">{t.personalInfo}</h3>
                    <button 
                      onClick={() => {
                        if (isEditingProfile) {
                          handleSaveProfile();
                        } else {
                          setIsEditingProfile(true);
                        }
                      }}
                      className={cn("text-sm font-bold flex items-center gap-1", isDark ? "text-blue-400" : "text-blue-600")}
                    >
                      {isEditingProfile ? <><Check className="w-4 h-4"/> {t.save}</> : <><Edit2 className="w-4 h-4"/> {t.edit}</>}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={cn("text-xs font-medium", isDark ? "text-gray-400" : "text-gray-500")}>{t.name}</label>
                      <input 
                        type="text" 
                        value={profileData.name}
                        onChange={e => setProfileData({...profileData, name: e.target.value})}
                        disabled={!isEditingProfile}
                        className={cn("w-full mt-1 p-2 rounded-lg text-sm transition-colors", isDark ? "bg-gray-800 text-white disabled:bg-transparent disabled:px-0" : "bg-gray-100 text-black disabled:bg-transparent disabled:px-0")}
                      />
                    </div>
                    <div>
                      <label className={cn("text-xs font-medium", isDark ? "text-gray-400" : "text-gray-500")}>{t.email}</label>
                      <input 
                        type="email" 
                        value={profileData.email}
                        onChange={e => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditingProfile}
                        className={cn("w-full mt-1 p-2 rounded-lg text-sm transition-colors", isDark ? "bg-gray-800 text-white disabled:bg-transparent disabled:px-0" : "bg-gray-100 text-black disabled:bg-transparent disabled:px-0")}
                      />
                    </div>
                    <div>
                      <label className={cn("text-xs font-medium", isDark ? "text-gray-400" : "text-gray-500")}>{t.phone}</label>
                      <input 
                        type="tel" 
                        value={profileData.phone}
                        onChange={e => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditingProfile}
                        className={cn("w-full mt-1 p-2 rounded-lg text-sm transition-colors", isDark ? "bg-gray-800 text-white disabled:bg-transparent disabled:px-0" : "bg-gray-100 text-black disabled:bg-transparent disabled:px-0")}
                      />
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className={cn("p-4 rounded-2xl shadow-sm transition-colors", isDark ? "bg-gray-900" : "bg-white")}>
                  <h3 className="font-bold text-lg mb-4">{t.deliveryAddresses}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">Domicile</p>
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>123 Rue de la Livraison, Paris</p>
                      </div>
                      <Edit2 className="w-4 h-4 text-gray-400 cursor-pointer" />
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">Travail</p>
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>45 Avenue du Code, Paris</p>
                      </div>
                      <Edit2 className="w-4 h-4 text-gray-400 cursor-pointer" />
                    </div>
                    <button className={cn("w-full py-3 mt-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors", isDark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-black hover:bg-gray-200")}>
                      <Plus className="w-4 h-4" /> {t.addAddress}
                    </button>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className={cn("p-4 rounded-2xl shadow-sm transition-colors", isDark ? "bg-gray-900" : "bg-white")}>
                  <h3 className="font-bold text-lg mb-4">{t.paymentMethods}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">Visa •••• 4242</p>
                        <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Exp: 12/26</p>
                      </div>
                      <Edit2 className="w-4 h-4 text-gray-400 cursor-pointer" />
                    </div>
                    <button className={cn("w-full py-3 mt-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors", isDark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-black hover:bg-gray-200")}>
                      <Plus className="w-4 h-4" /> {t.addPayment}
                    </button>
                  </div>
                </div>

                {/* Restaurant Dashboard Link */}
                {(profileData as any).role === 'restaurant' || (profileData as any).role === 'admin' ? (
                  <div className={cn("p-4 rounded-2xl shadow-sm transition-colors mb-6", isDark ? "bg-gray-900" : "bg-white")}>
                    <h3 className="font-bold text-lg mb-2">Espace Professionnel</h3>
                    <p className="text-sm text-gray-500 mb-4">Gérez vos commandes et votre restaurant.</p>
                    <a 
                      href="/restaurant"
                      className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors bg-orange-500 text-white hover:bg-orange-600"
                    >
                      Accéder au Dashboard
                    </a>
                  </div>
                ) : null}

                {/* Driver App Link */}
                {(profileData as any).role === 'driver' || (profileData as any).role === 'admin' ? (
                  <div className={cn("p-4 rounded-2xl shadow-sm transition-colors mb-6", isDark ? "bg-gray-900" : "bg-white")}>
                    <h3 className="font-bold text-lg mb-2">Espace Livreur</h3>
                    <p className="text-sm text-gray-500 mb-4">Gérez vos courses et livraisons.</p>
                    <a 
                      href="/driver"
                      className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors bg-green-500 text-white hover:bg-green-600"
                    >
                      Accéder à l'App Livreur
                    </a>
                  </div>
                ) : null}

                {/* Admin App Link */}
                {(profileData as any).role === 'admin' ? (
                  <div className={cn("p-4 rounded-2xl shadow-sm transition-colors mb-6", isDark ? "bg-gray-900" : "bg-white")}>
                    <h3 className="font-bold text-lg mb-2">Administration</h3>
                    <p className="text-sm text-gray-500 mb-4">Gérez les utilisateurs et les rôles.</p>
                    <a 
                      href="/admin"
                      className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors bg-purple-500 text-white hover:bg-purple-600"
                    >
                      Accéder au Dashboard Admin
                    </a>
                  </div>
                ) : null}

                {/* Logout */}
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 rounded-2xl font-bold text-red-500 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" /> {t.logout}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div 
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn("flex-1 overflow-y-auto pb-24 transition-colors", isDark ? "bg-gray-950" : "bg-gray-50")}
            >
              <div className={cn("sticky top-0 z-10 px-4 pt-12 pb-4 shadow-sm transition-colors", isDark ? "bg-gray-900" : "bg-white")}>
                <h1 className="text-3xl font-bold mb-6">{t.search}</h1>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPrompt} 
                    className={cn(
                      "w-full rounded-2xl py-4 pl-12 pr-10 text-sm font-medium focus:outline-none transition-colors shadow-sm",
                      isDark ? "bg-gray-800 text-white placeholder-gray-500" : "bg-white text-black placeholder-gray-400"
                    )}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              <div className="px-4 py-6">
                {searchQuery ? (
                  <div>
                    <h3 className={cn("text-sm font-bold mb-4", isDark ? "text-gray-400" : "text-gray-500")}>
                      {t.resultsFor} "{searchQuery}"
                    </h3>
                    {filteredRestaurants.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {filteredRestaurants.map(restaurant => (
                          <div 
                            key={restaurant.id} 
                            className={cn("p-3 rounded-2xl flex gap-4 cursor-pointer shadow-sm transition-colors", isDark ? "bg-gray-900" : "bg-white")}
                            onClick={() => {
                              setSelectedRestaurant(restaurant.id);
                              setActiveTab('home');
                              setCart([]);
                              setDiscount(0);
                              setPromoCode('');
                              setSearchQuery('');
                            }}
                          >
                            <img src={restaurant.image} alt={restaurant.name} className="w-20 h-20 rounded-xl object-cover" />
                            <div className="flex-1 py-1">
                              <h4 className="font-bold">{restaurant.name}</h4>
                              <p className={cn("text-xs mt-1", isDark ? "text-gray-400" : "text-gray-500")}>{restaurant.tags.join(' • ')}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className={cn("text-xs font-bold flex items-center gap-1", isDark ? "text-white" : "text-black")}>
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {restaurant.rating}
                                </span>
                                <span className={cn("text-xs flex items-center gap-1", isDark ? "text-gray-400" : "text-gray-500")}>
                                  <Clock className="w-3 h-3" /> {restaurant.deliveryTime}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className={cn("text-gray-500", isDark ? "text-gray-400" : "")}>{t.noResults}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-lg mb-4">{CATEGORIES.length} Catégories</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {CATEGORIES.map(cat => (
                        <div 
                          key={cat.id} 
                          onClick={() => setSearchQuery(cat.name)}
                          className={cn("p-4 rounded-2xl flex items-center gap-3 cursor-pointer shadow-sm transition-colors", isDark ? "bg-gray-900 hover:bg-gray-800" : "bg-white hover:bg-gray-50")}
                        >
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl", isDark ? "bg-gray-800" : "bg-gray-100")}>
                            {cat.icon}
                          </div>
                          <span className="font-bold text-sm">{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tracking Overlay */}
        <AnimatePresence>
          {trackingOrder && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn("absolute inset-0 z-[60] flex flex-col", isDark ? "bg-gray-900" : "bg-white")}
            >
              {/* Map Area */}
              <div className="relative flex-1 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" 
                  alt="Map" 
                  className="w-full h-full object-cover opacity-60 dark:opacity-40"
                />
                
                {/* Fake Route Line & Markers */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/2">
                  <svg className="w-full h-full" style={{ overflow: 'visible' }}>
                    <path d="M 20,20 Q 100,150 200,80 T 300,200" fill="none" stroke={isDark ? "#3b82f6" : "#000"} strokeWidth="4" strokeDasharray="8 8" className="animate-pulse" />
                  </svg>
                  <div className="absolute top-[20px] left-[20px] -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-black dark:bg-white rounded-full border-4 border-white dark:border-gray-900 shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white dark:bg-black rounded-full" />
                  </div>
                  <div className="absolute top-[200px] left-[300px] -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900 shadow-lg flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Header Actions */}
                <button 
                  onClick={() => setTrackingOrder(null)} 
                  className={cn("absolute top-12 left-4 p-3 rounded-full shadow-lg", isDark ? "bg-gray-900 text-white" : "bg-white text-black")}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <div className={cn("absolute top-12 right-4 p-3 rounded-2xl shadow-lg text-center min-w-[100px]", isDark ? "bg-gray-900" : "bg-white")}>
                  <p className={cn("text-xs font-medium", isDark ? "text-gray-400" : "text-gray-500")}>{t.estimatedTime}</p>
                  <p className="text-xl font-bold text-green-500">15 min</p>
                </div>
              </div>

              {/* Bottom Sheet */}
              <div className={cn("rounded-t-3xl -mt-6 relative z-10 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]", isDark ? "bg-gray-900" : "bg-white")}>
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6" />
                
                <h2 className="text-2xl font-bold mb-1">{t.driverOnTheWay}</h2>
                <p className={cn("text-sm mb-6", isDark ? "text-gray-400" : "text-gray-500")}>{trackingOrder.restaurantName}</p>

                {/* Driver Info */}
                <div className={cn("flex items-center justify-between mb-8 p-4 rounded-2xl", isDark ? "bg-gray-800" : "bg-gray-50")}>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=100&q=80" alt="Driver" className="w-14 h-14 rounded-full object-cover" />
                      <div className={cn("absolute -bottom-1 -right-1 rounded-full p-0.5", isDark ? "bg-gray-900" : "bg-white")}>
                        <div className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-white" /> 4.9
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-lg">{t.driverName}</p>
                      <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Honda PCX • AB-123-CD</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Timeline */}
                <div className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-800 space-y-8 ml-2 mt-2">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-full border-2 border-white dark:border-gray-900"></div>
                    <p className={cn("font-bold text-sm", isDark ? "text-gray-500" : "text-gray-400")}>{t.preparing}</p>
                    <p className={cn("text-xs", isDark ? "text-gray-600" : "text-gray-400")}>12:15</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                    <p className="font-bold text-sm">{t.pickedUp}</p>
                    <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>12:20</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900 shadow-[0_0_0_4px_rgba(59,130,246,0.2)]"></div>
                    <p className="font-bold text-sm text-blue-500">{t.arriving}</p>
                    <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>Maintenant</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Cart Button */}
        <AnimatePresence>
          {cartItemsCount > 0 && selectedRestaurant && !isCartOpen && activeTab === 'home' && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-20 left-4 right-4 z-20"
            >
              <button 
                onClick={() => setIsCartOpen(true)}
                className={cn("w-full py-4 px-6 rounded-full flex items-center justify-between shadow-xl transition-colors", isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-900")}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", isDark ? "bg-black/10" : "bg-white/20")}>
                    {cartItemsCount}
                  </div>
                  <span className="font-medium">{t.viewCart}</span>
                </div>
                <span className="font-bold">{cartTotal.toFixed(2)} €</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cart Modal */}
        <AnimatePresence>
          {isCartOpen && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn("absolute inset-0 z-50 flex flex-col", isDark ? "bg-gray-900" : "bg-white")}
            >
              <div className={cn("flex items-center justify-between p-4 border-b", isDark ? "border-gray-800" : "border-gray-100")}>
                <h2 className="text-xl font-bold">{t.cartTitle}</h2>
                <button onClick={() => setIsCartOpen(false)} className={cn("p-2 rounded-full", isDark ? "bg-gray-800" : "bg-gray-100")}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {/* Delivery Scheduling in Cart */}
                <div className={cn("p-4 rounded-2xl mb-6 flex items-center gap-4", isDark ? "bg-gray-800" : "bg-gray-50")}>
                  <Calendar className="w-6 h-6 text-blue-500" />
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{t.scheduleDelivery}</h3>
                    <select className={cn("mt-1 text-sm bg-transparent outline-none w-full", isDark ? "text-gray-300" : "text-gray-600")}>
                      <option>{t.today} - {t.deliverNow}</option>
                      <option>{t.today} - 19:00</option>
                      <option>{t.today} - 20:00</option>
                      <option>{t.tomorrow} - 12:00</option>
                    </select>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="flex flex-col gap-4 mb-6">
                  {cart.map(item => (
                    <div key={item.itemId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex items-center gap-2 px-1 py-1 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
                          <button 
                            onClick={() => removeFromCart(item.itemId)}
                            className={cn("p-1 rounded-md transition-colors", isDark ? "hover:bg-gray-800" : "hover:bg-gray-100")}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => addToCart({ id: item.itemId, price: item.price, name: item.name })}
                            className={cn("p-1 rounded-md transition-colors", isDark ? "hover:bg-gray-800" : "hover:bg-gray-100")}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="font-medium">{(item.price * item.quantity).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <div className={cn("flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border", isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50")}>
                      <Tag className="w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder={t.promoCode}
                        className="bg-transparent border-none outline-none text-sm w-full"
                      />
                    </div>
                    <button 
                      onClick={handleApplyPromo}
                      className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-colors", isDark ? "bg-white text-black" : "bg-black text-white")}
                    >
                      {t.apply}
                    </button>
                  </div>
                  {discount > 0 && <p className="text-green-500 text-xs mt-2 font-medium">Code appliqué ! -10%</p>}
                </div>

                {/* Summary */}
                <div className={cn("pt-4 border-t space-y-2", isDark ? "border-gray-800" : "border-gray-100")}>
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>{t.subtotal}</span>
                    <span>{cartSubtotal.toFixed(2)} €</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-500">
                      <span>{t.discount}</span>
                      <span>-{discountAmount.toFixed(2)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? "text-gray-400" : "text-gray-500"}>{t.deliveryFee}</span>
                    <span>{deliveryFee === 0 ? t.free : `${deliveryFee.toFixed(2)} €`}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <div className={cn("p-4 border-t", isDark ? "border-gray-800" : "border-gray-100")}>
                <button 
                  onClick={handleCheckout}
                  className={cn("w-full py-4 rounded-full font-bold text-lg flex justify-between px-6", isDark ? "bg-white text-black" : "bg-black text-white")}
                >
                  <span>{t.checkout}</span>
                  <span>{cartTotal.toFixed(2)} €</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation */}
        <div className={cn("absolute bottom-0 w-full border-t px-6 py-3 flex justify-between items-center z-20 pb-safe transition-colors", isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200")}>
          {[
            { id: 'home', icon: Home, label: t.home },
            { id: 'search', icon: Search, label: t.search },
            { id: 'orders', icon: Receipt, label: t.orders },
            { id: 'profile', icon: User, label: t.profile },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== 'home') setSelectedRestaurant(null);
              }}
              className={cn(
                "flex flex-col items-center gap-1 p-2 transition-colors",
                activeTab === tab.id 
                  ? (isDark ? "text-white" : "text-black") 
                  : (isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600")
              )}
            >
              <tab.icon className={cn("w-6 h-6", activeTab === tab.id && (isDark ? "fill-white/20" : "fill-black/10"))} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
