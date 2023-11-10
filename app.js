const express = require('express')

const app = express()

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

// bodyParser is now part of express so we can actually just do this
app.use(express.urlencoded({ extended: true }))

app.use(adminRoutes)
app.use(shopRoutes)

app.listen(3000)