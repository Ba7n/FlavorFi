import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './MyOrders.css';

const MyOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const normalizedOrders = res.data.map(order => ({
          ...order,
          items: order.items || [],
        }));

        setOrders(normalizedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (loading) return <p>Loading your orders...</p>;
  if (orders.length === 0) return <p>You haven’t placed any orders yet.</p>;

  const toggleExpand = (orderId) => {
    setExpandedOrderId(prev => (prev === orderId ? null : orderId));
  };

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="orders-container">
        {orders.map(order => (
          <div key={order.order_id} className="order-card">
            <div className="order-summary" onClick={() => toggleExpand(order.order_id)}>
              <div>
                <p><strong>Restaurant:</strong> {order.restaurant_name}</p>
                <p><strong>Ordered on:</strong> {new Date(order.order_date).toLocaleString()}</p>
              </div>
              <div className="order-summary-right">
                <p><strong>Total:</strong> ₹{order.total_price?.toFixed(2) || '0.00'}</p>
                <button className="expand-btn">{expandedOrderId === order.order_id ? '▲' : '▼'}</button>
              </div>
            </div>

            {expandedOrderId === order.order_id && (
              <div className="order-details">
                <ul>
                  {order.items.map(item => (
                    <li key={item.menu_id}>
                      {item.name} <span>x{item.quantity}</span> - ₹{item.price_per_item?.toFixed(2) || '0.00'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
