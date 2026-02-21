import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const AdminSignup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        businessName: '',
        businessAddress: '',
        gstNumber: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signup } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        // Note: Admin/vendor signup requires approval
        const result = await signup({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            role: 'vendor',
            businessName: formData.businessName,
            businessAddress: formData.businessAddress,
            gstNumber: formData.gstNumber
        });
        
        if (result.success) {
            navigate('/vendor/login', { 
                state: { message: 'Registration submitted for approval. You will be notified once approved.' }
            });
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <h2>Vendor Registration</h2>
                <p>Register your business to start selling</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Owner Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter owner's full name"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Business Name *</label>
                        <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            required
                            placeholder="Enter your business name"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter business email"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="Enter contact number"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Business Address *</label>
                        <textarea
                            name="businessAddress"
                            value={formData.businessAddress}
                            onChange={handleChange}
                            required
                            placeholder="Enter complete business address"
                            rows="3"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>GST Number (Optional)</label>
                        <input
                            type="text"
                            name="gstNumber"
                            value={formData.gstNumber}
                            onChange={handleChange}
                            placeholder="Enter GST number if applicable"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Create a password"
                            minLength="6"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Confirm Password *</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm your password"
                        />
                    </div>
                    
                    <button type="submit" disabled={loading} className="auth-button">
                        {loading ? 'Submitting...' : 'Register as Vendor'}
                    </button>
                </form>
                
                <div className="auth-links">
                    <p>Already have a vendor account? <Link to="/vendor/login">Login</Link></p>
                    <p>Want to shop? <Link to="/user/signup">Create Customer Account</Link></p>
                </div>
            </div>
        </div>
    );
};

export default AdminSignup;