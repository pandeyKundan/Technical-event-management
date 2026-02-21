import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const Admin = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.name}</p>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/admin/users')}>
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>
        
        <div className="stat-card" onClick={() => navigate('/admin/vendors')}>
          <h3>Total Vendors</h3>
          <p className="stat-number">{stats.totalVendors}</p>
        </div>
        
        <div className="stat-card" onClick={() => navigate('/admin/products')}>
          <h3>Total Products</h3>
          <p className="stat-number">{stats.totalProducts}</p>
        </div>
        
        <div className="stat-card" onClick={() => navigate('/admin/orders')}>
          <h3>Total Orders</h3>
          <p className="stat-number">{stats.totalOrders}</p>
        </div>
        
        <div className="stat-card revenue">
          <h3>Revenue</h3>
          <p className="stat-number">₹{stats.revenue}</p>
        </div>
      </div>

      <div className="admin-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => navigate('/admin/users')}>
            Manage Users
          </button>
          <button onClick={() => navigate('/admin/vendors')}>
            Manage Vendors
          </button>
          <button onClick={() => navigate('/admin/products/pending')}>
            Approve Products
          </button>
          <button onClick={() => navigate('/admin/reports')}>
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;