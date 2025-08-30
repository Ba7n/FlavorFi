import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

const CART_STORAGE_KEY = 'cart_items';
const RESTAURANT_ID_KEY = 'cart_restaurant_id';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [restaurantId, setRestaurantId] = useState(() => {
    const r = localStorage.getItem(RESTAURANT_ID_KEY);
    return r ? String(r) : null;
  });

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Save restaurant ID
  useEffect(() => {
    if (restaurantId) {
      localStorage.setItem(RESTAURANT_ID_KEY, String(restaurantId));
    } else {
      localStorage.removeItem(RESTAURANT_ID_KEY);
    }
  }, [restaurantId]);

  const addToCart = (menuItem, restaurant_id) => {
    const incomingRestaurantId = restaurant_id != null ? String(restaurant_id) : null;

    if (
      cartItems.length > 0 &&
      restaurantId &&
      incomingRestaurantId &&
      restaurantId !== incomingRestaurantId
    ) {
      toast.warn(
        <div>
          ⚠ You can only order from one restaurant at a time.
          <br />
          <button
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              backgroundColor: '#ff4d4f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={() => {
              clearCart();
              setRestaurantId(incomingRestaurantId);
              setCartItems([{ ...menuItem, quantity: 1 }]);
              toast.dismiss();
              toast.success(`${menuItem.name} added to cart!`, { position: 'bottom-right' });
            }}
          >
            Clear Cart & Add
          </button>
        </div>,
        { position: 'bottom-right', autoClose: false }
      );
      return false; // 🚫 Not added
    }

    setRestaurantId(incomingRestaurantId);
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.menu_id === menuItem.menu_id);
      if (existingItem) {
        return prevItems.map(item =>
          item.menu_id === menuItem.menu_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...menuItem, quantity: 1 }];
    });

    return true; // ✅ Successfully added
  };

  const removeFromCart = (menu_id) => {
    setCartItems(prevItems => prevItems.filter(item => item.menu_id !== menu_id));
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurantId,
        addToCart,
        removeFromCart,
        clearCart,
        setCartItems, // 🔹 Exposed for quantity updates
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
