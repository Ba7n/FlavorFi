import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, restaurantId, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [placingOrder, setPlacingOrder] = React.useState(false);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = async () => {
    if (!user) {
      alert('Please login to place an order.');
      navigate('/login');
      return;
    }

    if (!token) {
      alert('Authentication token missing. Please login again.');
      navigate('/login');
      return;
    }

    setPlacingOrder(true);
    try {
      const response = await fetch('http://localhost:5000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          items: cartItems.map((item) => ({
            menu_id: item.menu_id,
            quantity: item.quantity,
          })),
        }),
      });

      if (response.ok) {
        alert('✅ Order placed successfully!');
        clearCart();
        navigate('/');
      } else {
        const error = await response.json();
        alert(`❌ Order failed: ${error.message || 'Something went wrong'}`);
      }
    } catch (err) {
      console.error('Order error:', err);
      alert('❌ Server error while placing order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear the cart?')) {
      clearCart();
    }
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty. Add some items from the menu!</p>
      ) : (
        <div>
          <ul className="cart-items">
            {cartItems.map((item) => (
              <li key={item.menu_id}>
                {item.name} — ₹{item.price} × {item.quantity}
              </li>
            ))}
          </ul>

          <h3>Total: ₹{totalAmount.toFixed(2)}</h3>

          <button className="clear-cart-btn" onClick={handleClearCart} disabled={placingOrder}>
            Clear Cart
          </button>

          <button className="place-order-btn" onClick={placeOrder} disabled={placingOrder}>
            {placingOrder ? 'Placing Order...' : '🛒 Place Order'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
