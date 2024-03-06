const express = require('express')
const adminController = require('../controllers/admin')
const isAuth = require('../middleware/is-auth')
const router = express.Router()

const { body } = require('express-validator')

// * Routes here will start with /admin

// * Addming more middleware, request will go through from left to right
router.get('/add-product', isAuth, adminController.getAddProduct)

router.post('/add-product', [
    body('title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('price')
        .isFloat(),
    body('description')
        .isLength({ min: 5, max: 400 })
        .trim()
],
    isAuth, adminController.postAddProduct)

router.get('/products', isAuth, adminController.getProducts)

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)

router.post('/edit-product', [
    body('title')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('price')
        .isFloat(),
    body('description')
        .isLength({ min: 5, max: 400 })
        .trim()
], isAuth, adminController.postEditProduct)

router.delete('/product/:productId', isAuth, adminController.deleteProduct)

module.exports = router