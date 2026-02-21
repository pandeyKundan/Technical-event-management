const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Get all approved products
router.get('/', async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice } = req.query;
        let query = { status: 'approved' };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const products = await Product.find(query)
            .populate('vendorId', 'name')
            .sort('-createdAt');
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('vendorId', 'name email');
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
    try {
        const products = await Product.find({
            category: req.params.category,
            status: 'approved'
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get featured products
router.get('/featured/limited', async (req, res) => {
    try {
        const products = await Product.find({ status: 'approved' })
            .limit(8)
            .sort('-createdAt');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;