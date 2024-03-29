const express = require('express')

const router = express.Router()
const isAuth = require('../middleware/is-auth')

const shopController = require('../controllers/shop')

// get / post etc uses EXACT match to path
router.get('/', shopController.getIndex)

router.get('/products', shopController.getProducts)

// a : indicates a dynamic url. Dynamic url will need to go BELOW specific segments e.g /products/delete
router.get('/products/:productId', shopController.getProduct)

router.get('/cart', isAuth, shopController.getCart)

router.post('/cart', isAuth, shopController.postCart)

router.post('/cart/delete-item', isAuth, shopController.postCartDeleteProduct)

router.get('/checkout', isAuth, shopController.getCheckout)

// ! For testing we can allow redirect to show success
// ! In prod we can use webhook to confirm success
router.get('/checkout/success', shopController.getCheckoutSuccess)

router.get('/checkout/cancel', shopController.getCheckout)

router.get('/orders', isAuth, shopController.getOrders)

router.get('/orders/:orderId', isAuth, shopController.getInvoice)

module.exports = router