// src/pages/RestaurantPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import './RestaurantPage.css';

const RestaurantPage = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/restaurants/${restaurantId}/menus`);
        setRestaurant({
          name: res.data.name,
          address: res.data.address,
          restaurant_id: res.data.restaurant_id,
        });
        setMenus(res.data.menus);
      } catch (err) {
        console.error('Error fetching restaurant data:', err);
        toast.error('Failed to load restaurant details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [restaurantId]);

  if (loading) return <p className="loading-text">Loading restaurant...</p>;
  if (!restaurant) return <p className="error-text">Restaurant not found.</p>;

  return (
    <div className="restaurant-container">
      <h2 className="restaurant-title">{restaurant.name}</h2>
      <p className="restaurant-address">{restaurant.address}</p>

      <section className="restaurant-menu-section">
        <h3>Menu</h3>
        <div className="restaurant-menu-list">
          {menus.map((item) => (
            <div key={item.menu_id} className="restaurant-menu-card">
              <img
                src={`/images/${item.image_name || 'placeholder.jpg'}`}
                alt={item.name}
                className="restaurant-menu-img"
              />
              <div className="restaurant-menu-details">
                <h4>{item.name}</h4>
                <p className="restaurant-menu-desc">{item.description}</p>
                <div className="restaurant-menu-footer">
                  <span className="restaurant-menu-price">₹{item.price.toFixed(2)}</span>
                  <button
                    className="restaurant-add-btn"
                    onClick={() => {
                      const added = addToCart(item, restaurant.restaurant_id);
                      if (added) {
                        toast.success(`${item.name} added to cart!`, { position: 'bottom-right' });
                      }
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RestaurantPage;
