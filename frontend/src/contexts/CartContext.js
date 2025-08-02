import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'cart_items';
const RESTAURANT_ID_KEY = 'cart_restaurant_id';

export const CartProvider = ({ children }) => {
  // Load initial state from localStorage if exists
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [restaurantId, setRestaurantId] = useState(() => {
    return localStorage.getItem(RESTAURANT_ID_KEY) || null;
  });

  // Whenever cartItems changes, save to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Whenever restaurantId changes, save to localStorage
  useEffect(() => {
    if (restaurantId) {
      localStorage.setItem(RESTAURANT_ID_KEY, restaurantId);
    } else {
      localStorage.removeItem(RESTAURANT_ID_KEY);
    }
  }, [restaurantId]);

  const addToCart = (menuItem, restaurant_id) => {
    // Optional: You can add logic here to clear cart if different restaurantId
    setRestaurantId(restaurant_id);
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.menu_id === menuItem.menu_id);
      if (existingItem) {
        return prevItems.map(item =>
          item.menu_id === menuItem.menu_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...menuItem, quantity: 1 }];
      }
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, clearCart, restaurantId }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
