import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const MyOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Normalize orders so items is always an array
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

  if (loading) {
    return <p>Loading your orders...</p>;
  }

  if (orders.length === 0) {
    return <p>You haven’t placed any orders yet.</p>;
  }

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {orders.map(order => (
          <li
            key={order.order_id}
            style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}
          >
            <p><strong>Order ID:</strong> {order.order_id}</p>
            <p><strong>Restaurant:</strong> {order.restaurant_name}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> ₹{order.total_price.toFixed(2)}</p>
            <p><strong>Ordered on:</strong> {new Date(order.order_date).toLocaleString()}</p>

            <h4>Items:</h4>
            <ul>
              {order.items.map(item => (
                <li key={item.menu_id}>
                  {item.name} - Qty: {item.quantity} - Price per item: ₹{item.price_per_item.toFixed(2)}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyOrders;
