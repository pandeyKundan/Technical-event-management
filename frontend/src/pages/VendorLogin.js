import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const VendorLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password, 'vendor');
        
        if (result.success) {
            navigate('/vendor/dashboard');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Vendor Login</h2>
                <p>Access your vendor dashboard</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter vendor email"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter password"
                        />
                    </div>
                    
                    <button type="submit" disabled={loading} className="auth-button">
                        {loading ? 'Logging in...' : 'Login as Vendor'}
                    </button>
                </form>
                
                <div className="auth-links">
                    <p>New vendor? <Link to="/admin/signup">Register as Vendor</Link></p>
                    <p><Link to="/user/login">Login as Customer</Link> | <Link to="/admin/login">Login as Admin</Link></p>
                </div>
            </div>
        </div>
    );
};

export default VendorLogin;