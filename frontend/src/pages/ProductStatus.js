import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductStatus.css';

const ProductStatus = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/requests/my-requests');
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(request => {
        if (filter === 'all') return true;
        return request.status === filter;
    });

    const getStatusBadge = (status) => {
        const badges = {
            'pending': { class: 'badge-pending', text: 'Pending' },
            'approved': { class: 'badge-approved', text: 'Approved' },
            'quoted': { class: 'badge-quoted', text: 'Quoted' },
            'in-progress': { class: 'badge-progress', text: 'In Progress' },
            'completed': { class: 'badge-completed', text: 'Completed' },
            'rejected': { class: 'badge-rejected', text: 'Rejected' }
        };
        return badges[status] || { class: 'badge-pending', text: status };
    };

    if (loading) return <div className="loading">Loading requests...</div>;

    return (
        <div className="product-status-container">
            <div className="status-header">
                <h1>My Requests</h1>
                <button onClick={() => navigate('/request-item')} className="new-request-btn">
                    + New Request
                </button>
            </div>

            <div className="filter-tabs">
                <button 
                    className={filter === 'all' ? 'active' : ''} 
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button 
                    className={filter === 'pending' ? 'active' : ''} 
                    onClick={() => setFilter('pending')}
                >
                    Pending
                </button>
                <button 
                    className={filter === 'approved' ? 'active' : ''} 
                    onClick={() => setFilter('approved')}
                >
                    Approved
                </button>
                <button 
                    className={filter === 'completed' ? 'active' : ''} 
                    onClick={() => setFilter('completed')}
                >
                    Completed
                </button>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="empty-state">
                    <p>No requests found</p>
                    <button onClick={() => navigate('/request-item')} className="create-btn">
                        Create Your First Request
                    </button>
                </div>
            ) : (
                <div className="requests-grid">
                    {filteredRequests.map(request => (
                        <div key={request._id} className="request-card">
                            <div className="request-header">
                                <h3>{request.productName}</h3>
                                <span className={`status-badge ${getStatusBadge(request.status).class}`}>
                                    {getStatusBadge(request.status).text}
                                </span>
                            </div>
                            
                            <p className="request-description">{request.description}</p>
                            
                            <div className="request-details">
                                {request.category && (
                                    <div className="detail-item">
                                        <span className="detail-label">Category:</span>
                                        <span>{request.category}</span>
                                    </div>
                                )}
                                {request.quantity && (
                                    <div className="detail-item">
                                        <span className="detail-label">Quantity:</span>
                                        <span>{request.quantity}</span>
                                    </div>
                                )}
                                {request.budget && (
                                    <div className="detail-item">
                                        <span className="detail-label">Budget:</span>
                                        <span>₹{request.budget}</span>
                                    </div>
                                )}
                            </div>

                            {request.assignedVendor && (
                                <div className="vendor-info">
                                    <strong>Assigned Vendor:</strong> {request.assignedVendor.name}
                                </div>
                            )}

                            {request.quotes && request.quotes.length > 0 && (
                                <div className="quotes-section">
                                    <h4>Quotes Received:</h4>
                                    {request.quotes.map((quote, index) => (
                                        <div key={index} className="quote-item">
                                            <span>₹{quote.amount}</span>
                                            <span>{quote.vendorName}</span>
                                            <button className="accept-quote-btn">Accept</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="request-footer">
                                <span className="request-date">
                                    Requested: {new Date(request.createdAt).toLocaleDateString()}
                                </span>
                                {request.status === 'pending' && (
                                    <button className="cancel-request-btn">Cancel</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductStatus;