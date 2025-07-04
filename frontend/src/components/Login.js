import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.msg || 'Login failed');
        setLoading(false);
      } else {
        localStorage.setItem('access_token', data.access_token);
        setLoading(false);
        navigate('/profile'); // Redirect to profile after successful login
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
  <div className="login-container">
    <form onSubmit={handleSubmit} className="login-form">
      <h2 className="login-title">Login</h2>

      {error && <p className="error-text">{error}</p>}

      <div>
        <input
          type="email"
          className="login-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <input
          type="password"
          className="login-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="login-button" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p className="register-link">
        New User? <a href="/register">Register here</a>
      </p>
    </form>
  </div>
);
}

export default Login;
