import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  return (
    <nav style={{ marginBottom: '20px' }}>
      <Link to="/" style={{ marginRight: '15px' }}>Home</Link>

      {token ? (
        <>
          <Link to="/profile" style={{ marginRight: '15px' }}>Profile</Link>
          <button onClick={handleLogout} style={{ marginRight: '15px' }}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginRight: '15px' }}>Login</Link>
          <Link to="/register" style={{ marginRight: '15px' }}>Register</Link>
        </>
      )}
    </nav>
  );
}
