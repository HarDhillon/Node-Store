const adminData = require('./admin')

const express = require('express')
const router = express.Router()

const shopController = require('../controllers/shop')

// get / post etc uses EXACT match to path
router.get('/', shopController.getIndex)

router.get('/products', shopController.getProducts)

router.get('/cart', shopController.getCart)

router.get('/orders', shopController.getOrders)

router.get('/checkout', shopController.getCheckout)

module.exports = router