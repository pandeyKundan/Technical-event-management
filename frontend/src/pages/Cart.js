import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, totalPrice, loading } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  const handleRemove = async (productId) => {
    if (window.confirm('Remove this item from cart?')) {
      await removeFromCart(productId);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) return <div className="loading">Loading cart...</div>;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any items yet</p>
        <button onClick={() => navigate('/products')} className="shop-now-btn">
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      
      <div className="cart-content">
        <div className="cart-items">
          {cart.items.map(item => (
            <div key={item.productId} className="cart-item">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p className="item-price">₹{item.price}</p>
              </div>
              
              <div className="item-actions">
                <div className="quantity-control">
                  <button 
                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}>
                    +
                  </button>
                </div>
                
                <p className="item-total">₹{item.price * item.quantity}</p>
                
                <button 
                  onClick={() => handleRemove(item.productId)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{totalPrice}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{totalPrice}</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            className="checkout-btn"
            disabled={cart.items.length === 0}
          >
            Proceed to Checkout
          </button>
          
          <button 
            onClick={() => navigate('/products')}
            className="continue-shopping-btn"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;