import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './VendorPage.css';

const VendorPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes] = await Promise.all([
        axios.get('/api/vendors/products'),
        axios.get('/api/vendors/orders')
      ]);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProductStatus = async (productId, status) => {
    try {
      await axios.put(`/api/vendors/products/${productId}`, { status });
      fetchVendorData();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/vendors/orders/${orderId}`, { status });
      fetchVendorData();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="vendor-container">
      <div className="vendor-header">
        <h1>Vendor Dashboard</h1>
        <p>Welcome, {user?.name}</p>
        <button 
          onClick={() => navigate('/vendor/add-item')}
          className="add-product-btn"
        >
          Add New Product
        </button>
      </div>

      <div className="vendor-tabs">
        <button 
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          My Products
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={activeTab === 'requests' ? 'active' : ''}
          onClick={() => setActiveTab('requests')}
        >
          Requests
        </button>
      </div>

      <div className="vendor-content">
        {activeTab === 'products' && (
          <div className="products-tab">
            <h2>My Products</h2>
            <div className="products-grid">
              {products.map(product => (
                <div key={product._id} className="product-card">
                  <h3>{product.name}</h3>
                  <p>Price: ₹{product.price}</p>
                  <p>Stock: {product.stockQuantity}</p>
                  <p>Status: {product.status}</p>
                  <div className="product-actions">
                    <button 
                      onClick={() => navigate(`/vendor/update/${product._id}`)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    {product.status === 'pending' && (
                      <button 
                        onClick={() => updateProductStatus(product._id, 'approved')}
                        className="approve-btn"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-tab">
            <h2>Orders</h2>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>{order.orderId}</td>
                    <td>
                      {order.items.map(item => item.name).join(', ')}
                    </td>
                    <td>
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </td>
                    <td>₹{order.totalAmount}</td>
                    <td>
                      <span className={`status-badge ${order.orderStatus}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="requests-tab">
            <h2>Product Requests</h2>
            {/* Request management UI */}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorPage;