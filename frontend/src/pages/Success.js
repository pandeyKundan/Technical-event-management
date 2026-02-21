import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Success.css';

const Success = () => {
    const [countdown, setCountdown] = useState(10);
    const navigate = useNavigate();
    const location = useLocation();
    const orderId = location.state?.orderId;

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/user/portal');
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="success-container">
            <div className="success-card">
                <div className="success-icon">✓</div>
                <h1>Order Placed Successfully!</h1>
                <p>Thank you for your purchase</p>
                
                {orderId && (
                    <div className="order-info">
                        <strong>Order ID:</strong> {orderId}
                    </div>
                )}
                
                <div className="success-message">
                    <p>You will receive an order confirmation email shortly.</p>
                    <p>You can track your order status in your dashboard.</p>
                </div>
                
                <div className="success-actions">
                    <button onClick={() => navigate('/products')} className="continue-btn">
                        Continue Shopping
                    </button>
                    <button onClick={() => navigate('/order-status')} className="track-btn">
                        Track Order
                    </button>
                </div>
                
                <p className="redirect-message">
                    Redirecting to dashboard in {countdown} seconds...
                </p>
            </div>
        </div>
    );
};

export default Success;