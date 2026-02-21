import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MaintainVendor.css';

const MaintainVendor = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const [vendorsRes, statsRes] = await Promise.all([
                axios.get('/api/admin/vendors'),
                axios.get('/api/admin/vendor-stats')
            ]);
            setVendors(vendorsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveVendor = async (vendorId) => {
        try {
            await axios.put(`/api/admin/vendors/${vendorId}/approve`);
            fetchVendors();
        } catch (error) {
            alert('Failed to approve vendor');
        }
    };

    const handleRejectVendor = async (vendorId) => {
        try {
            await axios.put(`/api/admin/vendors/${vendorId}/reject`);
            fetchVendors();
        } catch (error) {
            alert('Failed to reject vendor');
        }
    };

    const handleStatusToggle = async (vendorId, currentStatus) => {
        try {
            await axios.put(`/api/admin/vendors/${vendorId}/status`, {
                isActive: !currentStatus
            });
            fetchVendors();
        } catch (error) {
            alert('Failed to update vendor status');
        }
    };

    const filteredVendors = vendors.filter(vendor => 
        vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading">Loading vendors...</div>;

    return (
        <div className="maintain-container">
            <h1>Manage Vendors</h1>

            <div className="stats-cards">
                <div className="stat-card">
                    <h3>Total Vendors</h3>
                    <p className="stat-number">{stats.totalVendors || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Pending Approval</h3>
                    <p className="stat-number">{stats.pendingApproval || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Vendors</h3>
                    <p className="stat-number">{stats.activeVendors || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Products</h3>
                    <p className="stat-number">{stats.totalProducts || 0}</p>
                </div>
            </div>
            
            <div className="controls">
                <input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Business Name</th>
                        <th>Owner</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>GST</th>
                        <th>Products</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredVendors.map(vendor => (
                        <tr key={vendor._id}>
                            <td><strong>{vendor.businessName || vendor.name}</strong></td>
                            <td>{vendor.name}</td>
                            <td>{vendor.email}</td>
                            <td>{vendor.phone || '-'}</td>
                            <td>{vendor.gstNumber || '-'}</td>
                            <td>{vendor.productCount || 0}</td>
                            <td>
                                <span className={`status-badge ${vendor.approvalStatus || 'pending'}`}>
                                    {vendor.approvalStatus || 'Pending'}
                                </span>
                                <span className={`status-badge ${vendor.isActive ? 'active' : 'inactive'}`}>
                                    {vendor.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td>
                                {vendor.approvalStatus === 'pending' && (
                                    <>
                                        <button 
                                            onClick={() => handleApproveVendor(vendor._id)}
                                            className="approve-btn"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => handleRejectVendor(vendor._id)}
                                            className="reject-btn"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                <button 
                                    onClick={() => handleStatusToggle(vendor._id, vendor.isActive)}
                                    className="toggle-btn"
                                >
                                    {vendor.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button className="view-btn">View Details</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MaintainVendor;