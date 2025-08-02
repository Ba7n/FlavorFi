import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  // Redirect logged-in users away from register page
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
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.msg || 'Registration failed');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    name.trim() !== '' && email.trim() !== '' && password.trim() !== '';

  // Clear error on input change for better UX
  const handleNameChange = (e) => {
    setName(e.target.value);
    if (error) setError('');
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form" noValidate>
        <h2 className="register-title">Register</h2>

        {error && <p className="error-text">{error}</p>}

        <input
          type="text"
          className="register-input"
          placeholder="Full Name"
          value={name}
          onChange={handleNameChange}
          required
          autoComplete="name"
        />

        <input
          type="email"
          className="register-input"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
          required
          autoComplete="email"
        />

        <input
          type="password"
          className="register-input"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          required
          autoComplete="new-password"
        />

        <select
          className="register-input"
          value={role}
          onChange={handleRoleChange}
        >
          <option value="customer">Customer</option>
          <option value="owner">Owner</option>
        </select>

        <button
          type="submit"
          className="register-button"
          disabled={loading || !isFormValid}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
