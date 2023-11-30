const adminData = require('./admin')

const express = require('express')
const router = express.Router()

const productsController = require('../controllers/products')

// get / post etc uses EXACT match to path
router.get('/', productsController.getProducts)

module.exports = router