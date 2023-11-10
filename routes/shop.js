const express = require('express')
const router = express.Router()

// get / post etc uses EXACT match to path
router.get('/', (req, res, next) => {
    res.send('<h1>hello from express</h1>');
})

module.exports = router