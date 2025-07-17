import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setError('No token found. Please login.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.msg || 'Failed to fetch profile');
        }

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <p className="profile-loading">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <p className="profile-error">{error}</p>
        <button className="profile-button" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2 className="profile-title">Your Profile</h2>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Role:</strong> {profile.role}</p>
      <button className="profile-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Profile;
