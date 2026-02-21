import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const AdminLogin = () => {
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

        const result = await login(email, password, 'admin');
        
        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Admin Login</h2>
                <p>Access the administration panel</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter admin email"
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
                        {loading ? 'Logging in...' : 'Login as Admin'}
                    </button>
                </form>
                
                <div className="auth-links">
                    <p><Link to="/user/login">Login as Customer</Link> | <Link to="/vendor/login">Login as Vendor</Link></p>
                    <p>Don't have admin access? <Link to="/">Contact Super Admin</Link></p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;