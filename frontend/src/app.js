import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import PrivateRoute from './components/PrivateRoute';

// Auth Pages
import AdminLogin from './pages/AdminLogin';
import VendorLogin from './pages/VendorLogin';
import UserLogin from './pages/UserLogin';
import AdminSignup from './pages/AdminSignup';
import UserSignup from './pages/UserSignup';

// Main Pages
import VendorPage from './pages/VendorPage';
import UserPortal from './pages/UserPortal';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import RequestItem from './pages/RequestItem';
import ProductStatus from './pages/ProductStatus';
import Update from './pages/Update';
import OrderStatus from './pages/OrderStatus';
import Admin from './pages/Admin';
import MaintainUser from './pages/MaintainUser';
import MaintainVendor from './pages/MaintainVendor';
import AddItem from './pages/AddItem';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Auth Routes */}
              <Route path="/" element={<Navigate to="/user/login" />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/signup" element={<AdminSignup />} />
              <Route path="/vendor/login" element={<VendorLogin />} />
              <Route path="/user/login" element={<UserLogin />} />
              <Route path="/user/signup" element={<UserSignup />} />
              
              {/* Protected Routes */}
              <Route path="/vendor/dashboard" element={
                <PrivateRoute role="vendor">
                  <VendorPage />
                </PrivateRoute>
              } />
              <Route path="/vendor/add-item" element={
                <PrivateRoute role="vendor">
                  <AddItem />
                </PrivateRoute>
              } />
              <Route path="/vendor/update/:id" element={
                <PrivateRoute role="vendor">
                  <Update />
                </PrivateRoute>
              } />
              <Route path="/vendor/requests" element={
                <PrivateRoute role="vendor">
                  <RequestItem />
                </PrivateRoute>
              } />
              
              <Route path="/user/portal" element={
                <PrivateRoute role="customer">
                  <UserPortal />
                </PrivateRoute>
              } />
              <Route path="/products" element={
                <PrivateRoute role="customer">
                  <Products />
                </PrivateRoute>
              } />
              <Route path="/cart" element={
                <PrivateRoute role="customer">
                  <Cart />
                </PrivateRoute>
              } />
              <Route path="/checkout" element={
                <PrivateRoute role="customer">
                  <Checkout />
                </PrivateRoute>
              } />
              <Route path="/success" element={
                <PrivateRoute role="customer">
                  <Success />
                </PrivateRoute>
              } />
              <Route path="/request-item" element={
                <PrivateRoute role="customer">
                  <RequestItem />
                </PrivateRoute>
              } />
              <Route path="/product-status" element={
                <PrivateRoute role="customer">
                  <ProductStatus />
                </PrivateRoute>
              } />
              <Route path="/order-status" element={
                <PrivateRoute role="customer">
                  <OrderStatus />
                </PrivateRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <PrivateRoute role="admin">
                  <Admin />
                </PrivateRoute>
              } />
              <Route path="/admin/users" element={
                <PrivateRoute role="admin">
                  <MaintainUser />
                </PrivateRoute>
              } />
              <Route path="/admin/vendors" element={
                <PrivateRoute role="admin">
                  <MaintainVendor />
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;