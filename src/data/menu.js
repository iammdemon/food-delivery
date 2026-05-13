export const INITIAL_MENU = {
  lunch: [
    { id: 'l1', name: 'Premium Rice', price: 20, icon: '🍚' },
    { id: 'l2', name: 'Special Dal', price: 30, icon: '🥣' },
    { id: 'l3', name: 'Chicken Gos', price: 120, icon: '🍗' },
    { id: 'l4', name: 'Beef Gos', price: 150, icon: '🥩' },
    { id: 'l5', name: 'Mixed Veggie', price: 40, icon: '🥗' },
    { id: 'l6', name: 'Fish Fry', price: 90, icon: '🐟' },
  ],
  dinner: [
    { id: 'd1', name: 'Handi Roti', price: 10, icon: '🫓' },
    { id: 'd2', name: 'Tarka Dal', price: 40, icon: '🥣' },
    { id: 'd3', name: 'Mutton Curry', price: 180, icon: '🥘' },
    { id: 'd4', name: 'Egg Omelette', price: 30, icon: '🍳' },
  ]
};

export const DEADLINES = {
  lunch: { hour: 10, minute: 0 },
  dinner: { hour: 23, minute: 59 }
};
