import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, isCustomer } = useAuth();

  useEffect(() => {
    if (isAuthenticated && isCustomer) {
      fetchCart();
    }
  }, [isAuthenticated, isCustomer]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await axios.post('/api/cart/add', { productId, quantity });
      setCart(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to add item' };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await axios.put('/api/cart/update', { productId, quantity });
      setCart(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update' };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await axios.delete(`/api/cart/remove/${productId}`);
      setCart(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to remove' };
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart/clear');
      setCart({ items: [], totalPrice: 0 });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to clear cart' };
    }
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
    itemCount: cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0,
    totalPrice: cart?.totalPrice || 0
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};