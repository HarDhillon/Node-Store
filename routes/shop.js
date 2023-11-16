const path = require('path')
const rootDir = require('../util/path')

const express = require('express')
const router = express.Router()

// get / post etc uses EXACT match to path
router.get('/', (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'shop.html'))
})

module.exports = router