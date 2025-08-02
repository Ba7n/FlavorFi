import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { user, loading: authLoading, login } = useAuth();

  // Redirect logged-in users away from login page
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/profile');
    }
  }, [user, authLoading, navigate]);

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
      } else {
        login(data.user, data.token); // context updates state & localStorage
        navigate('/profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form" noValidate>
        <h2 className="login-title">Login</h2>

        {error && <p className="error-text">{error}</p>}

        <div>
          <input
            type="email"
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="login-button"
          disabled={loading || !isFormValid}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="register-link">
          New User? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
