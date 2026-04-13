export const RESTAURANTS = [
  {
    id: '1',
    name: 'Burger & Co',
    rating: 4.8,
    deliveryTime: '20-30 min',
    deliveryFee: 2.99,
    tags: ['Burgers', 'Américain', 'Fast Food'],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    menu: [
      { id: 'm1', name: 'Classic Cheeseburger', price: 8.99, description: 'Bœuf, cheddar, salade, tomate, sauce maison', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80' },
      { id: 'm2', name: 'Double Bacon Burger', price: 11.99, description: 'Double bœuf, double bacon, cheddar', image: 'https://images.unsplash.com/photo-1594212202875-86ac4ce40b6b?auto=format&fit=crop&w=200&q=80' },
      { id: 'm3', name: 'Frites Maison', price: 3.50, description: 'Portion généreuse de frites croustillantes', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=200&q=80' },
    ]
  },
  {
    id: '2',
    name: 'Sushi Master',
    rating: 4.9,
    deliveryTime: '35-45 min',
    deliveryFee: 0,
    tags: ['Japonais', 'Sushi', 'Sain'],
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    menu: [
      { id: 'm4', name: 'Plateau Maki Mix (18p)', price: 18.50, description: 'Saumon, thon, avocat, cheese', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=200&q=80' },
      { id: 'm5', name: 'California Rolls (8p)', price: 7.90, description: 'Saumon, avocat, sésame', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=200&q=80' },
    ]
  },
  {
    id: '3',
    name: 'Pizza Napoli',
    rating: 4.6,
    deliveryTime: '25-40 min',
    deliveryFee: 1.49,
    tags: ['Italien', 'Pizza', 'Comfort Food'],
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
    menu: [
      { id: 'm6', name: 'Pizza Margherita', price: 12.00, description: 'Sauce tomate, mozzarella di bufala, basilic', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=200&q=80' },
      { id: 'm7', name: 'Pizza 4 Fromages', price: 15.50, description: 'Mozzarella, gorgonzola, chèvre, parmesan', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80' },
    ]
  }
];

export const CATEGORIES = [
  { id: 'c1', name: 'Offres', icon: '🏷️' },
  { id: 'c2', name: 'Courses', icon: '🛒' },
  { id: 'c3', name: 'Burgers', icon: '🍔' },
  { id: 'c4', name: 'Pizza', icon: '🍕' },
  { id: 'c5', name: 'Sushi', icon: '🍣' },
  { id: 'c6', name: 'Sain', icon: '🥗' },
];

export const STORE_TYPES = [
  { id: 'restaurant', name: 'Restaurants', icon: 'Utensils', color: 'bg-orange-500' },
  { id: 'clothing', name: 'Mode', icon: 'Shirt', color: 'bg-purple-500' },
  { id: 'supermarket', name: 'Supermarché', icon: 'ShoppingBasket', color: 'bg-green-500' },
  { id: 'pharmacy', name: 'Pharmacie', icon: 'PlusSquare', color: 'bg-red-500' },
  { id: 'other', name: 'Commerces', icon: 'Store', color: 'bg-blue-500' },
];
