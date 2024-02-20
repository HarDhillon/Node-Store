const express = require('express')
const adminController = require('../controllers/admin')
const router = express.Router()

// * Routes here will start with /admin

//  GET
router.get('/add-product', adminController.getAddProduct)

// POST
router.post('/add-product', adminController.postAddProduct)

router.get('/products', adminController.getProducts)

router.get('/edit-product/:productId', adminController.getEditProduct)

router.post('/edit-product', adminController.postEditProduct)

// router.post('/delete-product', adminController.postDeleteProduct)

module.exports = router