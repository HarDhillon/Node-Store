const path = require('path')
const rootDir = require('../util/path')
const adminData = require('./admin')

const express = require('express')
const router = express.Router()

// get / post etc uses EXACT match to path
router.get('/', (req, res, next) => {
    const products = adminData.products
    res.render('shop', { prods: products, pageTitle: 'Shop', path: "/", hasProducts: products.length > 0 })
})

module.exports = router