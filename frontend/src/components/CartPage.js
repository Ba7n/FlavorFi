import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, restaurantId, clearCart, setCartItems } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [placingOrder, setPlacingOrder] = React.useState(false);
  const [address, setAddress] = React.useState('');
  const [promoCode, setPromoCode] = React.useState('');
  const [applyingPromo, setApplyingPromo] = React.useState(false);
  const [discount, setDiscount] = React.useState(0);

  // 🔹 Bill summary calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 300 ? 0 : 40; // free delivery if subtotal > 300
  const finalAmount = subtotal - discount + deliveryFee;

  const increaseQty = (menu_id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.menu_id === menu_id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (menu_id) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.menu_id === menu_id
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (menu_id) => {
    setCartItems((prev) => prev.filter((item) => item.menu_id !== menu_id));
    toast.info("Item removed from cart.");
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    setTimeout(() => {
      if (promoCode.toLowerCase() === 'swiggy10' || promoCode.toLowerCase() === 'zomato10') {
        setDiscount(subtotal * 0.1);
        toast.success('Promo code applied! 10% off');
      } else {
        setDiscount(0);
        toast.error('Invalid promo code');
      }
      setApplyingPromo(false);
    }, 1000);
  };

  const placeOrder = async () => {
    if (!user) {
      toast.error('Please log in to place an order.');
      navigate('/login');
      return;
    }

    if (!token) {
      toast.error('Authentication token missing. Please login again.');
      navigate('/login');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter a delivery address.');
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
          delivery_address: address,
          promo_code: promoCode.trim(),
        }),
      });

      if (response.ok) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate('/');
      } else {
        let errorMsg = 'Something went wrong';
        try {
          const error = await response.json();
          errorMsg = error.msg || errorMsg;
        } catch {
          errorMsg = 'Server error, please try again later';
        }
        toast.error(`❌ Order failed: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Order error:', err);
      toast.error('❌ Server error while placing order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleClearCart = () => {
    toast.info('🧹 Cart cleared.');
    clearCart();
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty. Add some items from the menu!</p>
      ) : (
        <>
          <ul className="cart-items">
            {cartItems.map((item) => (
              <li key={item.menu_id} className="cart-item">
                <img
                  src={`/images/${item.image_name || 'placeholder.jpg'}`}
                  alt={item.name}
                  className="cart-item-img"
                />
                <div className="item-details">
                  <strong>{item.name}</strong>
                  <span className="price">₹{item.price.toFixed(2)}</span>
                  <div className="item-actions">
                    <button onClick={() => decreaseQty(item.menu_id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQty(item.menu_id)}>+</button>
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.menu_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Delivery Address */}
          <section className="address-section">
            <h3>Delivery Address</h3>
            <textarea
              rows={3}
              placeholder="Enter your delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </section>

          {/* Promo Code */}
          <section className="promo-section">
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              disabled={applyingPromo}
            />
            <button onClick={handleApplyPromo} disabled={applyingPromo}>
              {applyingPromo ? 'Applying...' : 'Apply'}
            </button>
          </section>

          {/* ✅ Bill Summary */}
          <section className="bill-summary">
            <h3 className="bill-title">Bill Summary</h3>
            <div className="bill-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            {discount > 0 && (
              <div className="bill-row discount">
                <span>Discount</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}

            <div className="bill-row">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}</span>
            </div>

            <hr />

            <div className="bill-row total">
              <strong>Total Payable</strong>
              <strong>₹{finalAmount.toFixed(2)}</strong>
            </div>
          </section>

          {/* Cart footer */}
          <div className="cart-footer">
            <div className="cart-buttons">
              <button
                className="clear-cart-btn"
                onClick={handleClearCart}
                disabled={placingOrder}
              >
                🗑 Clear
              </button>

              <button
                className="place-order-btn"
                onClick={placeOrder}
                disabled={placingOrder}
              >
                {placingOrder ? (
                  <>
                    <span className="spinner"></span> Placing...
                  </>
                ) : (
                  <>🛒 Place Order</>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
