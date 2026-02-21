import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import './UserPortal.css';

const UserPortal = () => {
    const [orders, setOrders] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const [ordersRes, productsRes] = await Promise.all([
                axios.get('/api/orders/my-orders'),
                axios.get('/api/products/featured/limited')
            ]);
            setOrders(ordersRes.data.slice(0, 5)); // Last 5 orders
            setRecentProducts(productsRes.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': '#ff9800',
            'confirmed': '#2196f3',
            'processing': '#9c27b0',
            'shipped': '#3f51b5',
            'delivered': '#4caf50',
            'cancelled': '#f44336'
        };
        return colors[status] || '#999';
    };

    if (loading) return <div className="loading">Loading dashboard...</div>;

    return (
        <div className="user-portal">
            <div className="welcome-section">
                <h1>Welcome back, {user?.name}!</h1>
                <p>Manage your account, track orders, and discover new products</p>
            </div>

            <div className="quick-stats">
                <div className="stat-card" onClick={() => navigate('/cart')}>
                    <span className="stat-icon">🛒</span>
                    <div className="stat-info">
                        <h3>Cart Items</h3>
                        <p>{itemCount}</p>
                    </div>
                </div>
                <div className="stat-card" onClick={() => navigate('/order-status')}>
                    <span className="stat-icon">📦</span>
                    <div className="stat-info">
                        <h3>Total Orders</h3>
                        <p>{orders.length}</p>
                    </div>
                </div>
                <div className="stat-card" onClick={() => navigate('/request-item')}>
                    <span className="stat-icon">📝</span>
                    <div className="stat-info">
                        <h3>Request Item</h3>
                        <p>New Request</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="recent-orders">
                    <h2>Recent Orders</h2>
                    {orders.length > 0 ? (
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id} onClick={() => navigate(`/order-status?id=${order._id}`)}>
                                        <td>{order.orderId}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>₹{order.totalAmount}</td>
                                        <td>
                                            <span 
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                                            >
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <p>No orders yet</p>
                            <button onClick={() => navigate('/products')}>Start Shopping</button>
                        </div>
                    )}
                </div>

                <div className="recommended-products">
                    <h2>Recommended for You</h2>
                    <div className="product-list">
                        {recentProducts.map(product => (
                            <div 
                                key={product._id} 
                                className="product-item"
                                onClick={() => navigate(`/products?id=${product._id}`)}
                            >
                                <div className="product-image">
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.name} />
                                    ) : (
                                        <div className="no-image">📦</div>
                                    )}
                                </div>
                                <div className="product-details">
                                    <h4>{product.name}</h4>
                                    <p className="product-price">₹{product.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <button onClick={() => navigate('/products')}>
                        Browse Products
                    </button>
                    <button onClick={() => navigate('/cart')}>
                        View Cart
                    </button>
                    <button onClick={() => navigate('/request-item')}>
                        Request Custom Item
                    </button>
                    <button onClick={() => navigate('/product-status')}>
                        Track Requests
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserPortal;