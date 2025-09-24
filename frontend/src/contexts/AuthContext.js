import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutTimer, setLogoutTimer] = useState(null);

  // helper: logout and clear everything
  const logout = (showToast = false) => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    if (logoutTimer) clearTimeout(logoutTimer);
    if (showToast) {
      toast.error('Your session has expired. Please login again.');
    }
  };

  // set auto logout timer
  const scheduleLogout = (exp) => {
    if (logoutTimer) clearTimeout(logoutTimer); // clear existing timer

    const now = Date.now();
    const timeout = exp * 1000 - now; // exp is in seconds

    if (timeout > 0) {
      const timer = setTimeout(() => logout(true), timeout);
      setLogoutTimer(timer);
    } else {
      logout(true); // already expired
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const decoded = jwtDecode(storedToken);
        const now = Date.now() / 1000; // seconds

        if (decoded.exp && decoded.exp < now) {
          // Clear storage immediately so next refresh won't retrigger
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);

          // Show toast once
          toast.error('Your session has expired. Please login again.');
        } else {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          scheduleLogout(decoded.exp);
        }
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    }

    setLoading(false);

    // Cleanup timer on unmount
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);

    try {
      const decoded = jwtDecode(token);
      scheduleLogout(decoded.exp);
    } catch (err) {
      console.error("Invalid token at login:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
