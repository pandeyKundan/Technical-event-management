const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Get user cart
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [], totalPrice: 0 });
            await cart.save();
        }
        
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add item to cart
router.post('/add', protect, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        
        // Get product details
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stockQuantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        let cart = await Cart.findOne({ userId: req.user.id });
        
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
        }

        // Check if product already in cart
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        
        if (itemIndex > -1) {
            // Update existing item
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity,
                vendorId: product.vendorId
            });
        }

        // Update total price
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        cart.updatedAt = Date.now();
        
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update cart item quantity
router.put('/update', protect, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const cart = await Cart.findOne({ userId: req.user.id });
        
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Check stock
        const product = await Product.findById(productId);
        if (product && product.stockQuantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        cart.items[itemIndex].quantity = quantity;
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        cart.updatedAt = Date.now();
        
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove item from cart
router.delete('/remove/:productId', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
        cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        cart.updatedAt = Date.now();
        
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Clear cart
router.delete('/clear', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        
        if (cart) {
            cart.items = [];
            cart.totalPrice = 0;
            cart.updatedAt = Date.now();
            await cart.save();
        }
        
        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;