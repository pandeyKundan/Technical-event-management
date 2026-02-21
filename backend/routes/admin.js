const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// Get admin dashboard stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'customer' });
        const totalVendors = await User.countDocuments({ role: 'vendor' });
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const revenue = await Order.aggregate([
            { $match: { orderStatus: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            totalUsers,
            totalVendors,
            totalProducts,
            totalOrders,
            revenue: revenue[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all vendors
router.get('/vendors', protect, authorize('admin'), async (req, res) => {
    try {
        const vendors = await User.find({ role: 'vendor' }).select('-password');
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Approve/reject vendor
router.put('/vendors/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const { isActive } = req.body;
        const vendor = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');
        res.json(vendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get pending products
router.get('/products/pending', protect, authorize('admin'), async (req, res) => {
    try {
        const products = await Product.find({ status: 'pending' })
            .populate('vendorId', 'name email');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Approve/reject product
router.put('/products/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all orders
router.get('/orders', protect, authorize('admin'), async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name email')
            .sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get revenue report
router.get('/reports/revenue', protect, authorize('admin'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { orderStatus: 'delivered' };
        
        if (startDate && endDate) {
            query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const revenue = await Order.aggregate([
            { $match: query },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                total: { $sum: '$totalAmount' },
                count: { $sum: 1 }
            }},
            { $sort: { '_id': 1 } }
        ]);

        res.json(revenue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;