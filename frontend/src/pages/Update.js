import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Update.css';

const Update = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stockQuantity: '',
        specifications: {}
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/products/${id}`);
            setFormData({
                name: response.data.name || '',
                description: response.data.description || '',
                price: response.data.price || '',
                category: response.data.category || '',
                stockQuantity: response.data.stockQuantity || '',
                specifications: response.data.specifications || {}
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            setError('Failed to load product');
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

    const handleSpecChange = (key, value) => {
        setFormData({
            ...formData,
            specifications: {
                ...formData.specifications,
                [key]: value
            }
        });
    };

    const addSpecification = () => {
        const key = prompt('Enter specification name:');
        if (key) {
            handleSpecChange(key, '');
        }
    };

    const removeSpecification = (key) => {
        const newSpecs = { ...formData.specifications };
        delete newSpecs[key];
        setFormData({
            ...formData,
            specifications: newSpecs
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await axios.put(`/api/vendors/products/${id}`, formData);
            navigate('/vendor/dashboard');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update product');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading">Loading product...</div>;

    return (
        <div className="update-container">
            <h1>Update Product</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="update-form">
                <div className="form-group">
                    <label>Product Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="4"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Price (₹) *</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="form-group">
                        <label>Stock Quantity *</label>
                        <input
                            type="number"
                            name="stockQuantity"
                            value={formData.stockQuantity}
                            onChange={handleChange}
                            required
                            min="0"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="">Select Category</option>
                        <option value="electronics">Electronics</option>
                        <option value="clothing">Clothing</option>
                        <option value="books">Books</option>
                        <option value="home">Home & Living</option>
                        <option value="sports">Sports</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="specifications-section">
                    <div className="section-header">
                        <h3>Specifications</h3>
                        <button type="button" onClick={addSpecification} className="add-spec-btn">
                            + Add Specification
                        </button>
                    </div>
                    
                    {Object.entries(formData.specifications).map(([key, value]) => (
                        <div key={key} className="spec-item">
                            <input
                                type="text"
                                value={key}
                                disabled
                                className="spec-key"
                            />
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => handleSpecChange(key, e.target.value)}
                                placeholder="Value"
                                className="spec-value"
                            />
                            <button 
                                type="button" 
                                onClick={() => removeSpecification(key)}
                                className="remove-spec-btn"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate(-1)} className="cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="submit-btn">
                        {submitting ? 'Updating...' : 'Update Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Update;