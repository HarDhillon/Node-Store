const path = require('path')

const rootDir = require('../util/path')

const express = require('express')
const router = express.Router()

const products = []

// /admin/add-product => GET
router.get('/add-product', (req, res, next) => {
    // next sends us to the next middleware
    res.render('add-product', {
        pageTitle: 'Add product',
        path: '/admin/add-product',
        formCss: true,
        productCSS: true,
        activeAddProducts: true,
    })
})

// /admin/add-product => POST
router.post('/add-product', (req, res, next) => {
    products.push({ title: req.body.title })
    res.redirect('/')
})

exports.routes = router;
exports.products = products;
