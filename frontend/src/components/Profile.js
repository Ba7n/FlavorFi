import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

function Profile() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return; // wait until auth is resolved

    if (!user || !token) {
      navigate('/login');
      return;
    }

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          // Token expired or invalid → force logout and redirect
          logout();
          navigate('/login');
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await res.json();
        if (isMounted) setProfile(data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user, token, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (authLoading || profileLoading) {
    return (
      <div className="profile-container">
        <p className="profile-loading">Loading profile...</p>
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
