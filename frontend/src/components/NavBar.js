import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">FlavorFi</Link>
      </div>
      <div className="navbar-links">
        {token ? (
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
      </div>
    </nav>
  );
}
