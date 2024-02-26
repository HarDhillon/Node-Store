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

router.post('/create-order', isAuth, shopController.postOrder)

router.get('/orders', isAuth, shopController.getOrders)


module.exports = router