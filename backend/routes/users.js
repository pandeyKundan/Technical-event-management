const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Get user profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone, address },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all users (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find({ role: 'customer' }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user by ID (admin only)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, email, role, isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role, isActive },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete user (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;