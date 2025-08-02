import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Home.css';
import { useCart } from '../contexts/CartContext';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  const { addToCart } = useCart();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    let firstRestaurantId;  // Declare here so it's accessible in all .then blocks

    if (token) {
      axios
        .get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch((err) => console.error('Profile error:', err));
    }

    axios.get('http://localhost:5000/restaurants')
      .then(res => {
        firstRestaurantId = res.data[0]?.restaurant_id;
        if (firstRestaurantId) {
          setRestaurantId(firstRestaurantId);
          return axios.get(`http://localhost:5000/restaurants/${firstRestaurantId}/menus`);
        }
      })
      .then(menuRes => {
        if (menuRes) {
          const menusWithRestaurantId = menuRes.data.menus.map(menu => ({
            ...menu,
            restaurant_id: firstRestaurantId,
          }));

          setMenus(menusWithRestaurantId);
        }
      })
      .catch(err => console.error('Menus error:', err));
  }, []);

  return (
    <div className="home-container">
      <header className="hero-section">
        <h1>Welcome to FlavorFi</h1>
        <p className="subtitle">
          {user ? `Hi ${user.name}! Craving something delicious?` : 'Order your favorite meals now!'}
        </p>
      </header>

      <section className="promo-banner">🔥 Get 20% off on your first order!</section>

      <section className="menu-section">
        <h2>Featured Dishes</h2>
        <div className="menu-grid">
          {menus.map((item) => (
            <div className="menu-card" key={item.menu_id}>
              <div className="menu-img-placeholder">🍽️</div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className="menu-footer">
                <span className="price">₹{item.price.toFixed(2)}</span>
                <button
                  className="add-btn"
                  onClick={() => {
                    console.log('Item being added:', item);
                    console.log('restaurantId from item:', item.restaurant_id);
                    addToCart(item, restaurantId);
                    alert(`${item.name} added to cart!`);
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
