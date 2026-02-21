import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './RequestItem.css';

const RequestItem = () => {
    const [formData, setFormData] = useState({
        productName: '',
        description: '',
        category: '',
        preferredVendor: '',
        quantity: 1,
        budget: '',
        deadline: ''
    });
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/users/vendors');
            setVendors(response.data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');

        try {
            await axios.post('/api/requests', formData);
            setMessage({ type: 'success', text: 'Request submitted successfully!' });
            setTimeout(() => {
                navigate('/product-status');
            }, 2000);
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to submit request' 
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="request-container">
            <h1>Request a Custom Item</h1>
            <p>Tell us what you're looking for and vendors will quote their prices</p>

            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="request-form">
                <div className="form-section">
                    <h2>Item Details</h2>
                    
                    <div className="form-group">
                        <label>Product Name *</label>
                        <input
                            type="text"
                            name="productName"
                            value={formData.productName}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Custom T-shirts, Wedding Cake"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Describe what you need in detail..."
                            rows="5"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Select Category</option>
                                <option value="clothing">Clothing</option>
                                <option value="electronics">Electronics</option>
                                <option value="food">Food & Catering</option>
                                <option value="decor">Decor & Design</option>
                                <option value="printing">Printing</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Budget (₹)</label>
                            <input
                                type="number"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                placeholder="Expected budget"
                            />
                        </div>

                        <div className="form-group">
                            <label>Deadline</label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Vendor Preferences (Optional)</h2>
                    
                    <div className="form-group">
                        <label>Preferred Vendor</label>
                        <select
                            name="preferredVendor"
                            value={formData.preferredVendor}
                            onChange={handleChange}
                        >
                            <option value="">Any Vendor</option>
                            {vendors.map(vendor => (
                                <option key={vendor._id} value={vendor._id}>
                                    {vendor.businessName || vendor.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate(-1)} className="cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="submit-btn">
                        {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RequestItem;