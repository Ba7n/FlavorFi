import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify'; 

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (token) {
      axios
        .get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch((err) => console.error('Profile error:', err));
    }

    axios.get('http://localhost:5000/restaurants')
      .then(async (res) => {
        const restaurants = res.data;
        const menusData = [];

        for (const r of restaurants) {
          const menuRes = await axios.get(`http://localhost:5000/restaurants/${r.restaurant_id}/menus`);
          menusData.push(...menuRes.data.menus.map(menu => ({
            ...menu,
            restaurant_id: r.restaurant_id,
            restaurant_name: r.name
          })));
        }

        setMenus(menusData);
      })
      .catch(err => console.error('Error loading menus:', err));
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
            <div
              className="menu-card"
              key={item.menu_id}
              onClick={() => navigate(`/restaurant/${item.restaurant_id}`)}
            >
              <img 
                src={`/images/${item.image_name || 'placeholder.jpg'}`} 
                alt={item.name} 
                className="menu-img"
              />
              <h3>{item.name}</h3>
              <p className="restaurant-name">From {item.restaurant_name}</p>
              <p>{item.description}</p>
              <div className="menu-footer">
                <span className="price">₹{item.price.toFixed(2)}</span>
                <button
                  className="add-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent navigating when clicking "Add to Cart"
                    const added = addToCart(item, item.restaurant_id);
                    if (added) {
                      toast.success(`${item.name} added to cart!`, { position: 'bottom-right' });
                    }
                  }}
                >
                  Add to Cart
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
