const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, async (req, res) => {
    try {
        const [cartItems] = await pool.query(`
            SELECT c.id as cart_id, c.quantity, 
                   p.id as product_id, p.name, p.price, p.discount_price, 
                   p.image_url, p.brand, p.stock
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `, [req.userId]);

        let totalMrp = 0;
        let totalDiscount = 0;
        let finalAmount = 0;

        cartItems.forEach(item => {
            const qty = item.quantity;
            totalMrp += item.price * qty;
            
            const sellingPrice = item.discount_price || item.price;
            finalAmount += sellingPrice * qty;
            
            if (item.discount_price) {
                totalDiscount += (item.price - item.discount_price) * qty;
            }
        });

        res.json({
            success: true,
            cartItems,
            pricing: {
                totalMrp,
                totalDiscount,
                deliveryCharges: 0,
                finalAmount
            }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cart!',
            error: error.message
        });
    }
});

router.post('/add', authenticate, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const [products] = await pool.query(
            'SELECT * FROM products WHERE id = ? AND stock > 0',
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or out of stock!'
            });
        }

        const [existingItem] = await pool.query(
            'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
            [req.userId, productId]
        );

        if (existingItem.length > 0) {
            const newQty = existingItem[0].quantity + quantity;
            await pool.query(
                'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
                [newQty, req.userId, productId]
            );
        } else {
            await pool.query(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [req.userId, productId, quantity]
            );
        }

        res.json({
            success: true,
            message: 'Product added to cart!'
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add to cart!',
            error: error.message
        });
    }
});

router.put('/update', authenticate, async (req, res) => {
    try {
        const { cartId, quantity } = req.body;

        if (quantity <= 0) {
            await pool.query(
                'DELETE FROM cart WHERE id = ? AND user_id = ?',
                [cartId, req.userId]
            );
        } else {
            await pool.query(
                'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
                [quantity, cartId, req.userId]
            );
        }

        res.json({
            success: true,
            message: 'Cart updated!'
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart!',
            error: error.message
        });
    }
});

router.delete('/remove/:cartId', authenticate, async (req, res) => {
    try {
        const { cartId } = req.params;

        await pool.query(
            'DELETE FROM cart WHERE id = ? AND user_id = ?',
            [cartId, req.userId]
        );

        res.json({
            success: true,
            message: 'Item removed from cart!'
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove from cart!',
            error: error.message
        });
    }
});

module.exports = router;