const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');

// Create new order
router.post('/', protect, async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

        // Verify stock availability
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product || product.stockQuantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for ${item.name}` 
                });
            }
        }

        // Create order
        const order = new Order({
            userId: req.user.id,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod,
            orderStatus: 'pending',
            paymentStatus: paymentMethod === 'cash' ? 'pending' : 'completed'
        });

        await order.save();

        // Update stock quantities
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stockQuantity: -item.quantity }
            });
        }

        // Clear user's cart
        await Cart.findOneAndUpdate(
            { userId: req.user.id },
            { $set: { items: [], totalPrice: 0 } }
        );

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user orders
router.get('/my-orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns the order or is admin
        if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel order
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns the order
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if order can be cancelled
        if (!['pending', 'confirmed'].includes(order.orderStatus)) {
            return res.status(400).json({ 
                message: 'Order cannot be cancelled at this stage' 
            });
        }

        order.orderStatus = 'cancelled';
        await order.save();

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stockQuantity: item.quantity }
            });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order status (admin/vendor only)
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check authorization
        if (req.user.role === 'vendor') {
            // Vendor can only update their own items
            const hasVendorItems = order.items.some(
                item => item.vendorId.toString() === req.user.id
            );
            if (!hasVendorItems) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        } else if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        order.orderStatus = status;
        
        // Update payment status if order is delivered
        if (status === 'delivered' && order.paymentMethod === 'cash') {
            order.paymentStatus = 'completed';
        }

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get order statistics (admin only)
router.get('/stats/overview', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const stats = await Order.aggregate([
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 },
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;