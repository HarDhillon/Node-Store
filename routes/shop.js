const adminData = require('./admin')

const express = require('express')
const router = express.Router()

const shopController = require('../controllers/shop')

// get / post etc uses EXACT match to path
router.get('/', shopController.getIndex)

router.get('/products', shopController.getProducts)

// a : indicates a dynamic url. Dynamic url will need to go BELOW specific segments e.g /products/delete
router.get('/products/:productId', shopController.getProduct)

router.get('/cart', shopController.getCart)

router.post('/cart', shopController.postCart)

router.get('/orders', shopController.getOrders)

router.get('/checkout', shopController.getCheckout)

module.exports = router