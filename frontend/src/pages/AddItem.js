import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AddItem.css';

const AddItem = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stockQuantity: '',
        specifications: {},
        images: []
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [specKey, setSpecKey] = useState('');
    const [specValue, setSpecValue] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAddSpecification = () => {
        if (specKey && specValue) {
            setFormData({
                ...formData,
                specifications: {
                    ...formData.specifications,
                    [specKey]: specValue
                }
            });
            setSpecKey('');
            setSpecValue('');
        }
    };

    const handleRemoveSpecification = (key) => {
        const newSpecs = { ...formData.specifications };
        delete newSpecs[key];
        setFormData({
            ...formData,
            specifications: newSpecs
        });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        // In a real app, you'd upload these to a server/cloud
        // For now, we'll create object URLs
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setFormData({
            ...formData,
            images: [...formData.images, ...imageUrls]
        });
    };

    const handleRemoveImage = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            images: newImages
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await axios.post('/api/vendors/products', formData);
            navigate('/vendor/dashboard');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add product');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="add-item-container">
            <h1>Add New Product</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="add-item-form">
                <div className="form-section">
                    <h2>Basic Information</h2>
                    
                    <div className="form-group">
                        <label>Product Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter product name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Describe your product..."
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
                                placeholder="0.00"
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
                                placeholder="0"
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
                            <option value="food">Food & Beverages</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Images</h2>
                    <div className="image-upload-area">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="file-input"
                            id="image-upload"
                        />
                        <label htmlFor="image-upload" className="upload-label">
                            Click to upload images
                        </label>
                    </div>

                    {formData.images.length > 0 && (
                        <div className="image-preview-grid">
                            {formData.images.map((image, index) => (
                                <div key={index} className="image-preview">
                                    <img src={image} alt={`Preview ${index + 1}`} />
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="remove-image-btn"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <h2>Specifications</h2>
                    
                    <div className="spec-input-group">
                        <input
                            type="text"
                            placeholder="Specification name (e.g., Brand)"
                            value={specKey}
                            onChange={(e) => setSpecKey(e.target.value)}
                            className="spec-key-input"
                        />
                        <input
                            type="text"
                            placeholder="Value (e.g., Samsung)"
                            value={specValue}
                            onChange={(e) => setSpecValue(e.target.value)}
                            className="spec-value-input"
                        />
                        <button 
                            type="button"
                            onClick={handleAddSpecification}
                            className="add-spec-btn"
                        >
                            Add
                        </button>
                    </div>

                    {Object.entries(formData.specifications).map(([key, value]) => (
                        <div key={key} className="spec-item">
                            <span className="spec-key">{key}:</span>
                            <span className="spec-value">{value}</span>
                            <button 
                                type="button"
                                onClick={() => handleRemoveSpecification(key)}
                                className="remove-spec-btn"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate(-1)} className="cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="submit-btn">
                        {submitting ? 'Adding Product...' : 'Add Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddItem;