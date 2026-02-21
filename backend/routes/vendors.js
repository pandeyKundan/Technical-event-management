const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// Get vendor dashboard stats
router.get('/stats', protect, authorize('vendor'), async (req, res) => {
    try {
        const productsCount = await Product.countDocuments({ vendorId: req.user.id });
        const ordersCount = await Order.countDocuments({ 'items.vendorId': req.user.id });
        const totalRevenue = await Order.aggregate([
            { $match: { 'items.vendorId': req.user.id, orderStatus: 'delivered' } },
            { $unwind: '$items' },
            { $match: { 'items.vendorId': req.user.id } },
            { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
        ]);

        res.json({
            products: productsCount,
            orders: ordersCount,
            revenue: totalRevenue[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get vendor products
router.get('/products', protect, authorize('vendor'), async (req, res) => {
    try {
        const products = await Product.find({ vendorId: req.user.id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add new product
router.post('/products', protect, authorize('vendor'), async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            vendorId: req.user.id,
            status: 'pending' // Needs admin approval
        });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update product
router.put('/products/:id', protect, authorize('vendor'), async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, vendorId: req.user.id },
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete product
router.delete('/products/:id', protect, authorize('vendor'), async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            vendorId: req.user.id
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get vendor orders
router.get('/orders', protect, authorize('vendor'), async (req, res) => {
    try {
        const orders = await Order.find({ 'items.vendorId': req.user.id })
            .populate('userId', 'name email')
            .sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order status
router.put('/orders/:id', protect, authorize('vendor'), async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, 'items.vendorId': req.user.id },
            { orderStatus: status },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;