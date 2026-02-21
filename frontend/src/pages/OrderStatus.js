import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './OrderStatus.css';

const OrderStatus = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('id');

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (orderId && orders.length > 0) {
            const order = orders.find(o => o._id === orderId || o.orderId === orderId);
            if (order) {
                setSelectedOrder(order);
            }
        }
    }, [orders, orderId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/orders/my-orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusProgress = (status) => {
        const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
        const index = steps.indexOf(status);
        return index >= 0 ? (index / (steps.length - 1)) * 100 : 0;
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

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await axios.put(`/api/orders/${orderId}/cancel`);
                fetchOrders();
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to cancel order');
            }
        }
    };

    if (loading) return <div className="loading">Loading orders...</div>;

    return (
        <div className="order-status-container">
            <h1>Order Status</h1>
            
            {selectedOrder ? (
                <div className="order-detail">
                    <button onClick={() => setSelectedOrder(null)} className="back-btn">
                        ← Back to Orders
                    </button>
                    
                    <div className="order-header">
                        <h2>Order #{selectedOrder.orderId}</h2>
                        <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(selectedOrder.orderStatus) }}
                        >
                            {selectedOrder.orderStatus}
                        </span>
                    </div>

                    <div className="order-timeline">
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ width: `${getStatusProgress(selectedOrder.orderStatus)}%` }}
                            ></div>
                        </div>
                        <div className="timeline-steps">
                            <span className={['pending', 'confirmed', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.orderStatus) >= 0 ? 'active' : ''}>
                                Pending
                            </span>
                            <span className={['confirmed', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.orderStatus) >= 0 ? 'active' : ''}>
                                Confirmed
                            </span>
                            <span className={['processing', 'shipped', 'delivered'].indexOf(selectedOrder.orderStatus) >= 0 ? 'active' : ''}>
                                Processing
                            </span>
                            <span className={['shipped', 'delivered'].indexOf(selectedOrder.orderStatus) >= 0 ? 'active' : ''}>
                                Shipped
                            </span>
                            <span className={selectedOrder.orderStatus === 'delivered' ? 'active' : ''}>
                                Delivered
                            </span>
                        </div>
                    </div>

                    <div className="order-items">
                        <h3>Items</h3>
                        {selectedOrder.items.map((item, index) => (
                            <div key={index} className="order-item">
                                <span>{item.name} x {item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="order-info-grid">
                        <div className="info-card">
                            <h4>Shipping Address</h4>
                            <p>{selectedOrder.shippingAddress?.street}</p>
                            <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                            <p>{selectedOrder.shippingAddress?.zipCode}</p>
                            <p>{selectedOrder.shippingAddress?.country}</p>
                        </div>

                        <div className="info-card">
                            <h4>Payment Details</h4>
                            <p>Method: {selectedOrder.paymentMethod}</p>
                            <p>Status: {selectedOrder.paymentStatus}</p>
                            <p>Total: ₹{selectedOrder.totalAmount}</p>
                        </div>

                        <div className="info-card">
                            <h4>Order Details</h4>
                            <p>Placed on: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                            <p>Last updated: {new Date(selectedOrder.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {selectedOrder.orderStatus === 'pending' && (
                        <button 
                            onClick={() => handleCancelOrder(selectedOrder._id)}
                            className="cancel-order-btn"
                        >
                            Cancel Order
                        </button>
                    )}
                </div>
            ) : (
                <div className="orders-list">
                    {orders.length === 0 ? (
                        <div className="empty-state">
                            <p>No orders found</p>
                            <button onClick={() => navigate('/products')} className="shop-btn">
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div 
                                key={order._id} 
                                className="order-card"
                                onClick={() => setSelectedOrder(order)}
                            >
                                <div className="order-card-header">
                                    <h3>Order #{order.orderId}</h3>
                                    <span 
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                                    >
                                        {order.orderStatus}
                                    </span>
                                </div>
                                <div className="order-card-body">
                                    <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                    <p>Items: {order.items.length}</p>
                                    <p className="order-total">Total: ₹{order.totalAmount}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderStatus;