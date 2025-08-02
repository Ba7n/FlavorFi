import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // <-- import your AuthContext hook
import './Profile.css';

function Profile() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return; // wait for auth state

    if (!user || !token) {
      // No logged-in user or token, redirect to login
      navigate('/login');
      return;
    }

    let isMounted = true; // to prevent state update after unmount

    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // <-- use token from context
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.msg || 'Failed to fetch profile');
        }

        const data = await res.json();
        if (isMounted) setProfile(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user, token, navigate]);

  const handleLogout = () => {
    logout(); // use logout from context to clear token and user
    navigate('/login');
  };

  const handleGoToLogin = () => {
    setError('');
    setProfileLoading(true);
    navigate('/login');
  };

  if (authLoading || profileLoading) {
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
        <button className="profile-button" onClick={handleGoToLogin}>
          Go to Login
        </button>
      </div>
    );
  }

  const displayProfile = profile || user;

  return (
    <div className="profile-container">
      <h2 className="profile-title">Your Profile</h2>
      <p><strong>Name:</strong> {displayProfile.name}</p>
      <p><strong>Email:</strong> {displayProfile.email}</p>
      <p><strong>Role:</strong> {displayProfile.role}</p>
      <button className="profile-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Profile;
