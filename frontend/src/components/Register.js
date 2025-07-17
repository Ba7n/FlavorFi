import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        setLoading(false);
      } else {
        setLoading(false);
        navigate('/login');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2 className="register-title">Register</h2>

        {error && <p className="error-text">{error}</p>}

        <input
          type="text"
          className="register-input"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          className="register-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="register-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select
          className="register-input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="customer">Customer</option>
          <option value="owner">Owner</option>
        </select>

        <button type="submit" className="register-button" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </form>
    </div>
  );
}

export default Register;
