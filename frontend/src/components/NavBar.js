import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function NavBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">FlavorFi</Link>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        {/* Always show Cart link */}
        <Link to="/cart" className="cart-link">
          🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
      </div>
    </nav>
  );
}
