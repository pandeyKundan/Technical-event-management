import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Checkout.css';

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India'
  });
  const [loading, setLoading] = useState(false);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cart.items,
        totalAmount: totalPrice,
        shippingAddress: address,
        paymentMethod
      };

      const response = await axios.post('/api/orders', orderData);
      
      if (response.data) {
        await clearCart();
        navigate('/success', { state: { orderId: response.data.orderId } });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-section">
            <h2>Shipping Address</h2>
            
            <div className="form-group">
              <label>Street Address *</label>
              <input
                type="text"
                name="street"
                value={address.street}
                onChange={handleAddressChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleAddressChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>ZIP Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={address.zipCode}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  name="country"
                  value={address.country}
                  onChange={handleAddressChange}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Payment Method</h2>
            
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Cash on Delivery</span>
              </label>
              
              <label className="payment-option">
                <input
                  type="radio"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>UPI Payment</span>
              </label>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="place-order-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : `Place Order (₹${totalPrice})`}
          </button>
        </form>
        
        <div className="order-summary">
          <h2>Order Summary</h2>
          
          {cart.items.map(item => (
            <div key={item.productId} className="summary-item">
              <span>{item.name} x {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          
          <div className="summary-total">
            <span>Total</span>
            <span>₹{totalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;