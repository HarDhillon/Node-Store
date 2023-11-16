const path = require('path')

const rootDir = require('../util/path')

const express = require('express')
const router = express.Router()

// /admin/add-product => GET
router.get('/add-product', (req, res, next) => {
    // next sends us to the next middleware
    res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
})

// /admin/add-product => POST
router.post('/add-product', (req, res, next) => {
    console.log(req.body)
    res.redirect('/')
})

module.exports = router
