import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import NavBar from './components/NavBar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import CartPage from './components/CartPage';
import RestaurantPage from './pages/RestaurantPage';
import MyOrders from './components/MyOrders'; // ✅ IMPORTED
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/profile" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/profile" />} />
        
        {/* Restaurant page */}
        <Route path="/restaurant/:restaurantId" element={<RestaurantPage />} />

        {/* Protected Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cart" 
          element={<CartPage />} 
        />
        <Route 
          path="/my-orders" 
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss={false}
        theme="light"
      />
    </Router>
  );
}

export default App;
